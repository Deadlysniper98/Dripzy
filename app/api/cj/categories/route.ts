import { NextResponse } from 'next/server';
import { cjClient } from '@/lib/cj-client';

export async function GET() {
    try {
        const categories = await cjClient.getCategories();

        return NextResponse.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error('Error fetching CJ categories:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch categories'
            },
            { status: 500 }
        );
    }
}
