// Product types for Dripzy store
// These are used for products imported from CJ Dropshipping and stored in Firebase

export interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    key: string; // e.g., "Black", "Large", etc.
    price: number;
    compareAtPrice?: number;
    costPrice: number; // CJ price
    weight: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    stock: number;
    image?: string;
}

export interface ProductImage {
    id: string;
    url: string;
    alt: string;
    position: number;
}

export interface Product {
    id: string;
    // Basic Info
    name: string;
    slug: string;
    sku: string;
    description: string;
    shortDescription?: string;

    // Pricing
    price: number;
    compareAtPrice?: number;
    costPrice: number; // CJ price for margin calculation
    currency: string;

    // Media
    images: ProductImage[];
    featuredImage: string;
    videoUrl?: string;
    glbUrl?: string;

    // Categorization
    category: string;
    categoryId: string;
    subcategory?: string;
    tags: string[];

    // Variants
    variants: ProductVariant[];
    hasVariants: boolean;

    // Inventory
    stock: number;
    trackInventory: boolean;
    lowStockThreshold: number;

    // CJ Dropshipping Reference
    cjProductId: string;
    cjSku: string;
    cjSupplierId?: string;
    cjDeliveryCycle?: string;

    // Status
    status: 'active' | 'draft' | 'archived';
    isVisible: boolean;
    isFeatured: boolean;

    // SEO
    seoTitle?: string;
    seoDescription?: string;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
}

// Helper function to generate slug from product name
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Helper to calculate suggested retail price from CJ cost
export function calculateRetailPrice(costPrice: number, marginPercent: number = 50): number {
    return Math.ceil(costPrice * (1 + marginPercent / 100));
}

// Helper to clean CJ URLs
function cleanCjUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('http://')) return url.replace('http://', 'https://');
    return url;
}

// Convert CJ product to Dripzy product format
export function convertCJProductToProduct(
    cjProduct: {
        pid: string;
        productNameEn: string;
        productSku: string;
        productImage: string;
        sellPrice: number;
        description: string;
        categoryName: string;
        categoryId: string;
        variants?: {
            vid: string;
            variantNameEn: string;
            variantSku: string;
            variantKey: string;
            variantSellPrice: number;
            variantWeight: number;
            variantLength?: number;
            variantWidth?: number;
            variantHeight?: number;
            inventories?: { totalInventory: number }[];
        }[];
        productImages?: string[];
        productImageSet?: string[]; // Potential field
    },
    marginPercent: number = 50,
    targetCurrency: string = 'USD'
): Omit<Product, 'id' | 'createdAt' | 'updatedAt'> {
    const costPrice = cjProduct.sellPrice;
    const retailPrice = calculateRetailPrice(costPrice, marginPercent);

    // Process gallery images
    let rawImages: string[] = [];
    if (Array.isArray(cjProduct.productImages) && cjProduct.productImages.length > 0) {
        rawImages = cjProduct.productImages;
    } else if (Array.isArray(cjProduct.productImageSet) && cjProduct.productImageSet.length > 0) {
        rawImages = cjProduct.productImageSet;
    } else if (typeof cjProduct.productImage === 'string') {
        // Check if it's a comma-separated string
        if (cjProduct.productImage.includes(',')) {
            rawImages = cjProduct.productImage.split(',').map(s => s.trim());
        } else {
            rawImages = [cjProduct.productImage];
        }
    }

    const images: ProductImage[] = rawImages
        .filter(url => !!url)
        .map((url, index) => ({
            id: (index + 1).toString(),
            url: cleanCjUrl(url),
            alt: cjProduct.productNameEn,
            position: index,
        }));

    const featuredImage = cleanCjUrl(cjProduct.productImage?.split(',')[0]) || (images.length > 0 ? images[0].url : '');

    const variants: ProductVariant[] = cjProduct.variants?.map((v, index) => ({
        id: v.vid,
        name: v.variantNameEn,
        sku: v.variantSku,
        key: v.variantKey,
        price: calculateRetailPrice(v.variantSellPrice, marginPercent),
        costPrice: v.variantSellPrice,
        weight: v.variantWeight,
        dimensions: v.variantLength ? {
            length: v.variantLength,
            width: v.variantWidth || 0,
            height: v.variantHeight || 0,
        } : undefined,
        stock: v.inventories?.[0]?.totalInventory || 0,
    })) || [];

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0) || 100;

    return {
        name: cjProduct.productNameEn,
        slug: generateSlug(cjProduct.productNameEn),
        sku: cjProduct.productSku,
        description: cjProduct.description || '',

        price: retailPrice,
        compareAtPrice: Math.ceil(retailPrice * 1.2), // 20% higher compare price
        costPrice: costPrice,
        currency: targetCurrency,

        images: images,
        featuredImage: featuredImage,

        category: cjProduct.categoryName?.split('/')[0]?.trim() || 'General',
        categoryId: cjProduct.categoryId,
        tags: [],

        variants: variants,
        hasVariants: variants.length > 1,

        stock: totalStock,
        trackInventory: true,
        lowStockThreshold: 10,

        cjProductId: cjProduct.pid,
        cjSku: cjProduct.productSku,

        status: 'draft',
        isVisible: false,
        isFeatured: false,
    };
}
