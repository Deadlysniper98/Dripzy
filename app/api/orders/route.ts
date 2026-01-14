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

// POST: Create a new order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
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

        // Generate order number
        const orderNumber = `DRZ${Date.now().toString().slice(-8)}`;

        const orderData = {
            orderNumber,
            customer: {
                name: customer,
                email,
                phone,
            },
            shippingAddress,
            items: items.map((item: any) => ({
                productId: item.productId,
                variantId: item.variantId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                currency: item.currency || 'USD',
            })),
            subtotal,
            shipping,
            total,
            currency,
            paymentMethod,
            paymentId,
            status: 'pending', // pending, processing, shipped, delivered, cancelled
            fulfillmentStatus: 'unfulfilled', // unfulfilled, pending, fulfilled
            cjOrderId: null, // Will be set when fulfilled via CJ
            trackingNumber: null,
            trackingUrl: null,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, 'orders'), orderData);

        return NextResponse.json({
            success: true,
            data: {
                id: docRef.id,
                orderNumber,
            },
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create order' },
            { status: 500 }
        );
    }
}
