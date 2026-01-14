import { NextRequest, NextResponse } from 'next/server';
import { cjClient } from '@/lib/cj-client';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        const params = {
            page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
            size: searchParams.get('size') ? parseInt(searchParams.get('size')!) : 20,
            keyWord: searchParams.get('keyword') || undefined,
            categoryId: searchParams.get('categoryId') || undefined,
            minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
            maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
            countryCode: searchParams.get('countryCode') || undefined,
            sort: searchParams.get('sort') as 'priceAsc' | 'priceDesc' | 'listedNumDesc' | 'createAtDesc' | undefined,
        };

        const products = await cjClient.searchProducts(params);

        return NextResponse.json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error('Error fetching CJ products:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch products'
            },
            { status: 500 }
        );
    }
}
