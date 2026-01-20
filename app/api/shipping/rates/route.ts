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

        let allShippingMethods: any[] = [];
        let methodSource = 'individual';

        // STRATEGY 1: Try Bulk Shipping from CN (Manufacturer)
        // This is usually the cheapest and most accurate for dropshipping multiple items
        try {
            console.log('[Shipping API] Attempting Bulk Shipping Calculation from CN...');
            const bulkMethods = await cjClient.calculateBulkShipping({
                startCountryCode: 'CN',
                endCountryCode: countryCode,
                products: cjItems.map(item => ({
                    vid: item.variantId,
                    quantity: item.quantity || 1
                }))
            });

            if (bulkMethods && bulkMethods.length > 0) {
                console.log(`[Shipping API] Bulk CN Strategy Successful: ${bulkMethods.length} methods found`);
                allShippingMethods = bulkMethods;
                methodSource = 'bulk_cn';
            }
        } catch (err) {
            console.warn('[Shipping API] Bulk CN Strategy Failed:', err);
        }

        // STRATEGY 2: If Bulk CN failed, try Bulk US (Local Warehouse)
        if (allShippingMethods.length === 0) {
            try {
                console.log('[Shipping API] Attempting Bulk Shipping Calculation from US...');
                const bulkMethods = await cjClient.calculateBulkShipping({
                    startCountryCode: 'US',
                    endCountryCode: countryCode,
                    products: cjItems.map(item => ({
                        vid: item.variantId,
                        quantity: item.quantity || 1
                    }))
                });

                if (bulkMethods && bulkMethods.length > 0) {
                    console.log(`[Shipping API] Bulk US Strategy Successful: ${bulkMethods.length} methods found`);
                    allShippingMethods = bulkMethods;
                    methodSource = 'bulk_us';
                }
            } catch (err) {
                console.warn('[Shipping API] Bulk US Strategy Failed:', err);
            }
        }

        // STRATEGY 3: Fallback - Calculate per item and sum costs (Intersection of methods)
        if (allShippingMethods.length === 0) {
            console.log('[Shipping API] Fallback Strategy: Calculating per-item and summing costs...');

            // 1. Fetch rates for each item individually
            const itemRatesMap: { [vid: string]: any[] } = {};
            const originsToTry = ['CN', 'TH', 'US', 'ID'];

            for (const item of cjItems) {
                const vid = item.variantId;
                let foundMethods = false;

                // Try origins
                for (const origin of originsToTry) {
                    if (foundMethods) break;
                    try {
                        const methods = await cjClient.getShippingCost({
                            vid: vid,
                            countryCode: countryCode,
                            startCountryCode: origin,
                            num: item.quantity || 1
                        });
                        if (methods && methods.length > 0) {
                            itemRatesMap[vid] = methods;
                            foundMethods = true;
                        }
                    } catch (e) { /* ignore */ }
                }

                // Try no-origin fallback
                if (!foundMethods) {
                    try {
                        const methods = await cjClient.getShippingCost({
                            vid: vid,
                            countryCode: countryCode,
                            num: item.quantity || 1
                        });
                        if (methods && methods.length > 0) {
                            itemRatesMap[vid] = methods;
                        }
                    } catch (e) { /* ignore */ }
                }
            }

            // 2. Find intersection of shipping METHOD NAMES (normalized)
            // We can only offer a shipping method if it covers ALL items (or mapped equivalent)
            // To simplify, we sum the costs of methods that "look alike" (e.g. both have "Standard" or "CJPacket")
            // Actually, we'll bucket them by our friendly names later. 
            // Here we just collect all valid options per item.

            // We need to construct "Combined Methods".
            // A combined method exists if we can pick one method for Item 1, one for Item 2, etc.
            // But the user selects ONE option.
            // So we normalize names FIRST, then sum.

            const normalizedItemRates: { [vid: string]: { [friendlyName: string]: number } } = {};
            const agingMap: { [friendlyName: string]: string } = {}; // Keep track of aging

            // Helper to normalize name
            const getFriendlyName = (rawName: string, rawAging: string) => {
                let name = rawName || 'Shipping';
                const aging = rawAging || '';
                if (name.includes('DHL')) return 'DHL Express';
                if (name.includes('FedEx')) return 'FedEx Priority';
                if (name.includes('UPS')) return 'UPS Expedited';
                if (name.includes('USPS')) return 'USPS Priority';
                if (name.toLowerCase().includes('sensitive')) return 'Premium Sensitive Line';
                if (name.toLowerCase().includes('liquid')) return 'Special Liquid Line';
                if (name.toLowerCase().includes('fast')) return 'Fast Express';
                if (name.toLowerCase().includes('jewel')) return 'Jewelry Special Line';
                if (name.includes('CJPacket Ordinary')) return 'Economy Shipping';
                if (name.includes('CJPacket') && parseInt(aging?.split('-')?.[0] || '20') < 10) return 'Priority Line';
                if (name.includes('CJPacket')) return 'Standard International';
                if (name.includes('Post') || name.includes('Packet')) return 'Standard Postal';
                return 'Standard Shipping';
            };

            // Populate normalized map
            for (const item of cjItems) {
                const vid = item.variantId;
                const rates = itemRatesMap[vid] || [];

                if (rates.length === 0) {
                    // Critical failure: One item has NO shipping options.
                    // We cannot ship the full cart. 
                    // Fallback: Charge a flat "Safe" rate for this item + others?
                    // For now, we assume a default $10 for this problematic item if purely unknown.
                    normalizedItemRates[vid] = { 'Standard Shipping': 10, 'Standard International': 10 };
                    continue;
                }

                normalizedItemRates[vid] = {};
                for (const rate of rates) {
                    const fname = getFriendlyName(rate.name || rate.logisticName, rate.aging || rate.logisticAging);
                    const cost = parseFloat(rate.amount || rate.logisticPrice || 0);

                    // Keep CHEAPEST for this friendly bucket for this item
                    if (!normalizedItemRates[vid][fname] || cost < normalizedItemRates[vid][fname]) {
                        normalizedItemRates[vid][fname] = cost;
                        agingMap[fname] = rate.aging || rate.logisticAging; // Just take last seen aging
                    }
                }
            }

            // 3. Sum up
            // We iterate through all known Friendly Names.
            // A Friendly Name is valid for the CART if it exists for ALL items.
            // If it's missing for an item, we try to fallback to "Standard Shipping" for that item.

            const possibleNames = new Set<string>();
            Object.values(normalizedItemRates).forEach(map => Object.keys(map).forEach(k => possibleNames.add(k)));

            for (const name of Array.from(possibleNames)) {
                let totalCost = 0;
                let valid = true;

                for (const item of cjItems) {
                    const vid = item.variantId;
                    const costs = normalizedItemRates[vid];

                    if (costs[name] !== undefined) {
                        totalCost += costs[name];
                    } else if (costs['Standard Shipping'] !== undefined) {
                        totalCost += costs['Standard Shipping']; // Fallback
                    } else if (costs['Standard International'] !== undefined) {
                        totalCost += costs['Standard International']; // Fallback 2
                    } else {
                        // This item has neither the specific method nor standard.
                        // We can't offer this method for the whole cart easily.
                        // But let's add a penalty cost so we don't break the UI.
                        totalCost += 15; // Penalty
                    }
                }

                allShippingMethods.push({
                    name: name,
                    amount: totalCost,
                    aging: agingMap[name] || '10-20 days', // Approximate
                    code: name.toLowerCase().replace(/\s+/g, '_')
                });
            }

            methodSource = 'combined_fallback';
        }

        console.log(`[Shipping API] Final Strategy: ${methodSource}. Total Methods: ${allShippingMethods.length}`);

        if (allShippingMethods.length === 0) {
            console.log('[Shipping API] No CJ rates found even after fallback, returning safe defaults');
            if (countryCode === 'IN') {
                return NextResponse.json({
                    success: true,
                    rates: [
                        { name: 'Standard Shipping', amount: 4.99 * cjItems.length, aging: '10-18 days', code: 'standard_in' },
                        { name: 'Express Shipping', amount: 9.99 * cjItems.length, aging: '5-10 days', code: 'express_in' }
                    ]
                });
            }
            return NextResponse.json({
                success: true,
                rates: [{ name: 'Standard Shipping', amount: 9.99 * cjItems.length, aging: '10-20 days', code: 'standard' }]
            });
        }

        // Process friendly transformation (if coming from Bulk, we still need to friendly-map names)
        // If coming from combined_fallback, we already friendly-mapped names, but let's run it through standardizer for consistency if needed.
        // Actually, let's just do a final pass.

        const friendlyRates = allShippingMethods.map((r: any) => {
            let name = r.name || r.logisticName || 'Shipping';
            const code = r.logisticCode || r.code || name;
            let amount = parseFloat(r.amount ?? r.logisticPrice ?? 0);
            const aging = r.aging || r.logisticAging || '';

            // If source is bulk, we need to map names again
            if (methodSource !== 'combined_fallback') {
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
            }

            return {
                name,
                originalName: r.logisticName || r.name,
                amount: amount || 0,
                aging,
                code
            };
        });

        // Deduplicate final results by name, keeping CHEAPEST (e.g. if 'CJPacket YW' and 'CJPacket US' both map to 'Standard International', take cheaper)
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

        // Take top 5
        let displayedRates = uniqueRates.slice(0, 5);

        // Ensure fastest is included
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
            displayedRates.push(fastestRate);
        }

        displayedRates.sort((a: any, b: any) => a.amount - b.amount);

        console.log(`[Shipping API] Returning ${displayedRates.length} rates`);

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
