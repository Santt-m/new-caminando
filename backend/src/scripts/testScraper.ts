
import { connectDB } from '../config/db.js';
import { BrowserFactory } from '../config/browser/BrowserFactory.js';
import logger from '../utils/logger.js';

// Import scrapers
import { JumboHomeScraper } from '../scrapers/jumbo/JumboHomeScraper.js';
import { JumboProductScraper } from '../scrapers/jumbo/JumboProductScraper.js';
import { VeaHomeScraper } from '../scrapers/vea/VeaHomeScraper.js';
import { VeaProductScraper } from '../scrapers/vea/VeaProductScraper.js';
import { DiscoHomeScraper } from '../scrapers/disco/DiscoHomeScraper.js';
import { DiscoProductScraper } from '../scrapers/disco/DiscoProductScraper.js';
import { CarrefourHomeScraper } from '../scrapers/carrefour/CarrefourHomeScraper.js';
import { CarrefourProductScraper } from '../scrapers/carrefour/CarrefourProductScraper.js';

async function runTest() {
    const args = process.argv.slice(2);
    const storeArg = args.find(a => a.startsWith('--store='))?.split('=')[1];
    const actionArg = args.find(a => a.startsWith('--action='))?.split('=')[1];
    const categoryIdArg = args.find(a => a.startsWith('--categoryId='))?.split('=')[1];
    const externalIdArg = args.find(a => a.startsWith('--externalId='))?.split('=')[1];
    const urlArg = args.find(a => a.startsWith('--url='))?.split('=')[1];
    const idPathArg = args.find(a => a.startsWith('--idPath='))?.split('=')[1];

    if (!storeArg || !actionArg) {
        console.error('Usage: npx tsx src/scripts/testScraper.ts --store=<store> --action=<action> [--categoryId=<id>] [--externalId=<id>] [--url=<url>] [--idPath=<path>]');
        process.exit(1);
    }

    try {
        await connectDB();
        const browserFactory = BrowserFactory.getInstance();
        await browserFactory.init();

        let scraper;

        if (storeArg === 'jumbo') {
            if (actionArg === 'discover-categories') scraper = new JumboHomeScraper();
            if (actionArg === 'scrape-products') scraper = new JumboProductScraper();
        } else if (storeArg === 'vea') {
            if (actionArg === 'discover-categories') scraper = new VeaHomeScraper();
            if (actionArg === 'scrape-products') scraper = new VeaProductScraper();
        } else if (storeArg === 'disco') {
            if (actionArg === 'discover-categories') scraper = new DiscoHomeScraper();
            if (actionArg === 'scrape-products') scraper = new DiscoProductScraper();
        } else if (storeArg === 'carrefour') {
            if (actionArg === 'discover-categories') scraper = new CarrefourHomeScraper();
            if (actionArg === 'scrape-products') scraper = new CarrefourProductScraper();
        }

        if (!scraper) {
            throw new Error(`No scraper found for store: ${storeArg} and action: ${actionArg}`);
        }

        const data = {
            store: storeArg,
            action: actionArg,
            categoryId: categoryIdArg,
            externalId: externalIdArg,
            url: urlArg,
            idPath: idPathArg
        };

        logger.info(`Starting manual test for ${storeArg} - ${actionArg}`, { module: 'SCRAPER', data });

        await scraper.execute(data);

        logger.info('Test completed successfully');
    } catch (error) {
        logger.error('Test failed', { error: error instanceof Error ? error.message : String(error) });
    } finally {
        const browserFactory = BrowserFactory.getInstance();
        await browserFactory.close();
        process.exit(0);
    }
}

runTest();
