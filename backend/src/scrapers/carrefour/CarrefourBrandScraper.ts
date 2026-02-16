import { BaseScraper } from '../BaseScraper.js';
import { QueueFactory } from '../../config/bullmq/QueueFactory.js';
import { JOB_PRIORITIES } from '../../config/bullmq/QueueConfig.js';
import { Brand } from '../../models/Brand.js';
import logger from '../../utils/logger.js';

export class CarrefourBrandScraper extends BaseScraper {
    name = 'CARREFOUR_BRAND';

    constructor() {
        super('carrefour');
    }

    canHandle(data: any): boolean {
        return data.action === 'discover-brands' && data.url;
    }

    async process(data: any): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');
        const { url, categoryId } = data;

        if (!url.startsWith('http')) {
            await this.page.goto(`https://www.carrefour.com.ar${url}`, { waitUntil: 'domcontentloaded' });
        } else {
            await this.page.goto(url, { waitUntil: 'domcontentloaded' });
        }

        try {
            // Wait for filters to load
            const sidebarSelector = '.valtech-carrefourar-search-result-3-x-filterNavigator, .vtex-search-result-3-x-filterNavigator';
            await this.page.waitForSelector(sidebarSelector, { timeout: 10000 });

            // Specific selector for Brand container
            const brandContainerSelector = '.valtech-carrefourar-search-result-3-x-filter__container--brand';
            let brands: string[] = [];

            try {
                const brandContainer = await this.page.$(brandContainerSelector);
                if (brandContainer) {
                    // Expand "Ver más" if exists
                    const seeMoreBtn = await brandContainer.$('button[class*="seeMoreButton"]');
                    if (seeMoreBtn) {
                        try {
                            await seeMoreBtn.click();
                            await this.page.waitForTimeout(500);
                        } catch (e) { /* ignore */ }
                    }

                    brands = await brandContainer.evaluate((el) => {
                        const items = Array.from(el.querySelectorAll('.valtech-carrefourar-search-result-3-x-filterItem'));
                        return items.map(item => {
                            const label = item.querySelector('.vtex-checkbox__label');
                            if (!label) return null;
                            const clone = label.cloneNode(true) as HTMLElement;
                            const countSpan = clone.querySelector('.valtech-carrefourar-search-result-3-x-productCount');
                            if (countSpan) countSpan.remove();
                            return clone.textContent?.trim();
                        }).filter(Boolean) as string[];
                    });
                }
            } catch (err) {
                logger.warn(`Error extracting brands with specific selector: ${err}`);
            }

            // Fallback if specific extraction yielded nothing (e.g. if class names changed)
            if (brands.length === 0) {
                brands = await this.page.evaluate(() => {
                    const titles = Array.from(document.querySelectorAll('.vtex-search-result-3-x-filterTitle'));
                    const brandTitle = titles.find(t => t.textContent?.trim().toLowerCase() === 'marca');
                    if (!brandTitle) return [];
                    const filterContainer = brandTitle.parentElement?.nextElementSibling;
                    if (!filterContainer) return [];
                    const labels = Array.from(filterContainer.querySelectorAll('.vtex-search-result-3-x-filterItemLabel, .vtex-checkbox__label'));
                    return labels.map(l => l.textContent?.trim()).filter(Boolean) as string[];
                });
            }

            logger.info(`[${this.name}] Encontradas ${brands.length} marcas en ${url}`, { module: 'SCRAPER_NODE' });

            for (const brandName of brands) {
                if (!brandName) continue;

                await Brand.findOneAndUpdate(
                    { name: brandName }, // We assume brands are global, not per store, or we namespace them? User said "database of brands".
                    {
                        active: true,
                        lastScraped: new Date()
                    },
                    { upsert: true }
                );
            }

            // Once brands are discovered, we can queue Product Scraping for this category
            const queue = QueueFactory.getQueue('scraper-tasks');
            await queue.add('SCRAPE_PRODUCT', {
                store: 'carrefour',
                action: 'scrape-products',
                categoryId: categoryId,
                url: url
            }, {
                priority: JOB_PRIORITIES.SCRAPE_PRODUCT
            });

        } catch (e) {
            logger.warn(`[${this.name}] No se pudieron extraer marcas de ${url}`, { module: 'SCRAPER_NODE' });
            // Fallback: Queue product scraping anyway, maybe products have brand info
            const queue = QueueFactory.getQueue('scraper-tasks');
            await queue.add('SCRAPE_PRODUCT', {
                store: 'carrefour',
                action: 'scrape-products',
                categoryId: categoryId,
                url: url
            }, {
                priority: JOB_PRIORITIES.SCRAPE_PRODUCT
            });
        }
    }
}
