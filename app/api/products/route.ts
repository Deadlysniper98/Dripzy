import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, startAfter, where, doc, getDoc } from 'firebase/firestore';

// GET: List all products with pagination and filtering
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const pageSize = parseInt(searchParams.get('limit') || '20');
        const status = searchParams.get('status');
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        // Build query constraints
        let constraints: any[] = [];

        // Apply filters
        if (status && status !== 'all') {
            constraints.push(where('status', '==', status));
        }

        if (category && category !== 'all') {
            constraints.push(where('category', '==', category));
        }

        // Always sort by latest and apply limit
        constraints.push(orderBy('createdAt', 'desc'));
        constraints.push(limit(pageSize));

        const q = query(collection(db, 'products'), ...constraints);

        const snapshot = await getDocs(q);

        let products: any[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
        }));

        // Client-side search filter (for now - could be improved with Algolia/ElasticSearch)
        if (search) {
            const searchLower = search.toLowerCase();
            products = products.filter((p: any) =>
                p.name?.toLowerCase().includes(searchLower) ||
                p.sku?.toLowerCase().includes(searchLower)
            );
        }

        // Get total count (approximate for now)
        const countSnapshot = await getDocs(collection(db, 'products'));
        const totalCount = countSnapshot.size;

        return NextResponse.json({
            success: true,
            data: {
                products,
                totalCount,
                pageSize,
            },
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch products'
            },
            { status: 500 }
        );
    }
}
