import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore';

// GET: Fetch user wishlist
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        const wishlistRef = collection(db, 'users', userId, 'wishlist');
        const q = query(wishlistRef);
        const snapshot = await getDocs(q);

        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ success: true, data: items });
    } catch (error: any) {
        console.error('Error fetching wishlist:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Add to wishlist
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, productId } = body;

        if (!userId || !productId) {
            return NextResponse.json({ success: false, error: 'User ID and Product ID are required' }, { status: 400 });
        }

        const wishlistRef = collection(db, 'users', userId, 'wishlist');

        // Check for duplicates
        const q = query(wishlistRef, where('productId', '==', productId));
        const existing = await getDocs(q);

        if (!existing.empty) {
            return NextResponse.json({ success: true, message: 'Item already in wishlist', id: existing.docs[0].id });
        }

        // Add timestamp and other product details if provided
        const finalData = {
            ...body,
            createdAt: Timestamp.now()
        };
        // Remove userId from nested data
        delete finalData.userId;

        const docRef = await addDoc(wishlistRef, finalData);

        return NextResponse.json({
            success: true,
            data: { id: docRef.id, ...finalData }
        });
    } catch (error: any) {
        console.error('Error adding to wishlist:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE: Remove from wishlist
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        const itemId = searchParams.get('itemId');

        if (!userId || !itemId) {
            return NextResponse.json({ success: false, error: 'User ID and Item ID are required' }, { status: 400 });
        }

        const itemRef = doc(db, 'users', userId, 'wishlist', itemId);
        await deleteDoc(itemRef);

        return NextResponse.json({ success: true, message: 'Item remove from wishlist' });
    } catch (error: any) {
        console.error('Error deleting wishlist item:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
