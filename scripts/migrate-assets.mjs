import admin from 'firebase-admin';
import { readFileSync, writeFileSync } from 'fs';
// Using native fetch available in Node v22

const serviceAccount = JSON.parse(
    readFileSync('./dripzy-eaa54-firebase-adminsdk-fbsvc-8b19f3603e.json', 'utf8')
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'dripzy-eaa54.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function uploadFromUrl(url, destination) {
    if (!url || typeof url !== 'string' || url.includes('firebasestorage.googleapis.com')) {
        return url;
    }

    try {
        console.log(`Downloading: ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);

        const buffer = Buffer.from(await response.arrayBuffer());
        const file = bucket.file(destination);

        await file.save(buffer, {
            metadata: { contentType: response.headers.get('content-type') || 'image/jpeg' },
            public: true
        });

        // Make public and get URL
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
        console.log(`Uploaded to: ${publicUrl}`);
        return publicUrl;
    } catch (error) {
        console.error(`Migration failed for ${url}:`, error.message);
        return url; // Fallback to original
    }
}

async function migrateTheme() {
    console.log('--- Migrating Theme Config ---');
    const themeRef = db.collection('settings').doc('theme');
    const doc = await themeRef.get();
    if (!doc.exists) return;

    const data = doc.data();
    let changed = false;

    // Migrate Hero Slides
    if (data.hero?.slides) {
        for (let i = 0; i < data.hero.slides.length; i++) {
            const slide = data.hero.slides[i];
            if (slide.image && !slide.image.includes(bucket.name)) {
                data.hero.slides[i].image = await uploadFromUrl(slide.image, `banners/migrated_h_${Date.now()}_${i}.jpg`);
                changed = true;
            }
            if (slide.mobileImage && !slide.mobileImage.includes(bucket.name)) {
                data.hero.slides[i].mobileImage = await uploadFromUrl(slide.mobileImage, `banners/migrated_hm_${Date.now()}_${i}.jpg`);
                changed = true;
            }
        }
    }

    // Migrate Categories
    if (data.categories) {
        for (let i = 0; i < data.categories.length; i++) {
            const cat = data.categories[i];
            if (cat.image && !cat.image.includes(bucket.name)) {
                data.categories[i].image = await uploadFromUrl(cat.image, `categories/migrated_c_${Date.now()}_${i}.jpg`);
                changed = true;
            }
        }
    }

    if (changed) {
        await themeRef.update(data);
        console.log('✅ Theme Assets Migrated!');
    } else {
        console.log('No theme assets needed migration.');
    }
}

async function migrateProducts() {
    console.log('--- Migrating All Products in Parallel ---');
    const snapshot = await db.collection('products').get();

    const tasks = snapshot.docs.map(async (doc) => {
        const product = doc.data();
        let changed = false;

        // Migrate Featured Image
        if (product.featuredImage && !product.featuredImage.includes(bucket.name)) {
            product.featuredImage = await uploadFromUrl(product.featuredImage, `products/${doc.id}/main.jpg`);
            changed = true;
        }

        // Migrate Gallery Images
        if (product.images) {
            for (let i = 0; i < product.images.length; i++) {
                if (product.images[i].url && !product.images[i].url.includes(bucket.name)) {
                    product.images[i].url = await uploadFromUrl(product.images[i].url, `products/${doc.id}/gallery_${i}.jpg`);
                    changed = true;
                }
            }
        }

        // Migrate Variant Images
        if (product.variants) {
            for (let i = 0; i < product.variants.length; i++) {
                if (product.variants[i].image && !product.variants[i].image.includes(bucket.name)) {
                    product.variants[i].image = await uploadFromUrl(product.variants[i].image, `products/${doc.id}/variant_${i}.jpg`);
                    changed = true;
                }
            }
        }

        if (changed) {
            await db.collection('products').doc(doc.id).update(product);
            console.log(`✅ Migrated: ${product.name}`);
        }
    });

    await Promise.all(tasks);
}

async function run() {
    try {
        await migrateTheme();
        await migrateProducts();
        console.log('Migration Complete!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
