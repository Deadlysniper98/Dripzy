
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load env vars from .env.local
try {
    const envPath = path.resolve(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach((line: string) => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
        console.log('Loaded .env.local');
    }
} catch (e) {
    console.error('Error loading .env.local', e);
}

// Mock fetch for cj-client or import it?
// Since we are running in node, we need to ensure fetch is available (Node 18+ has it)
// We will import the CJ Client source directly.
// But cj-client.ts exports a class and instance.

// We need to handle the imports in cj-client.ts which might not work in standalone node script if it imports other things.
// cj-client.ts only uses standard env vars and fetch.

// Copying necessary parts of cj-client to avoid import issues with relative paths
const BASE_URL = 'https://developers.cjdropshipping.com/api2.0/v1';

class CJDropshippingClient {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: Date | null;
    refreshTokenExpiry: Date | null;
    apiKey: string;

    constructor() {
        this.accessToken = process.env.CJ_ACCESS_TOKEN || '';
        this.refreshToken = process.env.CJ_REFRESH_TOKEN || '';
        this.apiKey = process.env.CJ_API_KEY || '';
        this.accessTokenExpiry = process.env.CJ_ACCESS_TOKEN_EXPIRY
            ? new Date(process.env.CJ_ACCESS_TOKEN_EXPIRY)
            : null;
        this.refreshTokenExpiry = process.env.CJ_REFRESH_TOKEN_EXPIRY
            ? new Date(process.env.CJ_REFRESH_TOKEN_EXPIRY)
            : null;
    }

    async request(endpoint: string, options: any = {}) {
        // Simple request implementation for testing
        const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
        console.log(`Requesting: ${url}`);

        const headers = {
            'CJ-Access-Token': this.accessToken,
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const res = await fetch(url, {
            ...options,
            headers
        });

        const data = await res.json();
        return data;
    }

    async searchProducts(params: any = {}) {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.size) queryParams.append('size', params.size.toString());

        const response = await this.request(
            `/product/listV2?${queryParams.toString()}`,
            { method: 'GET' }
        );
        return response.data;
    }

    async calculateBulkShipping(params: {
        startCountryCode: string;
        endCountryCode: string;
        products: { vid: string; quantity: number }[];
    }) {
        const body = {
            startCountryCode: params.startCountryCode,
            endCountryCode: params.endCountryCode,
            products: params.products
        };

        console.log('Shipping Request Body:', JSON.stringify(body, null, 2));

        const response = await this.request(
            `/logistic/freightCalculate`,
            {
                method: 'POST',
                body: JSON.stringify(body)
            }
        );

        console.log('Shipping Response:', JSON.stringify(response, null, 2));
        return response.data || [];
    }
}

async function runTest() {
    const client = new CJDropshippingClient();

    if (!client.accessToken) {
        console.error('CJ_ACCESS_TOKEN not found in env');
        return;
    }

    console.log('1. Searching for a product to get a valid VID...');
    const searchRes = await client.searchProducts({ page: 1, size: 1 });

    if (!searchRes || !searchRes.content || searchRes.content.length === 0) {
        console.error('No products found');
        return;
    }

    // The listV2 returns products but we might need details to get variants
    // searchRes.content[0].productList[0]

    const product = searchRes.content[0].productList[0];
    console.log(`Found product: ${product.nameEn} (ID: ${product.id})`);

    // Only product details give us variants usually? 
    // Wait, the Product type in cj-client.ts doesn't show variants in list response.
    // We need to get details.

    console.log('2. Fetching product details to get variants...');
    const detailRes = await client.request(`/product/query?pid=${product.id}`, { method: 'GET' });
    const fullProduct = detailRes.data;

    if (!fullProduct || !fullProduct.variants || fullProduct.variants.length === 0) {
        console.error('Product has no variants');
        return;
    }

    const variant = fullProduct.variants[0];
    console.log(`Using Variant: ${variant.variantNameEn} (VID: ${variant.vid})`);

    console.log('3. Calculating Shipping...');
    const rates = await client.calculateBulkShipping({
        startCountryCode: 'CN',
        endCountryCode: 'US',
        products: [{ vid: variant.vid, quantity: 1 }]
    });

    console.log(`Found ${rates.length} rates.`);
}

runTest().catch(console.error);
