import { NextRequest, NextResponse } from 'next/server';
import { cjClient } from '@/lib/cj-client';

export async function POST(request: NextRequest) {
    try {
        const { items, countryCode } = await request.json();

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: false, error: 'No items provided' }, { status: 400 });
        }

        if (!countryCode) {
            return NextResponse.json({ success: false, error: 'Country code is required' }, { status: 400 });
        }

        // Prepare products list for CJ
        // Note: We need the original CJ Variant ID (vid)
        // Some items might not have variantId if they are simple products without variants
        // but normally CJ items always have at least one variant.
        const cjProducts = items
            .filter(item => item.variantId)
            .map(item => ({
                vid: item.variantId,
                quantity: item.quantity || 1
            }));

        if (cjProducts.length === 0) {
            return NextResponse.json({
                success: true,
                rates: [{ name: 'Standard Shipping', amount: 5, aging: '7-15 days' }]
            });
        }

        // Try CN first as default hub
        let rates = await cjClient.calculateBulkShipping({
            startCountryCode: 'CN',
            endCountryCode: countryCode,
            products: cjProducts
        });

        // Fallback for US if CN returns nothing (common for US-only inventory)
        if (rates.length === 0 && countryCode === 'US') {
            rates = await cjClient.calculateBulkShipping({
                startCountryCode: 'US',
                endCountryCode: countryCode,
                products: cjProducts
            });
        }

        // Fallback for India - try Thailand or US warehouses
        if (rates.length === 0 && countryCode === 'IN') {
            rates = await cjClient.calculateBulkShipping({
                startCountryCode: 'TH',
                endCountryCode: countryCode,
                products: cjProducts
            });
        }

        // Map CJ rates to our format
        const formattedRates = rates.map((r: any) => ({
            name: r.logisticName,
            amount: r.logisticPrice,
            aging: r.logisticAging,
            code: r.logisticCode
        }));

        // If no rates found from CJ, return region-specific fallbacks
        if (formattedRates.length === 0) {
            // India-specific fallback rates (in USD, will be converted on frontend)
            if (countryCode === 'IN') {
                return NextResponse.json({
                    success: true,
                    rates: [
                        { name: 'Standard Shipping', amount: 4.99, aging: '10-18 days', code: 'standard_in' },
                        { name: 'Express Shipping', amount: 9.99, aging: '5-10 days', code: 'express_in' }
                    ]
                });
            }
            // Default fallback
            return NextResponse.json({
                success: true,
                rates: [{ name: 'Standard Shipping', amount: 9.99, aging: '10-20 days', code: 'standard' }]
            });
        }

        return NextResponse.json({
            success: true,
            rates: formattedRates
        });

    } catch (error) {
        console.error('Shipping calculation error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to calculate shipping'
        }, { status: 500 });
    }
}
