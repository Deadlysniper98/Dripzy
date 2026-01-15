import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore';

// GET: Fetch user addresses
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        const addressesRef = collection(db, 'users', userId, 'addresses');
        const q = query(addressesRef);
        const snapshot = await getDocs(q);

        const addresses = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ success: true, data: addresses });
    } catch (error: any) {
        console.error('Error fetching addresses:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Add new address
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, ...addressData } = body;

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        const addressesRef = collection(db, 'users', userId, 'addresses');

        // Add timestamp
        const finalData = {
            ...addressData,
            createdAt: Timestamp.now()
        };

        const docRef = await addDoc(addressesRef, finalData);

        return NextResponse.json({
            success: true,
            data: { id: docRef.id, ...finalData }
        });
    } catch (error: any) {
        console.error('Error adding address:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE: Remove address
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        const addressId = searchParams.get('addressId');

        if (!userId || !addressId) {
            return NextResponse.json({ success: false, error: 'User ID and Address ID are required' }, { status: 400 });
        }

        const addressRef = doc(db, 'users', userId, 'addresses', addressId);
        await deleteDoc(addressRef);

        return NextResponse.json({ success: true, message: 'Address deleted' });
    } catch (error: any) {
        console.error('Error deleting address:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
