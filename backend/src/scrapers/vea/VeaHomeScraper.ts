
import { BaseScraper } from '../BaseScraper.js';
import { QueueFactory } from '../../config/bullmq/QueueFactory.js';
import { JOB_PRIORITIES, StoreName } from '../../config/bullmq/QueueConfig.js';
import { Category } from '../../models/Category.js';
import logger from '../../utils/logger.js';
import { slugify } from '../../utils/slugify.js';

export class VeaHomeScraper extends BaseScraper {
    name = 'VEA_HOME';

    constructor() {
        super(StoreName.VEA);
    }

    canHandle(data: any): boolean {
        return data.action === 'discover-categories';
    }

    async process(): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');

        // Initial navigation to set cookies/session
        await this.page.goto('https://www.vea.com.ar/', { waitUntil: 'domcontentloaded', timeout: 60000 });

        logger.info(`[${this.name}] Fetching full category tree via API...`, { module: 'SCRAPER_NODE' });

        // Fetch Category Tree using Node context
        const nodes = await this.page.context().request.get('https://www.vea.com.ar/api/catalog_system/pub/category/tree/3')
            .then(res => res.json())
            .catch(err => {
                logger.error(`[${this.name}] Failed to fetch category tree: ${err.message}`, { module: 'SCRAPER_NODE' });
                return [];
            });

        if (!nodes || nodes.length === 0) {
            logger.warn(`[${this.name}] API returned 0 categories`, { module: 'SCRAPER_NODE' });
            return;
        }

        logger.info(`[${this.name}] Processing category tree...`, { module: 'SCRAPER_NODE' });

        const queue = QueueFactory.getQueue('scraper-tasks');

        // Recursive function to process tree
        await this.processCategoryTree(nodes, null, queue, '');
    }

    private async processCategoryTree(nodes: any[], parentId: any | null, queue: any, idPath: string): Promise<void> {
        for (const node of nodes) {
            try {
                const currentIdPath = idPath ? `${idPath}/${node.id}` : `${node.id}`;
                let url = node.url || '';
                url = url.replace(/^https?:\/\/[^/]+/, '');

                const generatedSlug = slugify(url) || slugify(node.name) + '-' + node.id;

                // 2. Upsert Category
                const categoryDoc = await Category.findOneAndUpdate(
                    {
                        $or: [
                            { 'storeMappings.vea.externalId': node.id },
                            { name: node.name, 'storeMappings.vea': { $exists: true }, parentCategory: parentId },
                            { slug: generatedSlug }
                        ]
                    },
                    {
                        name: node.name,
                        slug: generatedSlug,
                        url: url,
                        active: true,
                        lastScraped: new Date(),
                        parentCategory: parentId,
                        level: parentId ? 1 : 0,
                        $set: {
                            'storeMappings.vea': {
                                externalId: node.id,
                                url: url,
                                idPath: currentIdPath
                            }
                        }
                    },
                    { upsert: true, new: true }
                );

                if (!categoryDoc) continue;

                // 3. Queue Product Discovery if Leaf Node
                if (!node.children || node.children.length === 0) {
                    await queue.add('SCRAPE_PRODUCTS', {
                        store: StoreName.VEA,
                        action: 'scrape-products',
                        categoryId: categoryDoc._id,
                        externalId: node.id,
                        url: url,
                        idPath: currentIdPath
                    }, {
                        priority: JOB_PRIORITIES.DISCOVER
                    });
                } else {
                    // Recursively process children
                    await this.processCategoryTree(node.children, categoryDoc._id, queue, currentIdPath);
                }

            } catch (error) {
                logger.error(`[${this.name}] Error processing category ${node.name}: ${error instanceof Error ? error.message : 'Unknown'}`, {
                    module: 'SCRAPER_NODE'
                });
            }
        }
    }
}
