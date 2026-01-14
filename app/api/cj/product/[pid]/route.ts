import { NextRequest, NextResponse } from 'next/server';
import { cjClient } from '@/lib/cj-client';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ pid: string }> }
) {
    try {
        const { pid } = await params;
        const { searchParams } = new URL(request.url);
        const countryCode = searchParams.get('countryCode') || 'IN';

        if (!pid) {
            return NextResponse.json(
                { success: false, error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const product = await cjClient.getProductDetails(pid);

        // Fetch shipping info for India (or requested country)
        // We iterate through variants and multiple origin warehouses until we find a working one
        let shipping = null;
        if (product.variants && product.variants.length > 0) {
            // Check top 3 variants instead of just the first one (sometimes only specific variants ship)
            const variantsToTest = product.variants.slice(0, 3);

            // Collect possible start countries from ALL variants inventory
            const possibleOrigins = new Set<string>(['CN', 'US', 'TH']);
            product.variants.forEach(v => {
                v.inventories?.forEach(inv => {
                    if (inv.totalInventory > 0) possibleOrigins.add(inv.countryCode);
                });
            });

            const originsToTry = Array.from(possibleOrigins);

            // Exhaustive search: loop variants, then loop origins
            console.log(`[SHIP-CHECK] Starting deep check for PID: ${pid} to ${countryCode}`);
            console.log(`[SHIP-CHECK] Origins discovered: ${originsToTry.join(', ')}`);

            outerLoop:
            for (const [vIdx, variant] of variantsToTest.entries()) {
                for (const startCountry of originsToTry) {
                    try {
                        console.log(`[SHIP-CHECK] Testing Variant[${vIdx}] VID: ${variant.vid} from ${startCountry}...`);
                        const result = await cjClient.getShippingCost({
                            countryCode: countryCode,
                            startCountryCode: startCountry,
                            vid: variant.vid
                        });

                        if (result && result.length > 0) {
                            shipping = result;
                            break outerLoop; // Found working shipping for at least one variant/origin pair!
                        }
                    } catch (e) { }
                }
            }

            // Ultimate Fallback: Try the very first variant with NO startCountry specified
            if (!shipping) {
                try {
                    shipping = await cjClient.getShippingCost({
                        countryCode: countryCode,
                        vid: product.variants[0].vid
                    });
                } catch (e) { }
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                ...product,
                shippingInfo: shipping
            },
        });
    } catch (error) {
        console.error('Error fetching CJ product details:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch product details'
            },
            { status: 500 }
        );
    }
}
