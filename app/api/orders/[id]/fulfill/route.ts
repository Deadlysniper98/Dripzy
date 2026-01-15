import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { cjClient } from '@/lib/cj-client';

// Helper to derive country code from country name for legacy orders
const getCountryCode = (countryCode?: string, countryName?: string): string => {
    if (countryCode && countryCode.length === 2) return countryCode;

    // Map common country names to codes
    const countryMap: Record<string, string> = {
        'india': 'IN',
        'united states': 'US',
        'usa': 'US',
        'united kingdom': 'GB',
        'uk': 'GB',
        'canada': 'CA',
        'australia': 'AU',
        'germany': 'DE',
        'france': 'FR',
        'spain': 'ES',
        'italy': 'IT',
        'netherlands': 'NL',
        'brazil': 'BR',
        'mexico': 'MX',
        'japan': 'JP',
        'china': 'CN',
        'singapore': 'SG',
        'uae': 'AE',
        'united arab emirates': 'AE',
    };

    if (countryName) {
        const normalized = countryName.toLowerCase().trim();
        if (countryMap[normalized]) return countryMap[normalized];
        // If country name is already a 2-letter code
        if (normalized.length === 2) return normalized.toUpperCase();
    }

    return 'US'; // Default fallback
};

// POST: Fulfill order via CJ Dropshipping
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get order from Firebase
        const orderRef = doc(db, 'orders', id);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        const order = orderSnap.data();

        // Check if already fulfilled
        if (order.fulfillmentStatus === 'fulfilled') {
            return NextResponse.json(
                { success: false, error: 'Order is already fulfilled' },
                { status: 400 }
            );
        }

        // Prepare products for CJ - need variant IDs
        const products = order.items.map((item: any) => ({
            vid: item.variantId || item.productId, // Use variantId if available
            quantity: item.quantity,
        }));

        // Parse shipping address
        const shipping = order.shippingAddress;

        // Get country code with smart fallback
        const shippingCountryCode = String(getCountryCode(shipping.countryCode, shipping.country) || 'US').toUpperCase().trim();

        console.log(`[FULFILL] Processing Order #${order.orderNumber}`);
        console.log(`[FULFILL] Address data:`, JSON.stringify(shipping, null, 2));
        console.log(`[FULFILL] Final shippingCountryCode used: "${shippingCountryCode}"`);

        // Create order in CJ Dropshipping
        const cjOrder = await cjClient.createOrder({
            orderNumber: order.orderNumber,
            shippingCountry: String(shipping.country || '').trim(),
            shippingCountryCode: shippingCountryCode,
            shippingProvince: String(shipping.state || shipping.city || 'N/A').trim(),
            shippingCity: String(shipping.city || shipping.state || 'N/A').trim(),
            shippingAddress: String(shipping.address || 'N/A').trim(),
            shippingAddress2: String(shipping.address2 || '').trim(),
            shippingZip: String(shipping.pincode || '0000').trim(),
            shippingCustomerName: String(order.customer.name || 'Customer').trim(),
            shippingPhone: String(order.customer.phone || '0000000000').trim(),
            products,
            remark: `Store Order: ${order.orderNumber}`,
        });

        // Update order with CJ fulfillment info
        await updateDoc(orderRef, {
            fulfillmentStatus: 'pending',
            cjOrderId: cjOrder.orderId,
            cjOrderNum: cjOrder.orderNum,
            cjTotalAmount: cjOrder.totalAmount,
            status: 'processing',
            updatedAt: Timestamp.now(),
        });

        return NextResponse.json({
            success: true,
            data: {
                cjOrderId: cjOrder.orderId,
                cjOrderNum: cjOrder.orderNum,
                totalAmount: cjOrder.totalAmount,
                message: 'Order sent to CJ Dropshipping for fulfillment',
            },
        });
    } catch (error: any) {
        console.error('--- FULFILLMENT FAILED ---');
        console.error('Error:', error.message);
        if (error.fullData) {
            console.error('CJ Response:', JSON.stringify(error.fullData, null, 2));
        }

        const errorMessage = error.message || 'Failed to fulfill order';

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                details: error.fullData || null
            },
            { status: 500 }
        );
    }
}

// GET: Check fulfillment status from CJ
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const orderRef = doc(db, 'orders', id);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        const order = orderSnap.data();

        if (!order.cjOrderId) {
            return NextResponse.json(
                { success: false, error: 'Order has not been sent to CJ for fulfillment' },
                { status: 400 }
            );
        }

        // Get status from CJ
        const cjStatus = await cjClient.getOrderStatus(order.cjOrderId);

        // Try to get tracking info
        let tracking = null;
        try {
            tracking = await cjClient.getOrderTracking(order.cjOrderId);
        } catch (e) {
            // Tracking may not be available yet
        }

        // Update local order if tracking is available
        if (tracking && tracking.trackingNumber) {
            await updateDoc(orderRef, {
                trackingNumber: tracking.trackingNumber,
                trackingUrl: tracking.trackingUrl || null,
                fulfillmentStatus: 'fulfilled',
                status: 'shipped',
                updatedAt: Timestamp.now(),
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                cjStatus,
                tracking,
            },
        });
    } catch (error: any) {
        console.error('Error checking fulfillment status:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to check status' },
            { status: 500 }
        );
    }
}
