import { chromium } from 'playwright-extra';
import { Browser, BrowserContext, BrowserContextOptions } from 'playwright';
import { createPool, Pool } from 'generic-pool';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import logger from '../../utils/logger.js';
import { env } from '../env.js';

// Usar el plugin de sigilo
chromium.use(StealthPlugin());

export class BrowserFactory {
    private static instance: BrowserFactory;
    private pool: Pool<Browser>;

    private constructor() {
        logger.info('Inicializando Pool de navegadores...', { module: 'BROWSER' });

        this.pool = createPool({
            create: async (): Promise<Browser> => {
                const headless = env.nodeEnv === 'production';
                logger.info(`Creando nueva instancia de navegador (Headless: ${headless})...`, { module: 'BROWSER' });

                const browser = await chromium.launch({
                    headless,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu',
                    ],
                });
                return browser;
            },
            destroy: async (browser: Browser): Promise<void> => {
                logger.info('Destruyendo instancia de navegador...', { module: 'BROWSER' });
                await browser.close();
            },
            validate: async (browser: Browser): Promise<boolean> => {
                return browser.isConnected();
            }
        }, {
            min: 1,                         // Mantener al menos 1 navegador listo
            max: 4,                         // Máximo 4 navegadores simultáneos para ahorrar recursos
            acquireTimeoutMillis: 60000,    // 60s para adquirir
            idleTimeoutMillis: 600000,      // 10 minutos idle
            evictionRunIntervalMillis: 120000, // Chequear cada 2min
            testOnBorrow: true,             // Validar que el navegador funciona
        });

        this.pool.on('factoryCreateError', (err) => {
            logger.error('Error creando navegador en el pool', err, { module: 'BROWSER' });
        });

        this.pool.on('factoryDestroyError', (err) => {
            logger.error('Error destruyendo navegador en el pool', err, { module: 'BROWSER' });
        });
    }

    public static getInstance(): BrowserFactory {
        if (!BrowserFactory.instance) {
            BrowserFactory.instance = new BrowserFactory();
        }
        return BrowserFactory.instance;
    }

    public async init(): Promise<void> {
        await this.pool.ready();
    }

    /**
     * Crea un nuevo BrowserContext con anti-fingerprinting y sigilo.
     * Toma prestado un navegador del pool.
     */
    public async createContext(): Promise<BrowserContext> {
        const browser = await this.pool.acquire();

        try {
            const userAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            ];
            const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

            const contextOptions: BrowserContextOptions = {
                userAgent: randomUA,
                viewport: { width: 1920, height: 1080 },
                locale: 'es-AR',
                timezoneId: 'America/Argentina/Buenos_Aires',
                permissions: ['geolocation'],
                geolocation: { latitude: -34.6037, longitude: -58.3816 },
            };

            const context = await browser.newContext(contextOptions);

            // Decorar context.close para liberar el recurso al pool
            const originalClose = context.close.bind(context);
            context.close = async () => {
                await originalClose();
                try {
                    await this.pool.release(browser);
                } catch (e) {
                    logger.warn('Error liberando navegador al pool', { module: 'BROWSER', error: e });
                }
            };

            return context;

        } catch (err) {
            await this.pool.release(browser);
            throw err;
        }
    }

    public async close(): Promise<void> {
        logger.info('Cerrando y drenando pool de navegadores...', { module: 'BROWSER' });
        await this.pool.drain();
        await this.pool.clear();
    }
}
