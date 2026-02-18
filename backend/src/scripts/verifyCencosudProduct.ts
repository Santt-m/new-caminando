
import mongoose from 'mongoose';
import { JumboProductScraper } from '../scrapers/jumbo/JumboProductScraper.js';
import { VeaProductScraper } from '../scrapers/vea/VeaProductScraper.js';
import { DiscoProductScraper } from '../scrapers/disco/DiscoProductScraper.js';
import { Category } from '../models/Category.js';
import { Product as ProductEnhanced } from '../models/ProductEnhanced.js';
import { connectRedis } from '../config/redis.js';
import dotenv from 'dotenv';
import path from 'path';
import { StoreName } from '../config/bullmq/QueueConfig.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const testStore = async (storeName: string, ScraperClass: any) => {
    console.log(`\n--- Testing ${storeName.toUpperCase()} Product Scraper ---`);

    // Pick a subcategory (level 1) that has idPath
    const category = await Category.findOne({
        [`storeMappings.${storeName}.idPath`]: { $exists: true },
        level: 1
    });

    if (!category) {
        console.warn(`⚠️ No ${storeName} subcategories with idPath found!`);
        return;
    }

    const mapping = (category as any).storeMappings[storeName];
    const externalId = mapping.externalId;
    const idPath = mapping.idPath;
    const catUrl = mapping.url;

    console.log(`🎯 Target Category: ${category.name} (ID: ${externalId}, Path: ${idPath})`);

    const scraper = new ScraperClass();
    await scraper.execute({
        action: 'scrape-products',
        externalId: externalId,
        categoryId: category._id,
        url: catUrl,
        idPath: idPath
    });

    const prodCount = await ProductEnhanced.countDocuments({
        'sources.store': storeName,
        'category': category._id
    });
    console.log(`✅ Scraped products for this category: ${prodCount}`);

    const sample = await ProductEnhanced.findOne({
        'sources.store': storeName,
        'category': category._id
    });

    if (sample) {
        console.log(`📦 Sample: ${sample.name} - $${sample.price}`);
    }
};

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        await connectRedis();

        await testStore(StoreName.JUMBO, JumboProductScraper);
        await testStore(StoreName.VEA, VeaProductScraper);
        await testStore(StoreName.DISCO, DiscoProductScraper);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

run();
