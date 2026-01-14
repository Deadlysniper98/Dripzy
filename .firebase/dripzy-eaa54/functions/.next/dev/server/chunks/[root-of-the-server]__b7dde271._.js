module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/cj-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CJDropshippingClient",
    ()=>CJDropshippingClient,
    "cjClient",
    ()=>cjClient
]);
// CJ Dropshipping API Client
// Documentation: https://developers.cjdropshipping.cn/en/api/introduction.html
const BASE_URL = 'https://developers.cjdropshipping.com/api2.0/v1';
class CJDropshippingClient {
    accessToken;
    refreshToken;
    accessTokenExpiry;
    refreshTokenExpiry;
    apiKey;
    constructor(){
        this.accessToken = process.env.CJ_ACCESS_TOKEN || '';
        this.refreshToken = process.env.CJ_REFRESH_TOKEN || '';
        this.apiKey = process.env.CJ_API_KEY || '';
        this.accessTokenExpiry = process.env.CJ_ACCESS_TOKEN_EXPIRY ? new Date(process.env.CJ_ACCESS_TOKEN_EXPIRY) : null;
        this.refreshTokenExpiry = process.env.CJ_REFRESH_TOKEN_EXPIRY ? new Date(process.env.CJ_REFRESH_TOKEN_EXPIRY) : null;
    }
    /**
     * Make an authenticated request to CJ API
     */ async request(endpoint, options = {}) {
        // Check if we need to refresh the token
        if (this.shouldRefreshToken()) {
            await this.refreshAccessToken();
        }
        if (!this.accessToken) {
            throw new Error('CJ_ACCESS_TOKEN is not configured. Please add your CJ API credentials to .env.local');
        }
        const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
        const res = await fetch(url, {
            ...options,
            headers: {
                'CJ-Access-Token': this.accessToken,
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        const data = await res.json();
        if (!res.ok || data.code !== 200) {
            console.error('CJ API Error:', data);
            throw new Error(data.message || `CJ API Error: ${res.statusText}`);
        }
        return data;
    }
    /**
     * Check if access token needs refresh (within 1 day of expiry)
     */ shouldRefreshToken() {
        if (!this.accessTokenExpiry) return false;
        const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        return this.accessTokenExpiry < oneDayFromNow;
    }
    /**
     * Get new access token using API key
     */ async getAccessToken() {
        if (!this.apiKey) {
            throw new Error('CJ_API_KEY is not configured');
        }
        const res = await fetch(`${BASE_URL}/authentication/getAccessToken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                apiKey: this.apiKey
            })
        });
        const data = await res.json();
        if (!data.result || data.code !== 200) {
            throw new Error(data.message || 'Failed to get access token');
        }
        this.accessToken = data.data.accessToken;
        this.refreshToken = data.data.refreshToken;
        this.accessTokenExpiry = new Date(data.data.accessTokenExpiryDate);
        this.refreshTokenExpiry = new Date(data.data.refreshTokenExpiryDate);
        return data.data;
    }
    /**
     * Refresh access token using refresh token
     */ async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available. Please get a new access token.');
        }
        const res = await fetch(`${BASE_URL}/authentication/refreshAccessToken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refreshToken: this.refreshToken
            })
        });
        const data = await res.json();
        if (!data.result || data.code !== 200) {
            // Refresh token may be expired, need to get new tokens
            throw new Error('Refresh token expired. Please get a new access token using API key.');
        }
        this.accessToken = data.data.accessToken;
        this.refreshToken = data.data.refreshToken;
        this.accessTokenExpiry = new Date(data.data.accessTokenExpiryDate);
        this.refreshTokenExpiry = new Date(data.data.refreshTokenExpiryDate);
        return data.data;
    }
    /**
     * Get product categories from CJ
     */ async getCategories() {
        const response = await this.request('/product/getCategory', {
            method: 'GET'
        });
        return response.data;
    }
    /**
     * Search/List products using V2 API (better performance with Elasticsearch)
     */ async searchProducts(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.size) queryParams.append('size', params.size.toString());
        if (params.keyWord) queryParams.append('keyWord', params.keyWord);
        if (params.categoryId) queryParams.append('categoryId', params.categoryId);
        if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
        if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
        if (params.countryCode) queryParams.append('countryCode', params.countryCode);
        if (params.sort) queryParams.append('sort', params.sort);
        const response = await this.request(`/product/listV2?${queryParams.toString()}`, {
            method: 'GET'
        });
        return response.data;
    }
    /**
     * Get product details by product ID
     */ async getProductDetails(pid) {
        const response = await this.request(`/product/query?pid=${pid}`, {
            method: 'GET'
        });
        return response.data;
    }
    /**
     * Get list of products saved to "My Products" in CJ account
     */ async getMyProducts(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.size) queryParams.append('size', params.size.toString());
        if (params.keyword) queryParams.append('keyword', params.keyword);
        const response = await this.request(`/product/myProduct/query?${queryParams.toString()}`, {
            method: 'GET'
        });
        return response.data;
    }
    /**
     * Add a product to "My Products" in CJ account
     */ async addToMyProducts(productId) {
        const response = await this.request('/product/addToMine', {
            method: 'POST',
            body: JSON.stringify({
                productId
            })
        });
        return response.result;
    }
    /**
     * Get product inventory by variant IDs
     */ async getInventory(variantIds) {
        const response = await this.request('/product/inventory/query', {
            method: 'POST',
            body: JSON.stringify({
                variantIds
            })
        });
        return response.data;
    }
    /**
     * Update client tokens (e.g., after manual refresh)
     */ setTokens(accessToken, refreshToken) {
        this.accessToken = accessToken;
        if (refreshToken) {
            this.refreshToken = refreshToken;
        }
    }
}
const cjClient = new CJDropshippingClient();
;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/lib/firebase.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "app",
    ()=>app,
    "auth",
    ()=>auth,
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/app/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/node-esm/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.node.mjs [app-route] (ecmascript)");
;
;
;
const firebaseConfig = {
    apiKey: ("TURBOPACK compile-time value", "AIzaSyABlu2Vj1SRO55AQWWYeekQ_wUCcFC32os"),
    authDomain: ("TURBOPACK compile-time value", "dripzy-eaa54.firebaseapp.com"),
    projectId: ("TURBOPACK compile-time value", "dripzy-eaa54"),
    storageBucket: ("TURBOPACK compile-time value", "dripzy-eaa54.firebasestorage.app"),
    messagingSenderId: ("TURBOPACK compile-time value", "1048110942874"),
    appId: ("TURBOPACK compile-time value", "1:1048110942874:web:5051f6e00d351c5ab82d23"),
    measurementId: ("TURBOPACK compile-time value", "G-J397SXYKWL")
};
// Initialize Firebase
const app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getApps"])().length === 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initializeApp"])(firebaseConfig) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getApps"])()[0];
const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuth"])(app);
const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getFirestore"])(app);
;
}),
"[project]/lib/types/product.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Product types for Dripzy store
// These are used for products imported from CJ Dropshipping and stored in Firebase
__turbopack_context__.s([
    "calculateRetailPrice",
    ()=>calculateRetailPrice,
    "convertCJProductToProduct",
    ()=>convertCJProductToProduct,
    "generateSlug",
    ()=>generateSlug
]);
function generateSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function calculateRetailPrice(costPrice, marginPercent = 50) {
    return Math.ceil(costPrice * (1 + marginPercent / 100));
}
function convertCJProductToProduct(cjProduct, marginPercent = 50) {
    const costPrice = cjProduct.sellPrice;
    const retailPrice = calculateRetailPrice(costPrice, marginPercent);
    const variants = cjProduct.variants?.map((v, index)=>({
            id: v.vid,
            name: v.variantNameEn,
            sku: v.variantSku,
            key: v.variantKey,
            price: calculateRetailPrice(v.variantSellPrice, marginPercent),
            costPrice: v.variantSellPrice,
            weight: v.variantWeight,
            dimensions: v.variantLength ? {
                length: v.variantLength,
                width: v.variantWidth || 0,
                height: v.variantHeight || 0
            } : undefined,
            stock: v.inventories?.[0]?.totalInventory || 0
        })) || [];
    const totalStock = variants.reduce((sum, v)=>sum + v.stock, 0) || 100;
    return {
        name: cjProduct.productNameEn,
        slug: generateSlug(cjProduct.productNameEn),
        sku: cjProduct.productSku,
        description: cjProduct.description || '',
        price: retailPrice,
        compareAtPrice: Math.ceil(retailPrice * 1.2),
        costPrice: costPrice,
        currency: 'INR',
        images: [
            {
                id: '1',
                url: cjProduct.productImage,
                alt: cjProduct.productNameEn,
                position: 0
            }
        ],
        featuredImage: cjProduct.productImage,
        category: cjProduct.categoryName?.split('/')[0]?.trim() || 'General',
        categoryId: cjProduct.categoryId,
        tags: [],
        variants: variants,
        hasVariants: variants.length > 1,
        stock: totalStock,
        trackInventory: true,
        lowStockThreshold: 10,
        cjProductId: cjProduct.pid,
        cjSku: cjProduct.productSku,
        status: 'draft',
        isVisible: false,
        isFeatured: false
    };
}
}),
"[project]/app/api/cj/import/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cj$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cj-client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/firebase.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.node.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$types$2f$product$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/types/product.ts [app-route] (ecmascript)");
;
;
;
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const { cjProductId, marginPercent = 50, status = 'draft' } = body;
        if (!cjProductId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'CJ Product ID is required'
            }, {
                status: 400
            });
        }
        // Check if product already imported
        const existingQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"], 'products'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["where"])('cjProductId', '==', cjProductId));
        const existingDocs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDocs"])(existingQuery);
        if (!existingDocs.empty) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Product already imported',
                existingId: existingDocs.docs[0].id
            }, {
                status: 409
            });
        }
        // Fetch product details from CJ
        const cjProduct = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cj$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cjClient"].getProductDetails(cjProductId);
        // Convert to our product format
        const productData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$types$2f$product$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["convertCJProductToProduct"])({
            pid: cjProduct.pid,
            productNameEn: cjProduct.productNameEn,
            productSku: cjProduct.productSku,
            productImage: cjProduct.productImage,
            sellPrice: cjProduct.sellPrice,
            description: cjProduct.description,
            categoryName: cjProduct.categoryName,
            categoryId: cjProduct.categoryId,
            variants: cjProduct.variants?.map((v)=>({
                    vid: v.vid,
                    variantNameEn: v.variantNameEn,
                    variantSku: v.variantSku,
                    variantKey: v.variantKey,
                    variantSellPrice: v.variantSellPrice,
                    variantWeight: v.variantWeight,
                    variantLength: v.variantLength,
                    variantWidth: v.variantWidth,
                    variantHeight: v.variantHeight,
                    inventories: v.inventories
                }))
        }, marginPercent);
        // Override status if provided
        productData.status = status;
        // Ensure unique slug
        let slug = productData.slug;
        let slugCounter = 1;
        let slugExists = true;
        while(slugExists){
            const slugQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"], 'products'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["where"])('slug', '==', slug));
            const slugDocs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDocs"])(slugQuery);
            if (slugDocs.empty) {
                slugExists = false;
            } else {
                slugCounter++;
                slug = `${productData.slug}-${slugCounter}`;
            }
        }
        productData.slug = slug;
        // Save to Firebase
        const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$firebase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"], 'products'), {
            ...productData,
            createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: 'Product imported successfully',
            data: {
                id: docRef.id,
                name: productData.name,
                slug: productData.slug,
                price: productData.price,
                costPrice: productData.costPrice,
                status: productData.status
            }
        });
    } catch (error) {
        console.error('Error importing CJ product:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to import product'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b7dde271._.js.map