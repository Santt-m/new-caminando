
import { BaseScraper } from '../BaseScraper.js';
import { Product, ProductVariant } from '../../models/Product.js';
import { Brand } from '../../models/Brand.js';
import logger from '../../utils/logger.js';
import { StoreName } from '../../config/bullmq/QueueConfig.js';
import { slugify } from '../../utils/slugify.js';

// --- VTEX Interfaces ---
interface VTEXImage {
    imageId: string;
    imageUrl: string;
}

interface VTEXSeller {
    sellerId: string;
    sellerDefault: boolean;
    commertialOffer: {
        Price: number;
        ListPrice: number;
        AvailableQuantity: number;
        [key: string]: any;
    };
}

interface VTEXItem {
    itemId: string;
    name: string;
    ean: string;
    measurementUnit: string;
    unitMultiplier: number;
    images: VTEXImage[];
    sellers: VTEXSeller[];
    [key: string]: any;
}

interface VTEXProduct {
    productId: string;
    productName: string;
    brand: string;
    link: string;
    items: VTEXItem[];
    [key: string]: any;
}

export class DiscoProductScraper extends BaseScraper {
    name = 'DISCO_PRODUCT';

    constructor() {
        super(StoreName.DISCO);
    }

    canHandle(data: any): boolean {
        return data.action === 'scrape-products' && data.externalId;
    }

    async process(data: any): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');
        const { externalId, categoryId, url: catUrl, idPath } = data;

        const effectiveId = idPath || externalId;
        logger.info(`[${this.name}] Fetching products for Category ${catUrl} (ID ${effectiveId})...`, { module: 'SCRAPER_NODE' });

        await this.page.goto('https://www.disco.com.ar/', { waitUntil: 'domcontentloaded' });

        let from = 0;
        const to = 49;
        let hasMore = true;
        let totalScraped = 0;

        while (hasMore) {
            const rangeTo = from + to;
            const apiUrl = `https://www.disco.com.ar/api/catalog_system/pub/products/search?fq=C:${effectiveId}&_from=${from}&_to=${rangeTo}`;

            const products: VTEXProduct[] = await this.page.context().request.get(apiUrl)
                .then(res => res.json())
                .catch(err => {
                    logger.error(`[${this.name}] API Fetch error: ${err.message}`, { module: 'SCRAPER_NODE' });
                    return [];
                });

            if (!products || products.length === 0) {
                hasMore = false;
                break;
            }

            logger.info(`[${this.name}] Processing ${products.length} products (Offset: ${from})`, { module: 'SCRAPER_NODE' });

            for (const p of products) {
                try {
                    const productName = p.productName;
                    const link = p.link;
                    const brandName = p.brand;
                    const productId = p.productId;
                    const items = p.items || [];

                    if (items.length === 0) continue;

                    const variants: ProductVariant[] = [];
                    for (const item of items) {
                        const seller = item.sellers.find((s: VTEXSeller) => s.sellerDefault) || item.sellers[0];
                        const commertialOffer = seller?.commertialOffer;
                        if (!commertialOffer) continue;

                        const ean = item.ean || `${StoreName.DISCO}-${item.itemId}`;
                        variants.push({
                            sku: item.itemId,
                            ean: ean,
                            name: item.name,
                            price: commertialOffer.Price,
                            originalPrice: commertialOffer.ListPrice,
                            available: commertialOffer.AvailableQuantity > 0,
                            stock: commertialOffer.AvailableQuantity,
                            images: item.images?.map((img) => img.imageUrl) || [],
                            packageSize: item.measurementUnit && item.unitMultiplier ? `${item.unitMultiplier}${item.measurementUnit}` : undefined
                        } as any);
                    }

                    const mainItem = items[0];
                    const mainSeller = mainItem.sellers.find((s: VTEXSeller) => s.sellerDefault) || mainItem.sellers[0];
                    const mainOffer = mainSeller?.commertialOffer;
                    const price = mainOffer?.Price || 0;
                    const available = (mainOffer?.AvailableQuantity || 0) > 0;
                    const imageUrl = mainItem.images && mainItem.images.length > 0 ? mainItem.images[0].imageUrl : '';

                    let brandId = null;
                    if (brandName) {
                        const brandSlug = slugify(brandName);
                        const brandDoc = await Brand.findOneAndUpdate(
                            { slug: brandSlug },
                            { name: brandName, slug: brandSlug, active: true },
                            { upsert: true, new: true }
                        );
                        brandId = brandDoc._id;
                    }

                    const productSlug = slugify(productName) + '-' + productId;
                    let productDoc = null;

                    // 1. PRIORIDAD: Buscar por EAN (Vínculo global para comparación de precios)
                    if (mainItem.ean) {
                        productDoc = await Product.findByEAN(mainItem.ean);
                        if (productDoc) {
                            logger.info(`[${this.name}] Linked product by EAN: ${productName} (${mainItem.ean})`, { module: 'SCRAPER_NODE' });
                        }
                    }

                    // 2. SEGUNDA OPCION: Buscar por StoreProductID (Misma tienda)
                    if (!productDoc) {
                        productDoc = await Product.findOne({
                            'sources.storeProductId': productId,
                            'sources.store': StoreName.DISCO
                        });
                    }

                    // 3. TERCERA OPCION: Si no existe, buscar por slug (fallback)
                    if (!productDoc) {
                        productDoc = await Product.findOne({ slug: productSlug });
                    }

                    // 4. CUARTA OPCION: Si no existe, crear uno nuevo
                    if (!productDoc) {
                        productDoc = new Product({
                            name: productName,
                            slug: productSlug,
                            brand: brandId,
                            category: categoryId,
                            sources: []
                        });
                        logger.info(`[${this.name}] Creating new product: ${productName}`, { module: 'SCRAPER_NODE' });
                    }

                    productDoc.name = productName;
                    productDoc.price = price;
                    productDoc.available = available;
                    productDoc.imageUrl = imageUrl;
                    productDoc.variants = variants;
                    if (brandId) productDoc.brand = brandId;

                    const sourceIndex = productDoc.sources.findIndex((s: any) => s.store === StoreName.DISCO && s.storeProductId === productId);
                    const sourceData = {
                        store: StoreName.DISCO,
                        storeProductId: productId,
                        originalUrl: link,
                        lastScraped: new Date(),
                        availabilityStatus: (available ? 'available' : 'out_of_stock') as any,
                        price: price,
                        categoryPath: []
                    };

                    if (sourceIndex > -1) {
                        productDoc.sources[sourceIndex] = { ...productDoc.sources[sourceIndex], ...sourceData };
                    } else {
                        productDoc.sources.push(sourceData as any);
                    }

                    await productDoc.save();
                    totalScraped++;
                } catch (err) {
                    logger.error(`[${this.name}] Error processing product ${p.productName}: ${err instanceof Error ? err.message : 'Unknown'}`, { module: 'SCRAPER_NODE' });
                }
            }
            from += 50;
            if (from > 2000) hasMore = false;
        }
        logger.info(`[${this.name}] Finalizado. ${totalScraped} productos procesados.`, { module: 'SCRAPER_NODE' });
    }
}
