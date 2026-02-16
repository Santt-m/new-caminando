
import { BaseScraper } from '../BaseScraper.js';
import { Product as ProductEnhanced, ProductVariant } from '../../models/ProductEnhanced.js';
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

export class CarrefourProductScraper extends BaseScraper {
    name = 'CARREFOUR_PRODUCT';

    constructor() {
        super(StoreName.CARREFOUR);
    }

    canHandle(data: any): boolean {
        return data.action === 'scrape-products' && data.externalId;
    }

    async process(data: any): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');
        const { externalId, categoryId, idPath } = data;

        const effectiveId = idPath || externalId;

        logger.info(`[${this.name}] Fetching products for Category ID ${effectiveId}...`, { module: 'SCRAPER_NODE' });

        // Go to home to ensure session
        await this.page.goto('https://www.carrefour.com.ar/', { waitUntil: 'domcontentloaded' });

        let from = 0;
        const to = 49;
        let hasMore = true;
        let totalScraped = 0;

        while (hasMore) {
            const rangeTo = from + to;
            const apiUrl = `/api/catalog_system/pub/products/search?fq=C:${effectiveId}&_from=${from}&_to=${rangeTo}`;

            const products: VTEXProduct[] = await this.page.evaluate(async (url) => {
                try {
                    const res = await fetch(url);
                    if (!res.ok) return [];
                    return await res.json();
                } catch (e) {
                    return [];
                }
            }, apiUrl);

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
                    // Map all VTEX items to ProductVariants
                    const variants: ProductVariant[] = [];

                    for (const item of items) {
                        const seller = item.sellers.find((s: VTEXSeller) => s.sellerDefault) || item.sellers[0];
                        const commertialOffer = seller?.commertialOffer;

                        // Skip if no price info (unlikely but safe)
                        if (!commertialOffer) continue;

                        // Ensure EAN exists, fallback to SKU-based ID if missing (common in some VTEX setups)
                        const ean = item.ean || `${StoreName.CARREFOUR}-${item.itemId}`;

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

                    // Main Product Fields (use first variant/item as representative)
                    const mainItem = items[0];
                    const mainSeller = mainItem.sellers.find((s: VTEXSeller) => s.sellerDefault) || mainItem.sellers[0];
                    const mainOffer = mainSeller?.commertialOffer;

                    const price = mainOffer?.Price || 0;
                    const stock = mainOffer?.AvailableQuantity || 0;
                    const available = stock > 0;
                    const imageUrl = mainItem.images && mainItem.images.length > 0 ? mainItem.images[0].imageUrl : '';
                    const mainEan = mainItem.ean || `${StoreName.CARREFOUR}-${mainItem.itemId}`;

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

                    // Try to find by StoreProductID (most reliable for re-scraping)
                    let productDoc = await ProductEnhanced.findOne({
                        'sources.storeProductId': productId,
                        'sources.store': StoreName.CARREFOUR
                    });

                    // Fallback: match by Slug
                    if (!productDoc) {
                        productDoc = await ProductEnhanced.findOne({ slug: productSlug });
                    }

                    // Fallback: match by EAN (if global product exists)
                    if (!productDoc && mainItem.ean) {
                        productDoc = await ProductEnhanced.findOne({ ean: mainItem.ean });
                    }

                    if (!productDoc) {
                        productDoc = new ProductEnhanced({
                            name: productName,
                            slug: productSlug,
                            brand: brandId,
                            category: categoryId,
                            sources: []
                        });
                    }

                    // Update fields
                    productDoc.name = productName;
                    productDoc.price = price;
                    productDoc.available = available;
                    productDoc.imageUrl = imageUrl;
                    productDoc.variants = variants; // Update all variants
                    productDoc.sku = mainItem.itemId; // Main SKU
                    productDoc.ean = mainEan; // Main EAN
                    if (brandId) productDoc.brand = brandId;

                    // Update Source Information
                    const sourceIndex = productDoc.sources.findIndex((s: any) => s.store === StoreName.CARREFOUR && s.storeProductId === productId);
                    const sourceData = {
                        store: StoreName.CARREFOUR,
                        storeProductId: productId,
                        originalUrl: link,
                        lastScraped: new Date(),
                        availabilityStatus: (available ? 'available' : 'out_of_stock') as 'available' | 'out_of_stock' | 'discontinued',
                        price: price,
                        categoryPath: []
                    };

                    if (sourceIndex > -1) {
                        // Update existing source
                        productDoc.sources[sourceIndex] = { ...productDoc.sources[sourceIndex], ...sourceData };
                    } else {
                        // Add new source
                        productDoc.sources.push(sourceData as any);
                    }

                    await productDoc.save();
                    totalScraped++;

                } catch (err) {
                    logger.error(`[${this.name}] Error processing product ${p.productName}: ${err instanceof Error ? err.message : 'Unknown'}`, { module: 'SCRAPER_NODE' });
                }
            }

            from += 50;
            // Safety limit
            if (from > 2500) hasMore = false;
        }

        logger.info(`[${this.name}] Finalizado. ${totalScraped} productos procesados.`, { module: 'SCRAPER_NODE' });
    }
}
