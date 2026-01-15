import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { uploadImageFromUrl } from '@/lib/storage-utils';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productId } = body;

        if (!productId) {
            return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
        }

        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        const productData = productSnap.data();
        let changed = false;

        // 1. Migrate Gallery Images
        if (productData.images && productData.images.length > 0) {
            const updatedImages = await Promise.all(productData.images.map(async (img: any, index: number) => {
                if (img.url.includes('firebasestorage.googleapis.com') || img.url.includes('storage.googleapis.com')) {
                    return img;
                }

                const fileName = `${productData.slug}-${index + 1}.jpg`;
                const destinationPath = `products/${productData.slug}/${fileName}`;

                try {
                    const newUrl = await uploadImageFromUrl(img.url, destinationPath);
                    changed = true;
                    return { ...img, url: newUrl };
                } catch (err) {
                    console.error(`Migration failed for ${img.url}`, err);
                    return img;
                }
            }));

            if (changed) {
                productData.images = updatedImages;
                productData.featuredImage = updatedImages[0].url;
            }
        }

        // 2. Migrate Variants
        if (productData.variants && productData.variants.length > 0) {
            const updatedVariants = await Promise.all(productData.variants.map(async (variant: any, index: number) => {
                if (!variant.image || variant.image.includes('firebasestorage.googleapis.com') || variant.image.includes('storage.googleapis.com')) {
                    return variant;
                }

                const fileName = `${productData.slug}-variant-${index + 1}.jpg`;
                const destinationPath = `products/${productData.slug}/variants/${fileName}`;

                try {
                    const newUrl = await uploadImageFromUrl(variant.image, destinationPath);
                    changed = true;
                    return { ...variant, image: newUrl };
                } catch (err) {
                    return variant;
                }
            }));

            if (changed) {
                productData.variants = updatedVariants;
            }
        }

        // 3. Migrate Description Images
        if (productData.description) {
            const imgRegex = /<img[^>]+src="([^">]+)"/g;
            const matches = Array.from(productData.description.matchAll(imgRegex));

            if (matches.length > 0) {
                let updatedDescription = productData.description;
                const descTasks = matches.map(async (match: any, index) => {
                    const originalUrl = match[1];
                    if (originalUrl.includes('firebasestorage.googleapis.com') || originalUrl.includes('storage.googleapis.com') || originalUrl.startsWith('data:')) {
                        return { original: originalUrl, updated: originalUrl };
                    }

                    const fileName = `${productData.slug}-desc-${index + 1}.jpg`;
                    const destinationPath = `products/${productData.slug}/description/${fileName}`;

                    try {
                        const newUrl = await uploadImageFromUrl(originalUrl, destinationPath);
                        changed = true;
                        return { original: originalUrl, updated: newUrl };
                    } catch (err) {
                        return { original: originalUrl, updated: originalUrl };
                    }
                });

                const results = await Promise.all(descTasks);
                results.forEach(res => {
                    if (res.original !== res.updated) {
                        updatedDescription = updatedDescription.split(res.original).join(res.updated);
                    }
                });
                productData.description = updatedDescription;
            }
        }

        if (changed) {
            await updateDoc(productRef, {
                images: productData.images,
                featuredImage: productData.featuredImage,
                variants: productData.variants,
                description: productData.description,
                updatedAt: new Date()
            });
        }

        return NextResponse.json({ success: true, migrated: changed });
    } catch (error: any) {
        console.error('Migration API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
