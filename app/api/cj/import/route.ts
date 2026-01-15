import { NextRequest, NextResponse } from 'next/server';
import { cjClient } from '@/lib/cj-client';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { convertCJProductToProduct, generateSlug } from '@/lib/types/product';
import { uploadImageFromUrl } from '@/lib/storage-utils';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { cjProductId, marginPercent = 50, status = 'draft', fast = false } = body;

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

        // Filter images if selectedImages is provided
        let imagesToImport = cjProduct.productImages;
        if (body.selectedImages && Array.isArray(body.selectedImages) && body.selectedImages.length > 0) {
            imagesToImport = body.selectedImages;
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
                    variantImage: v.variantImage,
                    inventories: v.inventories,
                })),
                productImages: imagesToImport,
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

        // Process images: Upload to Firebase Storage
        if (!fast && productData.images && productData.images.length > 0) {
            try {
                const uploadPromises = productData.images.map(async (img, index) => {
                    const fileName = `${productData.slug}-${index + 1}.jpg`;
                    const destinationPath = `products/${productData.slug}/${fileName}`;

                    try {
                        const newUrl = await uploadImageFromUrl(img.url, destinationPath);
                        return { ...img, url: newUrl };
                    } catch (err) {
                        console.error(`Failed to upload image ${img.url}:`, err);
                        return img; // Keep original URL if upload fails
                    }
                });

                const updatedImages = await Promise.all(uploadPromises);
                productData.images = updatedImages;

                // Update featured image to point to the new URL of the first image
                if (updatedImages.length > 0) {
                    productData.featuredImage = updatedImages[0].url;
                }
            } catch (imageError) {
                console.error('Error processing product images:', imageError);
                // Continue with import even if image processing fails partially
            }
        }

        // Process variant images: Upload to Firebase Storage
        if (!fast && productData.variants && productData.variants.length > 0) {
            try {
                const variantUploadPromises = productData.variants.map(async (variant, index) => {
                    if (!variant.image || variant.image.includes('firebasestorage.googleapis.com')) {
                        return variant;
                    }

                    const fileName = `${productData.slug}-variant-${index + 1}.jpg`;
                    const destinationPath = `products/${productData.slug}/variants/${fileName}`;

                    try {
                        const newUrl = await uploadImageFromUrl(variant.image, destinationPath);
                        return { ...variant, image: newUrl };
                    } catch (err) {
                        console.error(`Failed to upload variant image ${variant.image}:`, err);
                        return variant; // Keep original URL if upload fails
                    }
                });

                const updatedVariants = await Promise.all(variantUploadPromises);
                productData.variants = updatedVariants;
            } catch (variantImageError) {
                console.error('Error processing variant images:', variantImageError);
            }
        }

        // Process description images: Upload to Firebase Storage
        if (!fast && productData.description) {
            try {
                // Find all image URLs in the description
                const imgRegex = /<img[^>]+src="([^">]+)"/g;
                const matches = Array.from(productData.description.matchAll(imgRegex));

                if (matches.length > 0) {
                    let updatedDescription = productData.description;
                    const descUploadPromises = matches.map(async (match, index) => {
                        const originalUrl = match[1];

                        // Skip if already a Firebase URL or external but somehow handled
                        if (!originalUrl || originalUrl.includes('firebasestorage.googleapis.com') || originalUrl.startsWith('data:')) {
                            return { original: originalUrl, updated: originalUrl };
                        }

                        const fileName = `${productData.slug}-desc-${index + 1}.jpg`;
                        const destinationPath = `products/${productData.slug}/description/${fileName}`;

                        try {
                            const newUrl = await uploadImageFromUrl(originalUrl, destinationPath);
                            return { original: originalUrl, updated: newUrl };
                        } catch (err) {
                            console.error(`Failed to upload description image ${originalUrl}:`, err);
                            return { original: originalUrl, updated: originalUrl }; // Keep original on failure
                        }
                    });

                    const results = await Promise.all(descUploadPromises);

                    // Replace original URLs with the new Firebase URLs
                    results.forEach(res => {
                        if (res.original !== res.updated) {
                            // Use a simple replace (might replace multiple occurrences of same image which is actually good)
                            updatedDescription = updatedDescription.split(res.original).join(res.updated);
                        }
                    });

                    productData.description = updatedDescription;
                }
            } catch (descImageError) {
                console.error('Error processing description images:', descImageError);
            }
        }

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
