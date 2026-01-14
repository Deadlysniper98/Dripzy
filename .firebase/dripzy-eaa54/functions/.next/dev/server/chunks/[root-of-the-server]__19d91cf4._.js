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
"[project]/app/api/cj/products/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cj$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cj-client.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const params = {
            page: searchParams.get('page') ? parseInt(searchParams.get('page')) : 1,
            size: searchParams.get('size') ? parseInt(searchParams.get('size')) : 20,
            keyWord: searchParams.get('keyword') || undefined,
            categoryId: searchParams.get('categoryId') || undefined,
            minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : undefined,
            maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : undefined,
            countryCode: searchParams.get('countryCode') || undefined,
            sort: searchParams.get('sort')
        };
        const products = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cj$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cjClient"].searchProducts(params);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('Error fetching CJ products:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch products'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__19d91cf4._.js.map