import { NextRequest, NextResponse } from 'next/server';
import { cjClient } from '@/lib/cj-client';

// GET: Get current token status
export async function GET() {
    try {
        // Try to make a simple API call to verify token is working
        const categories = await cjClient.getCategories();

        return NextResponse.json({
            success: true,
            message: 'CJ API connection is active',
            categoriesCount: categories.length,
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Token verification failed',
            needsAuthentication: true,
        });
    }
}

// POST: Get new access token or refresh existing token
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, apiKey, refreshToken } = body;

        if (action === 'getToken' && apiKey) {
            // Use API key to get new tokens
            // Note: In production, store these tokens securely
            const tokens = await cjClient.getAccessToken();

            return NextResponse.json({
                success: true,
                message: 'Access token generated successfully',
                data: {
                    accessToken: tokens.accessToken,
                    accessTokenExpiryDate: tokens.accessTokenExpiryDate,
                    refreshToken: tokens.refreshToken,
                    refreshTokenExpiryDate: tokens.refreshTokenExpiryDate,
                },
            });
        }

        if (action === 'refresh' && refreshToken) {
            // Refresh existing token
            cjClient.setTokens('', refreshToken);
            const tokens = await cjClient.refreshAccessToken();

            return NextResponse.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken: tokens.accessToken,
                    accessTokenExpiryDate: tokens.accessTokenExpiryDate,
                    refreshToken: tokens.refreshToken,
                    refreshTokenExpiryDate: tokens.refreshTokenExpiryDate,
                },
            });
        }

        return NextResponse.json(
            { success: false, error: 'Invalid action. Use "getToken" with apiKey or "refresh" with refreshToken' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error with CJ authentication:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Authentication failed'
            },
            { status: 500 }
        );
    }
}
