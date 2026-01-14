import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, where, addDoc, Timestamp } from 'firebase/firestore';

// GET: List all orders with filtering
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const pageSize = parseInt(searchParams.get('limit') || '50');

        let constraints: any[] = [];

        if (status && status !== 'all') {
            constraints.push(where('status', '==', status));
        }

        constraints.push(orderBy('createdAt', 'desc'));
        constraints.push(limit(pageSize));

        const q = query(collection(db, 'orders'), ...constraints);
        const snapshot = await getDocs(q);

        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
        }));

        return NextResponse.json({
            success: true,
            data: { orders, total: orders.length },
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

// Helper to remove undefined values
const cleanData = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, (key, value) => {
        return value === undefined ? null : value;
    }));
};

// POST: Create a new order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Received order request:', JSON.stringify(body, null, 2));

        const {
            customer,
            email,
            phone,
            shippingAddress,
            items,
            subtotal,
            shipping,
            total,
            currency,
            paymentMethod,
            paymentId,
        } = body;

        // Validation
        if (!items || items.length === 0) throw new Error('No items in order');
        if (!customer || !email) throw new Error('Missing customer details');

        // Generate order number
        const orderNumber = `DRZ${Date.now().toString().slice(-8)}`;

        const orderData = cleanData({
            orderNumber,
            customer: {
                name: customer || '',
                email: email || '',
                phone: phone || '',
            },
            shippingAddress: {
                address: shippingAddress?.address || '',
                city: shippingAddress?.city || '',
                state: shippingAddress?.state || '',
                pincode: shippingAddress?.pincode || '',
                country: shippingAddress?.country || '',
                countryCode: shippingAddress?.countryCode || 'US',
            },
            items: items.map((item: any) => ({
                productId: item.productId || '',
                variantId: item.variantId || '',
                name: item.name || 'Unknown Product',
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 1,
                image: item.image || '',
                currency: item.currency || 'USD',
            })),
            subtotal: Number(subtotal) || 0,
            shipping: Number(shipping) || 0,
            total: Number(total) || 0,
            currency: currency || 'USD',
            paymentMethod: paymentMethod || 'unknown',
            paymentId: paymentId || null,
            status: 'pending',
            fulfillmentStatus: 'unfulfilled',
            cjOrderId: null,
            trackingNumber: null,
            trackingUrl: null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });

        console.log('Saving order to Firestore:', JSON.stringify(orderData, null, 2));

        const docRef = await addDoc(collection(db, 'orders'), orderData);
        console.log('Order saved successfully with ID:', docRef.id);

        return NextResponse.json({
            success: true,
            data: {
                id: docRef.id,
                orderNumber,
            },
        });
    } catch (error: any) {
        console.error('Error creating order:', error);
        // Log the full error object for debugging
        if (error.code) console.error('Firestore Error Code:', error.code);
        if (error.message) console.error('Error Message:', error.message);

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create order' },
            { status: 500 }
        );
    }
}
