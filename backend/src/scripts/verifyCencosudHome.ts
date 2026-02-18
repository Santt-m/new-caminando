
import mongoose from 'mongoose';
import { JumboHomeScraper } from '../scrapers/jumbo/JumboHomeScraper.js';
import { VeaHomeScraper } from '../scrapers/vea/VeaHomeScraper.js';
import { DiscoHomeScraper } from '../scrapers/disco/DiscoHomeScraper.js';
import { connectRedis } from '../config/redis.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        await connectRedis();

        console.log('🐘 Testing Cencosud Home Scrapers (Jumbo, Vea, Disco)...');

        console.log('\n--- 1. Jumbo ---');
        const jumbo = new JumboHomeScraper();
        await jumbo.execute({ action: 'discover-categories' });

        console.log('\n--- 2. Vea ---');
        const vea = new VeaHomeScraper();
        await vea.execute({ action: 'discover-categories' });

        console.log('\n--- 3. Disco ---');
        const disco = new DiscoHomeScraper();
        await disco.execute({ action: 'discover-categories' });

        console.log('\n✅ All home scrapers finished successfully.');

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

run();
