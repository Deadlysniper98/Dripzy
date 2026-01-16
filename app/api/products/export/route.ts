import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Google Merchant Center Product Feed Export
// Supports: CSV (for manual upload), XML (for scheduled fetch)

interface ExportProduct {
    id: string;
    title: string;
    description: string;
    link: string;
    image_link: string;
    additional_image_link?: string;
    price: string;
    sale_price?: string;
    availability: string;
    brand: string;
    condition: string;
    gtin?: string;
    mpn?: string;
    product_type?: string;
    google_product_category?: string;
    item_group_id?: string;
    shipping?: string;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'csv';
        const currency = searchParams.get('currency') || 'INR';
        const storeUrl = searchParams.get('storeUrl') || 'https://dripzy.store';
        const selectedIds = searchParams.get('ids')?.split(',').filter(Boolean) || [];

        // Fetch products from Firebase
        const q = query(collection(db, 'products'), where('status', '==', 'active'));
        const snapshot = await getDocs(q);

        let products: any[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Filter by selected IDs if provided
        if (selectedIds.length > 0) {
            products = products.filter(p => selectedIds.includes(p.id));
        }

        // Convert to Google Merchant format
        const exportProducts: ExportProduct[] = products.map(product => {
            const price = currency === 'INR' && product.prices?.INR
                ? product.prices.INR
                : (product.price || 0);

            const compareAtPrice = currency === 'INR' && product.compareAtPrices?.INR
                ? product.compareAtPrices.INR
                : product.compareAtPrice;

            // Calculate availability based on stock
            const inStock = (product.stock ?? 100) > 0;

            return {
                id: product.id,
                title: (product.name || '').slice(0, 150),
                description: (product.description || product.name || '').replace(/<[^>]*>?/gm, '').slice(0, 5000),
                link: `${storeUrl}/product/${product.slug || product.id}`,
                image_link: product.featuredImage || product.images?.[0]?.url || '',
                additional_image_link: product.images?.slice(1, 10).map((img: any) => img.url).join(',') || '',
                price: `${(price || 0).toFixed(2)} ${currency}`,
                sale_price: compareAtPrice && compareAtPrice > price ? `${(price || 0).toFixed(2)} ${currency}` : undefined,
                availability: inStock ? 'in_stock' : 'out_of_stock',
                brand: product.brand || 'Dripzy',
                condition: product.condition || 'new',
                gtin: product.gtin || '',
                mpn: product.mpn || product.sku || product.id,
                product_type: product.category || 'General',
                google_product_category: mapToGoogleCategory(product.category),
                item_group_id: product.hasVariants ? product.id : undefined,
                shipping: product.availableCountries?.map((c: string) => `${c}:::0 ${currency}`).join(',') || '',
            };
        });

        if (format === 'xml') {
            // Generate RSS 2.0 / Google Shopping XML feed
            const xml = generateXMLFeed(exportProducts, storeUrl);
            return new NextResponse(xml, {
                status: 200,
                headers: {
                    'Content-Type': 'application/xml',
                    'Content-Disposition': 'attachment; filename="google-merchant-feed.xml"'
                }
            });
        } else {
            // Generate CSV
            const csv = generateCSVFeed(exportProducts);
            return new NextResponse(csv, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="google-merchant-feed.csv"'
                }
            });
        }
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ success: false, error: 'Failed to export products' }, { status: 500 });
    }
}

function generateCSVFeed(products: ExportProduct[]): string {
    const headers = [
        'id', 'title', 'description', 'link', 'image_link', 'additional_image_link',
        'price', 'sale_price', 'availability', 'brand', 'condition',
        'gtin', 'mpn', 'product_type', 'google_product_category', 'item_group_id', 'shipping'
    ];

    const rows = products.map(p => [
        escapeCSV(p.id),
        escapeCSV(p.title),
        escapeCSV(p.description),
        escapeCSV(p.link),
        escapeCSV(p.image_link),
        escapeCSV(p.additional_image_link || ''),
        escapeCSV(p.price),
        escapeCSV(p.sale_price || ''),
        escapeCSV(p.availability),
        escapeCSV(p.brand),
        escapeCSV(p.condition),
        escapeCSV(p.gtin || ''),
        escapeCSV(p.mpn || ''),
        escapeCSV(p.product_type || ''),
        escapeCSV(p.google_product_category || ''),
        escapeCSV(p.item_group_id || ''),
        escapeCSV(p.shipping || ''),
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
}

function escapeCSV(value: string): string {
    if (!value) return '';
    // If contains comma, newline, or quote, wrap in quotes and escape internal quotes
    if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

function generateXMLFeed(products: ExportProduct[], storeUrl: string): string {
    const items = products.map(p => `
    <item>
        <g:id>${escapeXML(p.id)}</g:id>
        <g:title>${escapeXML(p.title)}</g:title>
        <g:description>${escapeXML(p.description)}</g:description>
        <g:link>${escapeXML(p.link)}</g:link>
        <g:image_link>${escapeXML(p.image_link)}</g:image_link>
        ${p.additional_image_link ? `<g:additional_image_link>${escapeXML(p.additional_image_link)}</g:additional_image_link>` : ''}
        <g:price>${escapeXML(p.price)}</g:price>
        ${p.sale_price ? `<g:sale_price>${escapeXML(p.sale_price)}</g:sale_price>` : ''}
        <g:availability>${p.availability}</g:availability>
        <g:brand>${escapeXML(p.brand)}</g:brand>
        <g:condition>${p.condition}</g:condition>
        ${p.gtin ? `<g:gtin>${escapeXML(p.gtin)}</g:gtin>` : ''}
        <g:mpn>${escapeXML(p.mpn || '')}</g:mpn>
        ${p.product_type ? `<g:product_type>${escapeXML(p.product_type)}</g:product_type>` : ''}
        ${p.google_product_category ? `<g:google_product_category>${escapeXML(p.google_product_category)}</g:google_product_category>` : ''}
        ${p.item_group_id ? `<g:item_group_id>${escapeXML(p.item_group_id)}</g:item_group_id>` : ''}
    </item>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
    <title>Dripzy Store Products</title>
    <link>${storeUrl}</link>
    <description>Product feed for Google Merchant Center</description>
    ${items}
</channel>
</rss>`;
}

function escapeXML(value: string): string {
    if (!value) return '';
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function mapToGoogleCategory(category: string): string {
    // Map common categories to Google's taxonomy
    // Full list: https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
    const categoryMap: { [key: string]: string } = {
        'Electronics': 'Electronics',
        'Accessories': 'Electronics > Electronics Accessories',
        'Phone': 'Electronics > Communications > Telephony > Mobile Phones',
        'Watches': 'Apparel & Accessories > Jewelry > Watches',
        'Bags': 'Apparel & Accessories > Handbags, Wallets & Cases',
        'Clothing': 'Apparel & Accessories > Clothing',
        'Home': 'Home & Garden',
        'Beauty': 'Health & Beauty',
        'Sports': 'Sporting Goods',
        'Toys': 'Toys & Games',
    };

    // Try to match
    for (const [key, value] of Object.entries(categoryMap)) {
        if (category?.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }

    return 'Electronics'; // Default fallback
}
