import { NextRequest, NextResponse } from 'next/server';
import { cjClient } from '@/lib/cj-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { items, countryCode } = body;

        console.log(`[Shipping API] Request for ${countryCode} with ${items?.length || 0} items`);

        if (!items || !Array.isArray(items) || items.length === 0) {
            console.warn('[Shipping API] No items provided');
            return NextResponse.json({ success: false, error: 'No items provided' }, { status: 400 });
        }

        if (!countryCode) {
            console.warn('[Shipping API] No country code provided');
            return NextResponse.json({ success: false, error: 'Country code is required' }, { status: 400 });
        }

        // Filter to only items with valid variantId (CJ VID)
        const cjItems = items.filter(item => item.variantId);

        console.log(`[Shipping API] Found ${cjItems.length} items with variantId out of ${items.length} total`);

        if (cjItems.length === 0) {
            console.log('[Shipping API] No valid CJ products (missing variantId), returning default rate');
            return NextResponse.json({
                success: true,
                rates: [{ name: 'Standard Shipping', amount: 5, aging: '7-15 days', code: 'default' }]
            });
        }

        // Use the SAME approach as the working product detail page:
        // For each variant, try multiple warehouse origins until we get shipping methods
        const originsToTry = ['CN', 'TH', 'US', 'ID'];
        const allShippingMethods: any[] = [];

        // Fetch shipping for each item's variant (parallel per item, sequential per origin)
        console.log('[Shipping API] Fetching shipping rates per variant using getShippingCost...');

        for (const item of cjItems) {
            const vid = item.variantId;
            let foundMethods = false;

            for (const origin of originsToTry) {
                if (foundMethods) break;

                try {
                    console.log(`[Shipping API] Checking VID: ${vid} from ${origin} to ${countryCode}`);
                    const methods = await cjClient.getShippingCost({
                        vid: vid,
                        countryCode: countryCode,
                        startCountryCode: origin,
                        num: item.quantity || 1
                    });

                    if (methods && methods.length > 0) {
                        console.log(`[Shipping API] Found ${methods.length} methods for VID ${vid} from ${origin}`);
                        // Add all methods (they're already mapped by getShippingCost)
                        allShippingMethods.push(...methods);
                        foundMethods = true;
                    }
                } catch (err) {
                    console.error(`[Shipping API] Error fetching shipping for VID ${vid} from ${origin}:`, err);
                }
            }

            // If no methods found for this variant with any origin, try without specifying origin
            if (!foundMethods) {
                try {
                    console.log(`[Shipping API] Fallback: Checking VID ${vid} without specific origin`);
                    const methods = await cjClient.getShippingCost({
                        vid: vid,
                        countryCode: countryCode,
                        num: item.quantity || 1
                    });
                    if (methods && methods.length > 0) {
                        console.log(`[Shipping API] Fallback found ${methods.length} methods for VID ${vid}`);
                        allShippingMethods.push(...methods);
                    }
                } catch (err) {
                    console.error(`[Shipping API] Fallback error for VID ${vid}:`, err);
                }
            }
        }

        console.log(`[Shipping API] Total raw shipping methods collected: ${allShippingMethods.length}`);

        if (allShippingMethods.length === 0) {
            console.log('[Shipping API] No CJ rates found, returning fallback');
            if (countryCode === 'IN') {
                return NextResponse.json({
                    success: true,
                    rates: [
                        { name: 'Standard Shipping', amount: 4.99, aging: '10-18 days', code: 'standard_in' },
                        { name: 'Express Shipping', amount: 9.99, aging: '5-10 days', code: 'express_in' }
                    ]
                });
            }
            return NextResponse.json({
                success: true,
                rates: [{ name: 'Standard Shipping', amount: 9.99, aging: '10-20 days', code: 'standard' }]
            });
        }

        // Process all shipping methods - use the mapped fields from getShippingCost
        // getShippingCost returns: { amount, name, aging, logisticPrice, logisticName, logisticAging, ... }
        const friendlyRates = allShippingMethods.map((r: any) => {
            // Use already mapped fields from getShippingCost, fallback to raw CJ fields
            let name = r.name || r.logisticName || 'Shipping';
            const code = r.logisticCode || r.code || name;
            const amount = r.amount ?? r.logisticPrice ?? 0;
            const aging = r.aging || r.logisticAging || '';

            // Apply friendly naming
            if (name.includes('DHL')) name = 'DHL Express';
            else if (name.includes('FedEx')) name = 'FedEx Priority';
            else if (name.includes('UPS')) name = 'UPS Expedited';
            else if (name.includes('USPS')) name = 'USPS Priority';
            else if (name.toLowerCase().includes('sensitive')) name = 'Premium Sensitive Line';
            else if (name.toLowerCase().includes('liquid')) name = 'Special Liquid Line';
            else if (name.toLowerCase().includes('fast')) name = 'Fast Express';
            else if (name.toLowerCase().includes('jewel')) name = 'Jewelry Special Line';
            else if (name.includes('CJPacket Ordinary')) name = 'Economy Shipping';
            else if (name.includes('CJPacket') && parseInt(aging?.split('-')?.[0] || '20') < 10) name = 'Priority Line';
            else if (name.includes('CJPacket')) name = 'Standard International';
            else if (name.includes('Post') || name.includes('Packet')) name = 'Standard Postal';

            return {
                name,
                originalName: r.logisticName || r.name,
                amount: parseFloat(amount) || 0,
                aging,
                code
            };
        });

        // Deduplicate by name, keeping the cheapest option
        const uniqueRates = friendlyRates.reduce((acc: any[], current: any) => {
            const existingIdx = acc.findIndex(r => r.name === current.name);
            if (existingIdx === -1) {
                return acc.concat([current]);
            } else {
                if (current.amount < acc[existingIdx].amount) {
                    acc[existingIdx] = current;
                }
                return acc;
            }
        }, []);

        // Sort by price
        uniqueRates.sort((a: any, b: any) => a.amount - b.amount);

        // Take top 5 cheapest
        let displayedRates = uniqueRates.slice(0, 5);

        // Force include fastest option if not already present
        let fastestRate: any = null;
        let minDays = 999;
        for (const rate of uniqueRates) {
            if (rate.aging) {
                const parts = rate.aging.replace(/[^0-9-]/g, '').split('-');
                const lower = parseInt(parts[0]) || 99;
                const isPremium = rate.name.includes('DHL') || rate.name.includes('FedEx') || rate.name.includes('UPS');
                const effectiveDays = isPremium ? lower - 1 : lower;
                if (effectiveDays < minDays) {
                    minDays = effectiveDays;
                    fastestRate = rate;
                }
            }
        }

        if (fastestRate && minDays < 10 && !displayedRates.find(r => r.name === fastestRate.name)) {
            console.log(`[Shipping API] Injecting fastest option: ${fastestRate.name} (${fastestRate.aging})`);
            displayedRates.push(fastestRate);
        }

        displayedRates.sort((a: any, b: any) => a.amount - b.amount);

        console.log(`[Shipping API] Final rates count: ${displayedRates.length}`);
        displayedRates.forEach(r => console.log(`  - ${r.name}: $${r.amount} (${r.aging})`));

        return NextResponse.json({
            success: true,
            rates: displayedRates.map(r => ({
                name: r.name,
                amount: r.amount,
                aging: r.aging,
                code: r.code
            }))
        });

    } catch (error) {
        console.error('Shipping calculation error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to calculate shipping'
        }, { status: 500 });
    }
}
