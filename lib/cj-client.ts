// CJ Dropshipping API Client
// Documentation: https://developers.cjdropshipping.cn/en/api/introduction.html

const BASE_URL = 'https://developers.cjdropshipping.com/api2.0/v1';

// Types for CJ API responses
export interface CJProduct {
    id: string;
    nameEn: string;
    sku: string;
    spu: string;
    bigImage: string;
    sellPrice: string;
    nowPrice?: string;
    discountPrice?: string;
    discountPriceRate?: string;
    listedNum: number;
    categoryId: string;
    threeCategoryName?: string;
    twoCategoryName?: string;
    oneCategoryName?: string;
    productType: string;
    supplierName?: string;
    warehouseInventoryNum?: number;
    currency?: string;
    description?: string;
    deliveryCycle?: string;
}

export interface CJProductDetails {
    pid: string;
    productName: string;
    productNameEn: string;
    productSku: string;
    productImage: string;
    productImages: string[];
    productImageSet?: string[]; // Added this as fallback for gallery
    productWeight: string;
    productUnit: string;
    productType: string;
    categoryId: string;
    categoryName: string;
    sellPrice: number;
    description: string;
    suggestSellPrice: string;
    listedNum: number;
    status: string;
    variants: CJVariant[];
    createrTime: string;
}

export interface CJVariant {
    vid: string;
    pid: string;
    variantNameEn: string;
    variantSku: string;
    variantKey: string;
    variantLength: number;
    variantWidth: number;
    variantHeight: number;
    variantWeight: number;
    variantSellPrice: number;
    variantSugSellPrice?: number;
    variantImage?: string;
    inventories?: CJInventory[];
}

export interface CJInventory {
    countryCode: string;
    totalInventory: number;
    cjInventory: number;
    factoryInventory: number;
}

export interface CJCategory {
    categoryFirstName: string;
    categoryFirstList: {
        categorySecondName: string;
        categorySecondList: {
            categoryId: string;
            categoryName: string;
        }[];
    }[];
}

export interface CJAuthTokens {
    accessToken: string;
    accessTokenExpiryDate: string;
    refreshToken: string;
    refreshTokenExpiryDate: string;
    createDate: string;
    openId?: number;
}

export interface CJApiResponse<T> {
    code: number;
    result: boolean;
    message: string;
    data: T;
    requestId: string;
    success?: boolean;
}

export interface CJProductListResponse {
    pageSize: number;
    pageNumber: number;
    totalRecords: number;
    totalPages: number;
    content: {
        productList: CJProduct[];
        relatedCategoryList?: { categoryId: string; categoryName: string }[];
        keyWord?: string;
    }[];
}

export interface ProductSearchParams {
    page?: number;
    size?: number;
    keyWord?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    countryCode?: string;
    sort?: 'priceAsc' | 'priceDesc' | 'listedNumDesc' | 'createAtDesc';
}

class CJDropshippingClient {
    private accessToken: string;
    private refreshToken: string;
    private accessTokenExpiry: Date | null;
    private refreshTokenExpiry: Date | null;
    private apiKey: string;

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

    /**
     * Make an authenticated request to CJ API
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<CJApiResponse<T>> {
        // Check if we need to refresh the token
        if (this.shouldRefreshToken()) {
            await this.refreshAccessToken();
        }

        if (!this.accessToken) {
            throw new Error('CJ_ACCESS_TOKEN is not configured. Please add your CJ API credentials to .env.local');
        }

        const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
        console.log(`[CJ-API] Requesting: ${url}`);

        const res = await fetch(url, {
            ...options,
            headers: {
                'CJ-Access-Token': this.accessToken,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data = await res.json();
        console.log(`[CJ-API] Response Code: ${data.code}, Result: ${data.result}`);

        if (!res.ok || data.code !== 200) {
            console.error('[CJ-API] Error Full Data:', JSON.stringify(data, null, 2));
            const error = new Error(data.message || `CJ API Error: ${res.statusText}`);
            (error as any).fullData = data;
            throw error;
        }

        return data;
    }

    /**
     * Check if access token needs refresh (within 1 day of expiry)
     */
    private shouldRefreshToken(): boolean {
        if (!this.accessTokenExpiry) return false;
        const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        return this.accessTokenExpiry < oneDayFromNow;
    }

    /**
     * Get new access token using API key
     */
    async getAccessToken(): Promise<CJAuthTokens> {
        if (!this.apiKey) {
            throw new Error('CJ_API_KEY is not configured');
        }

        const res = await fetch(`${BASE_URL}/authentication/getAccessToken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ apiKey: this.apiKey }),
        });

        const data: CJApiResponse<CJAuthTokens> = await res.json();

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
     */
    async refreshAccessToken(): Promise<CJAuthTokens> {
        if (!this.refreshToken) {
            throw new Error('No refresh token available. Please get a new access token.');
        }

        const res = await fetch(`${BASE_URL}/authentication/refreshAccessToken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken: this.refreshToken }),
        });

        const data: CJApiResponse<CJAuthTokens> = await res.json();

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
     */
    async getCategories(): Promise<CJCategory[]> {
        const response = await this.request<CJCategory[]>('/product/getCategory', {
            method: 'GET',
        });
        return response.data;
    }

    /**
     * Search/List products using V2 API (better performance with Elasticsearch)
     */
    async searchProducts(params: ProductSearchParams = {}): Promise<CJProductListResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.size) queryParams.append('size', params.size.toString());
        if (params.keyWord) queryParams.append('keyWord', params.keyWord);
        if (params.categoryId) queryParams.append('categoryId', params.categoryId);
        if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
        if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
        if (params.countryCode) queryParams.append('countryCode', params.countryCode);
        if (params.sort) queryParams.append('sort', params.sort);

        const response = await this.request<CJProductListResponse>(
            `/product/listV2?${queryParams.toString()}`,
            { method: 'GET' }
        );
        return response.data;
    }

    /**
     * Get product details by product ID
     */
    async getProductDetails(pid: string): Promise<CJProductDetails> {
        const response = await this.request<CJProductDetails>(
            `/product/query?pid=${pid}`,
            { method: 'GET' }
        );
        return response.data;
    }

    /**
     * Get list of products saved to "My Products" in CJ account
     */
    async getMyProducts(params: { page?: number; size?: number; keyword?: string } = {}): Promise<CJProductListResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.size) queryParams.append('size', params.size.toString());
        if (params.keyword) queryParams.append('keyword', params.keyword);

        const response = await this.request<CJProductListResponse>(
            `/product/myProduct/query?${queryParams.toString()}`,
            { method: 'GET' }
        );
        return response.data;
    }

    /**
     * Add a product to "My Products" in CJ account
     */
    async addToMyProducts(productId: string): Promise<boolean> {
        const response = await this.request<{ success: boolean }>(
            '/product/addToMine',
            {
                method: 'POST',
                body: JSON.stringify({ productId }),
            }
        );
        return response.result;
    }

    /**
     * Get product inventory by variant IDs
     */
    async getInventory(variantIds: string[]): Promise<any[]> {
        const response = await this.request<any[]>(
            '/product/inventory/query',
            {
                method: 'POST',
                body: JSON.stringify({ variantIds }),
            }
        );
        return response.data;
    }

    /**
     * Calculate shipping cost for a product variant to a specific country
     */
    async getShippingCost(params: {
        startCountryCode?: string;
        countryCode: string;
        vid: string;
        num?: number;
    }): Promise<any[]> {
        const body = {
            startCountryCode: params.startCountryCode || 'CN',
            endCountryCode: params.countryCode,
            products: [
                {
                    vid: params.vid,
                    quantity: params.num || 1
                }
            ]
        };

        const response = await this.request<any[]>(
            '/logistic/freightCalculate',
            {
                method: 'POST',
                body: JSON.stringify(body)
            }
        );

        if (!response.data || response.data.length === 0) {
            console.warn(`[CJ-SHIP] No methods found via V2 API for VID: ${params.vid} from ${body.startCountryCode} to ${body.endCountryCode}`);
            return [];
        }

        // Map V2 response fields to the format expected by the UI
        const mappedData = response.data.map((item: any) => ({
            ...item,
            amount: item.logisticPrice, // Map logisticPrice to amount
            name: item.logisticName,     // Map logisticName to name
            aging: item.logisticAging    // Map logisticAging to aging
        }));

        console.log(`[CJ-SHIP] V2 API Found ${mappedData.length} methods for VID: ${params.vid}`);
        return mappedData;
    }

    /**
     * Update client tokens (e.g., after manual refresh)
     */
    setTokens(accessToken: string, refreshToken?: string): void {
        this.accessToken = accessToken;
        if (refreshToken) {
            this.refreshToken = refreshToken;
        }
    }

    async calculateBulkShipping(params: {
        startCountryCode: string;
        endCountryCode: string;
        products: { vid: string; quantity: number }[];
    }): Promise<any[]> {
        const body = {
            startCountryCode: params.startCountryCode,
            endCountryCode: params.endCountryCode,
            products: params.products
        };

        const response = await this.request<any[]>(
            '/logistic/freightCalculate',
            {
                method: 'POST',
                body: JSON.stringify(body)
            }
        );

        return response.data || [];
    }

    /**
     * Create an order in CJ Dropshipping for fulfillment
     * This will use your CJ wallet balance to pay for the order
     */
    async createOrder(params: {
        orderNumber: string;
        shippingCountry: string;
        shippingCountryCode: string;
        shippingProvince: string;
        shippingCity: string;
        shippingAddress: string;
        shippingAddress2?: string;
        shippingZip: string;
        shippingCustomerName: string;
        shippingPhone: string;
        products: {
            vid: string;
            quantity: number;
        }[];
        logisticName?: string;
        remark?: string;
    }): Promise<{
        orderId: string;
        orderNum: string;
        totalAmount: number;
        _sentPayload?: any;
    }> {
        const body = {
            orderNumber: params.orderNumber,
            shippingZip: params.shippingZip || '0000',
            zip: params.shippingZip || '0000',
            shippingCountry: params.shippingCountry,
            shippingCountryCode: params.shippingCountryCode,
            countryCode: params.shippingCountryCode, // Alias for countryCode
            shippingProvince: params.shippingProvince || params.shippingCity || 'N/A',
            province: params.shippingProvince || params.shippingCity || 'N/A',
            shippingCity: params.shippingCity || params.shippingProvince || 'N/A',
            city: params.shippingCity || params.shippingProvince || 'N/A',
            shippingAddress: params.shippingAddress || 'N/A',
            address: params.shippingAddress || 'N/A',
            shippingAddress2: params.shippingAddress2 || '',
            shippingCustomerName: params.shippingCustomerName || 'Customer',
            customerName: params.shippingCustomerName || 'Customer',
            shippingPhone: params.shippingPhone || '0000000000',
            customerPhone: params.shippingPhone || '0000000000',
            fromCountryCode: 'CN', // Origin
            sourceCountryCode: 'CN', // Alias
            startCountryCode: 'CN', // For freight calculation
            destCountryCode: params.shippingCountryCode, // For freight calculation
            payType: 2, // Balance payment
            platform: 'others',
            products: params.products.map((p: any) => ({
                vid: p.vid,
                quantity: p.quantity,
                countryCode: params.shippingCountryCode, // Some versions expect it here too
            })),
            logisticName: params.logisticName || '',
            remark: params.remark || '',
        };

        console.log('--- CJ ORDER PAYLOAD START ---');
        console.log(JSON.stringify(body, null, 2));
        console.log('--- CJ ORDER PAYLOAD END ---');

        const response = await this.request<{
            orderId: string;
            orderNum: string;
            totalAmount: number;
        }>(
            '/shopping/order/createOrderV2',
            {
                method: 'POST',
                body: JSON.stringify(body),
            }
        );

        return {
            ...response.data,
            _sentPayload: body // Return for debugging
        };
    }

    /**
     * Query order status from CJ
     */
    async getOrderStatus(orderId: string): Promise<any> {
        const response = await this.request<any>(
            `/shopping/order/query?orderId=${orderId}`,
            { method: 'GET' }
        );
        return response.data;
    }

    /**
     * Get tracking info for a CJ order
     */
    async getOrderTracking(orderId: string): Promise<any> {
        const response = await this.request<any>(
            `/logistics/tracking?orderId=${orderId}`,
            { method: 'GET' }
        );
        return response.data;
    }
}

// Singleton instance
export const cjClient = new CJDropshippingClient();

// Export class for testing or creating new instances
export { CJDropshippingClient };
