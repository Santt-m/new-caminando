import { BaseScraper } from '../BaseScraper.js';
import { Product, ProductVariant } from '../../models/Product.js';
import { Brand } from '../../models/Brand.js';
import logger from '../../utils/logger.js';
import { StoreName } from '../../config/bullmq/QueueConfig.js';
import { slugify } from '../../utils/slugify.js';

// --- VTEX Interfaces ---
interface VTEXImage {
    imageId: string;
    imageLabel: string;
    imageTag: string;
    imageUrl: string;
    imageText: string;
}

interface VTEXSeller {
    sellerId: string;
    sellerName: string;
    addToCartLink: string;
    sellerDefault: boolean;
    commertialOffer: {
        Price: number;
        ListPrice: number;
        PriceWithoutDiscount: number;
        RewardValue: number;
        PriceValidUntil: string;
        AvailableQuantity: number;
        Tax: number;
        [key: string]: any;
    };
}

interface VTEXItem {
    itemId: string;
    name: string;
    nameComplete: string;
    complementName: string;
    ean: string;
    referenceId: { Key: string; Value: string }[];
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
    brandId: number;
    linkText: string;
    productReference: string;
    categoryId: string;
    productTitle: string;
    metaTagDescription: string;
    clusterHighlights: Record<string, string>;
    productClusters: Record<string, string>;
    searchableClusters: Record<string, string>;
    categories: string[];
    categoriesIds: string[];
    link: string;
    description: string;
    items: VTEXItem[];
    [key: string]: any;
}

export class DiaProductScraper extends BaseScraper {
    name = 'DIA_PRODUCT';

    constructor() {
        super(StoreName.DIA);
    }

    canHandle(data: any): boolean {
        return data.action === 'scrape-products' && data.externalId;
    }

    async process(data: any): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');
        const { externalId, categoryId, url: catUrl, idPath } = data;

        const effectiveId = idPath || externalId;
        logger.info(`[${this.name}] Fetching products for Category ${catUrl} (ID ${effectiveId})...`, { module: 'SCRAPER_NODE' });

        // Go to home to ensure session
        await this.page.goto('https://diaonline.supermercadosdia.com.ar/', { waitUntil: 'domcontentloaded' });

        let from = 0;
        const to = 49;
        let hasMore = true;
        let totalScraped = 0;

        while (hasMore) {
            const rangeTo = from + to;
            // For VTEX, fq=C:id/path/ is required for subcategories
            const apiUrl = `https://diaonline.supermercadosdia.com.ar/api/catalog_system/pub/products/search?fq=C:${effectiveId}&_from=${from}&_to=${rangeTo}`;

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
                    // Normalize data
                    const productName = p.productName;
                    const link = p.link;
                    const brandName = p.brand;
                    const productId = p.productId; // VTEX ID
                    const items = p.items || [];

                    if (items.length === 0) continue;

                    // --- VARIANT HANDLING ---
                    const variants: ProductVariant[] = [];

                    for (const item of items) {
                        const seller = item.sellers.find((s: VTEXSeller) => s.sellerDefault) || item.sellers[0];
                        const commertialOffer = seller?.commertialOffer;

                        if (!commertialOffer) continue;

                        const ean = item.ean || `${StoreName.DIA}-${item.itemId}`;

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
                        });
                    }

                    const mainItem = items[0];
                    const mainSeller = mainItem.sellers.find((s: VTEXSeller) => s.sellerDefault) || mainItem.sellers[0];
                    const mainOffer = mainSeller?.commertialOffer;

                    const price = mainOffer?.Price || 0;
                    const stock = mainOffer?.AvailableQuantity || 0;
                    const available = stock > 0;
                    const imageUrl = mainItem.images && mainItem.images.length > 0 ? mainItem.images[0].imageUrl : '';
                    const mainEan = mainItem.ean || `${StoreName.DIA}-${mainItem.itemId}`;

                    // Upsert Brand
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

                    // Upsert Product Logic
                    const productSlug = slugify(productName) + '-' + productId;
                    let productDoc = null;

                    // 1. PRIORIDAD: Buscar por EAN (Vínculo global para comparación de precios)
                    // Buscamos por TODOS los EANs recopilados para evitar colisiones
                    const allEans = items.map((i: VTEXItem) => i.ean).filter(Boolean);
                    if (allEans.length > 0) {
                        productDoc = await (Product as any).findByEAN(allEans);
                        if (productDoc) {
                            logger.info(`[${this.name}] Linked product by EAN: ${productName} (Found among: ${allEans.join(', ')})`, { module: 'SCRAPER_NODE' });
                        }
                    }

                    // 2. SEGUNDA OPCION: Buscar por StoreProductID (Misma tienda)
                    if (!productDoc) {
                        productDoc = await Product.findOne({
                            'sources.storeProductId': productId,
                            'sources.store': StoreName.DIA
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

                    // Update fields
                    productDoc.name = productName;
                    productDoc.price = price;
                    productDoc.available = available;
                    productDoc.imageUrl = imageUrl;
                    productDoc.sku = mainItem.itemId;
                    productDoc.ean = mainEan;
                    if (brandId) productDoc.brand = brandId;

                    // Update Source Information
                    const sourceIndex = productDoc.sources.findIndex((s: any) => s.store === StoreName.DIA && s.storeProductId === productId);
                    const sourceData = {
                        store: StoreName.DIA,
                        storeProductId: productId,
                        originalUrl: link,
                        lastScraped: new Date(),
                        availabilityStatus: (available ? 'available' : 'out_of_stock') as 'available' | 'out_of_stock' | 'discontinued',
                        price: price,
                        categoryPath: []
                    };

                    if (sourceIndex > -1) {
                        productDoc.sources[sourceIndex] = { ...productDoc.sources[sourceIndex], ...sourceData };
                    } else {
                        productDoc.sources.push(sourceData as any);
                    }

                    // Manejo de variantes: Actualizar si el EAN ya existe, o agregar si es nuevo
                    if (!productDoc.variants) productDoc.variants = [];
                    for (const v of variants) {
                        const vIndex = productDoc.variants.findIndex((pv: any) => pv.ean === v.ean);
                        if (vIndex > -1) {
                            productDoc.variants[vIndex] = { ...productDoc.variants[vIndex], ...v };
                        } else {
                            productDoc.variants.push(v);
                        }
                    }

                    await productDoc.save();
                    totalScraped++;

                } catch (err) {
                    logger.error(`[${this.name}] Error processing product ${p.productName}: ${err instanceof Error ? err.message : 'Unknown'}`, { module: 'SCRAPER_NODE' });
                }
            }

            from += 50;
        }

        logger.info(`[${this.name}] Finalizado. ${totalScraped} productos procesados.`, { module: 'SCRAPER_NODE' });
    }
}
