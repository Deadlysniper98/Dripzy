
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, writeBatch, doc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
// Note: This script is running in Node context, unable to use "@/lib/categories" directly if it's ES module 
// and this is CJS. We will leave this script as is or update it to use the new logic if it was a module. 
// Since this is a one-off script, I'll focus on the App logic first.
// BUT, wait, the user wants "Auto Categorising Product when PRODUCT are getting Imported". 
// This script `run-auto-tag.js` seems to be for retroactive tagging. 
// I should replicate the logic from `lib/categories.ts` here OR make `lib/categories.ts` compatible.
// `lib/categories.ts` is TS/ESM. `run-auto-tag.js` is CJS. 
// I will skip editing this script for now and focus on the `import/route.ts`.


// Load environment variables
const envConfig = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), '.env.local')));

const firebaseConfig = {
    apiKey: envConfig.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: envConfig.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: envConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: envConfig.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envConfig.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: envConfig.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const KEYWORD_MAP = {
    'electronics': ['phone', 'mobile', 'watch', 'camera', 'laptop', 'tablet', 'digital', 'tech'],
    'clothing': ['shirt', 'pant', 'dress', 'wear', 'cloth', 'hoodie', 'apparel'],
    'home': ['home', 'kitchen', 'decor', 'lamp', 'light', 'storage', 'furniture'],
    'audio': ['headphone', 'earphone', 'speaker', 'audio', 'sound', 'bud', 'music'],
    'chargers': ['charger', 'adapter', 'cable', 'power', 'battery', 'wireless', 'dock', 'hub'],
    'cases': ['case', 'cover', 'protection', 'sleeve', 'bumper', 'pouch'],
    'accessories': ['holder', 'stand', 'mount', 'grip', 'strap', 'accessory'],
    'iphone': ['iphone', 'apple', 'ios'],
    'ipad': ['ipad', 'tablet'],
    'magsafe': ['magsafe', 'magnetic'],
    'anime': ['anime', 'manga', 'naruto', 'one piece', 'goku', 'demon slayer', 'dragon ball'],
    'tech': ['tech', 'smart', 'gadget', 'device']
};

async function runAutoTag() {
    console.log('Starting auto-tagging...');
    try {
        const snapshot = await getDocs(collection(db, 'products'));
        console.log(`Found ${snapshot.size} products.`);

        const batch = writeBatch(db);
        let count = 0;
        let totalUpdates = 0;

        snapshot.docs.forEach((productDoc) => {
            const data = productDoc.data();
            const name = (data.name || '').toLowerCase();
            const categoryStr = (data.category || '').toLowerCase();
            const existingTags = new Set(data.tags || []);

            // Add tags based on keywords matches
            Object.entries(KEYWORD_MAP).forEach(([tag, keywords]) => {
                const matches = keywords.some(k => name.includes(k) || categoryStr.includes(k));
                if (matches) {
                    existingTags.add(tag);
                }
            });

            // Default "all" tag
            existingTags.add('all');

            const newTags = Array.from(existingTags);

            // Check if tags actually changed to avoid unnecessary writes
            const currentSorted = (data.tags || []).sort().join(',');
            const newSorted = newTags.sort().join(',');

            if (currentSorted !== newSorted) {
                batch.update(doc(db, 'products', productDoc.id), {
                    tags: newTags,
                    keywords: [...name.split(' '), ...newTags]
                });
                count++;
                totalUpdates++;
            }
        });

        if (count > 0) {
            await batch.commit();
            console.log(`Successfully updated tags for ${totalUpdates} products.`);
        } else {
            console.log('No products needed updates.');
        }

    } catch (error) {
        console.error('Error auto-tagging:', error);
    }
    process.exit();
}

runAutoTag();
