import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { cjClient } from '@/lib/cj-client';

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

        // Create order in CJ Dropshipping
        const cjOrder = await cjClient.createOrder({
            orderNumber: order.orderNumber,
            shippingCountry: shipping.country,
            shippingCountryCode: shipping.countryCode || (shipping.country === 'India' ? 'IN' : 'US'),
            shippingProvince: shipping.state,
            shippingCity: shipping.city,
            shippingAddress: shipping.address,
            shippingAddress2: shipping.address2 || '',
            shippingZip: shipping.pincode,
            shippingCustomerName: order.customer.name,
            shippingPhone: order.customer.phone,
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
        console.error('Error fulfilling order:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fulfill order' },
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
