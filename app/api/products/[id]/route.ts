import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

// GET: Get a single product by ID or slug
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const docRef = doc(db, 'products', id);
        let docSnap = await getDoc(docRef);

        // If not found by ID, try finding by slug
        if (!docSnap.exists()) {
            const slugQuery = query(
                collection(db, 'products'),
                where('slug', '==', id),
                limit(1)
            );
            const slugDocs = await getDocs(slugQuery);

            if (!slugDocs.empty) {
                docSnap = slugDocs.docs[0] as any;
            }
        }

        if (!docSnap.exists()) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        const productData = docSnap.data();
        const product = {
            id: docSnap.id,
            ...productData,
            createdAt: productData.createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: productData.updatedAt?.toDate?.()?.toISOString() || null,
        };

        return NextResponse.json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch product'
            },
            { status: 500 }
        );
    }
}

// PUT: Update a product
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        // Update the product
        const updateData = {
            ...body,
            updatedAt: new Date(),
        };

        // Don't allow updating these fields
        delete updateData.id;
        delete updateData.createdAt;

        await updateDoc(docRef, updateData);

        return NextResponse.json({
            success: true,
            message: 'Product updated successfully',
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update product'
            },
            { status: 500 }
        );
    }
}

// DELETE: Delete a product
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            console.log('DELETE Error: No ID provided');
            return NextResponse.json(
                { success: false, error: 'Product ID is required' },
                { status: 400 }
            );
        }

        console.log(`[API] Attempting to delete product: ${id}`);
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.log(`[API] Product not found in Firestore: ${id}`);
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        console.log(`[API] Deleting doc: ${id}`);
        await deleteDoc(docRef);
        console.log(`[API] Successfully deleted doc: ${id}`);

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete product'
            },
            { status: 500 }
        );
    }
}
