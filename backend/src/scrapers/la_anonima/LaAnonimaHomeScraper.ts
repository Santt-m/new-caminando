import { BaseScraper } from '../BaseScraper.js';
import { QueueFactory } from '../../config/bullmq/QueueFactory.js';
import { JOB_PRIORITIES, StoreName } from '../../config/bullmq/QueueConfig.js';
import { Category } from '../../models/Category.js';
import logger from '../../utils/logger.js';
import { slugify } from '../../utils/slugify.js';
import { getQueueName } from '../../workers/scraper.worker.js';

export class LaAnonimaHomeScraper extends BaseScraper {

    name = 'LA_ANONIMA_HOME';

    constructor() {
        super(StoreName.LA_ANONIMA);
    }

    canHandle(data: any): boolean {
        return data.action === 'discover-categories';
    }

    async process(): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');

        logger.info(`[${this.name}] Fetching home page for category extraction...`, { module: 'SCRAPER_NODE' });

        await this.page.goto('https://www.laanonima.com.ar/', { waitUntil: 'domcontentloaded', timeout: 60000 });

        const extractedCategories = await this.page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('a[class*="menu-n"]'));
            const categories: any[] = [];

            let lastN1Id: string | null = null;
            let lastN2Id: string | null = null;

            for (const el of elements) {
                const a = el as HTMLAnchorElement;
                const href = a.href;
                if (!href || !href.includes('/n')) continue;

                const name = a.getAttribute('data-action') || a.textContent?.trim() || '';
                if (!name) continue;

                const match = href.match(/n([1-3])_(\d+)/);
                if (!match) continue;

                const level = parseInt(match[1]);
                const id = match[2];
                let parentId = null;

                if (level === 1) {
                    lastN1Id = id;
                    lastN2Id = null; // Reset N2 when new N1 starts
                } else if (level === 2) {
                    parentId = lastN1Id;
                    lastN2Id = id;
                } else if (level === 3) {
                    parentId = lastN2Id || lastN1Id; // Fallback to N1 if N2 is missing for some reason
                }

                // Avoid duplicates that sometimes appear in mobile/desktop separate menus
                if (!categories.find(c => c.id === id)) {
                    categories.push({ name, url: href, level, id, parentId });
                }
            }

            return categories;
        });

        if (!extractedCategories || extractedCategories.length === 0) {
            logger.warn(`[${this.name}] No categories found in the DOM`, { module: 'SCRAPER_NODE' });
            return;
        }

        logger.info(`[${this.name}] Successfully extracted ${extractedCategories.length} categories`, { module: 'SCRAPER_NODE' });

        const queue = QueueFactory.getQueue(getQueueName(StoreName.LA_ANONIMA));
        const idToDocIdMap = new Map<string, any>(); // Map to store ObjectIds of saved categories

        // Process sequentially so parents are created before children
        for (const cat of extractedCategories) {
            try {
                let parentCategoryDocId = cat.parentId ? idToDocIdMap.get(cat.parentId) : null;

                let urlPath = cat.url.replace(/^https?:\/\/[^/]+/, '');
                const generatedSlug = slugify(urlPath) || slugify(cat.name) + '-' + cat.id;

                const categoryDoc = await Category.findOneAndUpdate(
                    {
                        $or: [
                            { 'storeMappings.la_anonima.externalId': cat.id },
                            { slug: generatedSlug } // Fallback to avoid dupes across stores with same slug
                        ]
                    },
                    {
                        name: cat.name,
                        slug: generatedSlug,
                        url: urlPath,
                        active: true,
                        lastScraped: new Date(),
                        parentCategory: parentCategoryDocId,
                        level: cat.level,
                        $set: {
                            'storeMappings.la_anonima': {
                                externalId: cat.id,
                                url: cat.url,
                                path: urlPath
                            }
                        }
                    },
                    { upsert: true, new: true }
                );

                if (categoryDoc) {
                    idToDocIdMap.set(cat.id, categoryDoc._id);
                    cat.docId = categoryDoc._id; // Attach docId to identifying leaves later
                }
            } catch (error) {
                logger.error(`[${this.name}] Error saving category ${cat.name}: ${error instanceof Error ? error.message : 'Unknown'}`, { module: 'SCRAPER_NODE' });
            }
        }

        // Identify leaf nodes (categories that do NOT appear as parentId in any other category)
        const allParentIds = new Set(extractedCategories.map((c: any) => c.parentId).filter(Boolean));
        const leafCategories = extractedCategories.filter((c: any) => !allParentIds.has(c.id) && c.docId);

        logger.info(`[${this.name}] Queueing ${leafCategories.length} leaf categories for product scraping`, { module: 'SCRAPER_NODE' });

        for (const leaf of leafCategories) {
            await queue.add('SCRAPE_PRODUCTS', {
                store: StoreName.LA_ANONIMA,
                action: 'scrape-products',
                categoryId: leaf.docId,
                externalId: leaf.id,
                url: leaf.url
            }, {
                priority: JOB_PRIORITIES.DISCOVER
            });
        }
    }
}
