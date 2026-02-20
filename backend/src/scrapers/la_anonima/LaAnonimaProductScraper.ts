import { BaseScraper } from '../BaseScraper.js';
import { Product, ProductVariant } from '../../models/Product.js';
import { Brand } from '../../models/Brand.js';
import logger from '../../utils/logger.js';
import { StoreName } from '../../config/bullmq/QueueConfig.js';
import { slugify } from '../../utils/slugify.js';

export class LaAnonimaProductScraper extends BaseScraper {
    name = 'LA_ANONIMA_PRODUCT';

    constructor() {
        super(StoreName.LA_ANONIMA);
    }

    canHandle(data: any): boolean {
        return data.action === 'scrape-products' && data.externalId;
    }

    async process(data: any): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');
        const { categoryId, url: catUrl } = data;

        let fullUrl = catUrl;
        if (catUrl && !catUrl.startsWith('http')) {
            fullUrl = `https://www.laanonima.com.ar${catUrl.startsWith('/') ? '' : '/'}${catUrl}`;
        }
        logger.info(`[${this.name}] Fetching products for Category ${fullUrl}...`, { module: 'SCRAPER_NODE' });

        await this.page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

        const extractedProducts = await this.page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('a[data-tipo="portadaProduct"]'));
            return elements.map(el => {
                const a = el as HTMLAnchorElement;
                const sku = a.getAttribute('data-codigo');
                const name = a.getAttribute('data-nombre');
                const brand = a.getAttribute('data-marca');
                const price = parseFloat(a.getAttribute('data-precio') || '0');
                const originalPrice = parseFloat(a.getAttribute('data-precio_anterior') || '0');
                const href = a.href;

                const imgEl = a.querySelector('img.lazy') || a.querySelector('img');
                const imageUrl = imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : '';

                // Si el botón de "Agregar al Carrito" existe, hay stock
                const available = a.querySelector('.btnAgregarCarritoVarios') !== null;

                return {
                    sku,
                    name,
                    brand,
                    price,
                    originalPrice,
                    href,
                    imageUrl,
                    available
                };
            }).filter(p => p.sku && p.name);
        });

        if (!extractedProducts || extractedProducts.length === 0) {
            logger.info(`[${this.name}] No products found at ${fullUrl}`, { module: 'SCRAPER_NODE' });
            return;
        }

        logger.info(`[${this.name}] Processing ${extractedProducts.length} products from DOM`, { module: 'SCRAPER_NODE' });

        let totalScraped = 0;

        for (const p of extractedProducts) {
            try {
                if (!p.sku || !p.name) continue;

                // --- VARIANT HANDLING ---
                const ean = `${StoreName.LA_ANONIMA}-${p.sku}`; // Utiliza un pseudo-EAN porque no expone el real

                const variant: ProductVariant = {
                    sku: p.sku,
                    ean: ean,
                    name: p.name,
                    price: p.price,
                    originalPrice: p.originalPrice > 0 ? p.originalPrice : undefined,
                    available: p.available,
                    stock: p.available ? 99 : 0, // No sabemos el stock exacto
                    images: p.imageUrl ? [p.imageUrl] : [],
                    packageSize: undefined
                };

                // Upsert Brand
                let brandId = null;
                if (p.brand && p.brand !== '.') {
                    const brandSlug = slugify(p.brand);
                    const brandDoc = await Brand.findOneAndUpdate(
                        { slug: brandSlug },
                        { name: p.brand, slug: brandSlug, active: true },
                        { upsert: true, new: true }
                    );
                    brandId = brandDoc._id;
                }

                // Upsert Product Logic
                const productSlug = slugify(p.name) + '-' + p.sku;
                let productDoc = null;

                // 1. PRIORIDAD: Buscar por StoreProductID (Misma tienda)
                // Para La Anónima, ya que no tenemos un EAN real global en la mayoría de los casos,
                // nuestra mejor chance para evitar duplicidades dentro de la misma tienda es buscar por su ID y por el pseudo-EAN
                productDoc = await (Product as any).findByEAN([ean]);

                if (!productDoc) {
                    productDoc = await Product.findOne({
                        'sources.storeProductId': p.sku,
                        'sources.store': StoreName.LA_ANONIMA
                    });
                }

                // 2. SEGUNDA OPCION: Si no existe, buscar por slug (fallback)
                if (!productDoc) {
                    productDoc = await Product.findOne({ slug: productSlug });
                }

                // 3. TERCERA OPCION: Si no existe, crear uno nuevo
                if (!productDoc) {
                    productDoc = new Product({
                        name: p.name,
                        slug: productSlug,
                        brand: brandId,
                        category: categoryId,
                        sources: []
                    });
                    logger.debug(`[${this.name}] Creating new product: ${p.name}`, { module: 'SCRAPER_NODE' });
                }

                // Update fields
                productDoc.name = p.name;
                productDoc.price = p.price;
                productDoc.available = p.available;
                productDoc.imageUrl = p.imageUrl || productDoc.imageUrl;
                productDoc.sku = p.sku;
                productDoc.ean = ean; // Only set primary EAN if not already defined (though it's just the pseudo one here)
                if (brandId) productDoc.brand = brandId;

                // Update Source Information
                const sourceIndex = productDoc.sources.findIndex((s: any) => s.store === StoreName.LA_ANONIMA && s.storeProductId === p.sku);
                const sourceData = {
                    store: StoreName.LA_ANONIMA,
                    storeProductId: p.sku,
                    originalUrl: p.href,
                    lastScraped: new Date(),
                    availabilityStatus: (p.available ? 'available' : 'out_of_stock') as 'available' | 'out_of_stock' | 'discontinued',
                    price: p.price,
                    categoryPath: []
                };

                if (sourceIndex > -1) {
                    productDoc.sources[sourceIndex] = { ...productDoc.sources[sourceIndex], ...sourceData };
                } else {
                    productDoc.sources.push(sourceData as any);
                }

                // Manejo de variantes: Actualizar si el EAN ya existe, o agregar si es nuevo
                if (!productDoc.variants) productDoc.variants = [];
                const vIndex = productDoc.variants.findIndex((pv: any) => pv.ean === variant.ean);
                if (vIndex > -1) {
                    productDoc.variants[vIndex] = { ...productDoc.variants[vIndex], ...variant };
                } else {
                    productDoc.variants.push(variant);
                }

                await productDoc.save();
                totalScraped++;

            } catch (err) {
                logger.error(`[${this.name}] Error processing product ${p.name}: ${err instanceof Error ? err.message : 'Unknown'}`, { module: 'SCRAPER_NODE' });
            }
        }

        logger.info(`[${this.name}] Finalizado. ${totalScraped} productos procesados en ${catUrl}.`, { module: 'SCRAPER_NODE' });
    }
}
