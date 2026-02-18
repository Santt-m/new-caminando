
import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        const stores = ['jumbo', 'vea', 'disco'];
        console.log('\n--- ID Path Population Check ---');
        for (const store of stores) {
            const count = await Category.countDocuments({ [`storeMappings.${store}`]: { $exists: true } });
            const withPath = await Category.countDocuments({ [`storeMappings.${store}.idPath`]: { $exists: true } });
            console.log(`${store.toUpperCase()}: ${count} categories, ${withPath} with idPath`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

run();
