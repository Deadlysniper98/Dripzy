
const fs = require('fs');
const path = require('path');

async function testImport() {
    console.log('--- RUNNING SEO IMPORT TEST ---');

    // 1. Get a product ID (just use a hardcoded one for reliable test if possible, or search)
    // I will try to hit the import API for a known product
    const cjProductId = '0A6A9B53-6E74-4C3D-882E-73D30A6A9B53'; // Example format

    const payload = {
        cjProductId,
        marginPercent: 50,
        status: 'draft'
    };

    console.log(`Importing product ${cjProductId}...`);

    // We can't easily hit localhost:3000 if the server is not listening on that or if it's external
    // But we are on the same machine.
    try {
        const response = await fetch('http://localhost:3000/api/cj/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Import Response:', JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('SUCCESS: Product imported.');
            // Note: Since we are in a sandbox, we might not be able to check Firestore easily,
            // but the success message from the API means the sequence finished.
        } else {
            console.log('FAILURE:', data.error);
        }
    } catch (err) {
        console.error('Server error or timeout:', err.message);
    }
}

testImport();
