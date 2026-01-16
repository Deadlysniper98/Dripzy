
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// We need to read env vars from .env.local
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), '.env.local')));

// Initialize Firebase
const app = initializeApp({
    apiKey: envConfig.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: envConfig.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: envConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});

const db = getFirestore(app);

async function checkProducts() {
    try {
        const q = query(collection(db, 'products'), limit(5));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
            console.log(`Product ID: ${doc.id}`);
            console.log('Category:', doc.data().category);
            console.log('Tags:', doc.data().tags);
            console.log('Name:', doc.data().name);
            console.log('---');
        });
    } catch (e) {
        console.error(e);
    }
    process.exit();
}

checkProducts();
