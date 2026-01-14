import { NextRequest, NextResponse } from 'next/server';
import { cjClient } from '@/lib/cj-client';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { convertCJProductToProduct, generateSlug } from '@/lib/types/product';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { cjProductId, marginPercent = 50, status = 'draft' } = body;

        if (!cjProductId) {
            return NextResponse.json(
                { success: false, error: 'CJ Product ID is required' },
                { status: 400 }
            );
        }

        // Check if product already imported
        const existingQuery = query(
            collection(db, 'products'),
            where('cjProductId', '==', cjProductId)
        );
        const existingDocs = await getDocs(existingQuery);

        if (!existingDocs.empty) {
            return NextResponse.json(
                { success: false, error: 'Product already imported', existingId: existingDocs.docs[0].id },
                { status: 409 }
            );
        }

        // Fetch product details from CJ
        const cjProduct = await cjClient.getProductDetails(cjProductId);

        // Filter variants if selectedVariants is provided
        let variantsToImport = cjProduct.variants;
        if (body.selectedVariants && Array.isArray(body.selectedVariants)) {
            variantsToImport = cjProduct.variants?.filter(v =>
                body.selectedVariants.includes(v.vid)
            );
        }

        // Convert to our product format
        const productData = convertCJProductToProduct(
            {
                ...cjProduct,
                variants: variantsToImport?.map(v => ({
                    vid: v.vid,
                    variantNameEn: v.variantNameEn,
                    variantSku: v.variantSku,
                    variantKey: v.variantKey,
                    variantSellPrice: v.variantSellPrice,
                    variantWeight: v.variantWeight,
                    variantLength: v.variantLength,
                    variantWidth: v.variantWidth,
                    variantHeight: v.variantHeight,
                    inventories: v.inventories,
                })),
                productImages: cjProduct.productImages,
                productImageSet: cjProduct.productImageSet,
            },
            marginPercent
        );

        // Ensure featured image is explicitly set to the first image if missing
        if (!productData.featuredImage && productData.images && productData.images.length > 0) {
            productData.featuredImage = productData.images[0].url;
        }

        // Override status if provided
        productData.status = status;
        if (status === 'active') {
            productData.isVisible = true;
        }

        // Ensure unique slug
        let slug = productData.slug;
        let slugCounter = 1;
        let slugExists = true;

        while (slugExists) {
            const slugQuery = query(
                collection(db, 'products'),
                where('slug', '==', slug)
            );
            const slugDocs = await getDocs(slugQuery);

            if (slugDocs.empty) {
                slugExists = false;
            } else {
                slugCounter++;
                slug = `${productData.slug}-${slugCounter}`;
            }
        }
        productData.slug = slug;

        // Save to Firebase
        const docRef = await addDoc(collection(db, 'products'), {
            ...productData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return NextResponse.json({
            success: true,
            message: 'Product imported successfully',
            data: {
                id: docRef.id,
                name: productData.name,
                slug: productData.slug,
                price: productData.price,
                costPrice: productData.costPrice,
                status: productData.status,
            },
        });
    } catch (error) {
        console.error('Error importing CJ product:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to import product'
            },
            { status: 500 }
        );
    }
}
