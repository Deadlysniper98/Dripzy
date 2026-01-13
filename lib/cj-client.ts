// CJ Dropshipping API Client
// Documentation: https://cjdropshipping.com/api/doc

const BASE_URL = 'https://developers.cjdropshipping.com/api2.0/v1';

export class CJClient {
    private accessToken: string;

    constructor() {
        this.accessToken = process.env.CJ_ACCESS_TOKEN || '';
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        if (!this.accessToken) {
            console.warn('CJ_ACCESS_TOKEN is missing');
        }

        const res = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'CJ-Access-Token': this.accessToken,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!res.ok) {
            throw new Error(`CJ API Error: ${res.statusText}`);
        }

        return res.json();
    }

    async getProductList(pageNum: number = 1, pageSize: number = 20) {
        // Example endpoint - check actual docs for product/list
        return this.request('/product/list', {
            method: 'POST', // CJ often uses POST for queries
            body: JSON.stringify({
                pageNum,
                pageSize,
            }),
        });
    }

    async getProductDetails(pid: string) {
        return this.request('/product/query', {
            method: 'GET',
            // check actual params usage
        });
    }
}

export const cjClient = new CJClient();
