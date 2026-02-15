
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..', '..'); // Assuming script is in frontend/scripts/
const FRONTEND_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(FRONTEND_ROOT, 'public');
const LOGOS_DIR = path.join(PUBLIC_DIR, 'logos');

// Source files are expected in the project root (caminando.online/)
const SOURCE_DIR = PROJECT_ROOT;

const ASSETS = {
    favicon: 'caminando-Favicon.png',
    logo: 'caminando-logo.png',
    supermarkets: {
        carrefour: 'carrefour_logo.png',
        coto: 'coto_logo.png',
        dia: 'día_logo.png', // Note source name
        disco: 'disco_logo.png',
        jumbo: 'jumbo_logo.png',
        vea: 'vea_logo.png'
    }
};

async function ensureDir(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

async function generatePWAIcons() {
    console.log('Generating PWA icons...');
    const sourcePath = path.join(SOURCE_DIR, ASSETS.favicon);

    try {
        await fs.access(sourcePath);
    } catch (e) {
        console.error(`Source file not found: ${sourcePath}`);
        return;
    }

    const image = sharp(sourcePath);

    // Standard PWA icons
    await image.resize(192, 192).toFile(path.join(PUBLIC_DIR, 'pwa-192x192.png'));
    await image.resize(512, 512).toFile(path.join(PUBLIC_DIR, 'pwa-512x512.png'));

    // Apple Touch Icon
    await image.resize(180, 180).toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));

    // Favicon (ico) - sharp can output to png, then we might need to rely on browser support or use a different tool for .ico if strictly needed. 
    // Modern browsers support png favicons. We'll make a 64x64 png and call it favicon.png for now, and update index.html
    await image.resize(64, 64).toFile(path.join(PUBLIC_DIR, 'favicon.png'));

    console.log('PWA icons generated.');
}

async function generateLogos() {
    console.log('Generating optimized logos...');

    await ensureDir(LOGOS_DIR);

    // Main Logo
    const mainLogoPath = path.join(SOURCE_DIR, ASSETS.logo);
    try {
        await sharp(mainLogoPath)
            .resize({ height: 80 }) // Reasonable height for header/footer
            .png({ quality: 90 })
            .toFile(path.join(PUBLIC_DIR, 'logo.png'));
        console.log('Main logo generated.');
    } catch (e) {
        console.error(`Error processing main logo: ${e.message}`);
    }

    // Supermarket Logos
    for (const [name, filename] of Object.entries(ASSETS.supermarkets)) {
        const sourcePath = path.join(SOURCE_DIR, filename);
        const destPath = path.join(LOGOS_DIR, `${name}.png`);

        try {
            await sharp(sourcePath)
                .resize({ height: 48, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
                .png({ quality: 85 })
                .toFile(destPath);
            console.log(`Generated logo for ${name}`);
        } catch (e) {
            console.log(`Skipping ${name} (file not found or error: ${e.message})`);
        }
    }
}

async function main() {
    await ensureDir(PUBLIC_DIR);
    await generatePWAIcons();
    await generateLogos();
}

main().catch(console.error);
