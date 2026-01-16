import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load service account
const serviceAccount = JSON.parse(
    readFileSync('./dripzy-eaa54-firebase-adminsdk-fbsvc-8b19f3603e.json', 'utf8')
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'dripzy-eaa54.firebasestorage.app'
});

const bucket = admin.storage().bucket();

async function setCors() {
    console.log('Setting CORS rules for bucket:', bucket.name);

    const cors = [
        {
            origin: ['*'], // In production, replace with ['https://dripzy.in', 'http://localhost:3000']
            method: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS'],
            responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'User-Agent', 'X-Requested-With'],
            maxAgeSeconds: 3600
        }
    ];

    try {
        await bucket.setCorsConfiguration(cors);
        console.log('✅ CORS rules updated successfully!');
    } catch (error) {
        console.error('❌ Error setting CORS:', error);
    }
}

setCors();
