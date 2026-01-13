import { NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount, currency = 'USD' } = body;

        if (!razorpay) {
            console.warn('Razorpay not configured');
            return NextResponse.json({ error: 'Payment configuration missing' }, { status: 503 });
        }

        const options = {
            amount: Math.round(amount * 100), // amount in lowest denomination
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return NextResponse.json(
            { error: 'Error creating order' },
            { status: 500 }
        );
    }
}
