'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'USD' | 'INR';

interface CurrencyContextType {
    currency: Currency;
    exchangeRate: number; // 1 USD = X INR
    countryCode: string | null;
    setCurrency: (currency: Currency) => void;
    formatPrice: (price: number, sourceCurrency?: Currency) => string;
    formatProductPrice: (product: any, field?: 'price' | 'compareAtPrice') => string;
    formatRawPrice: (amount: number) => string;
    convertPrice: (price: number, from: Currency, to: Currency) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const [currency, setCurrencyState] = useState<Currency>('USD');
    const [countryCode, setCountryCode] = useState<string | null>(null);
    const exchangeRate = 87; // Updated to more current rate

    // Load preference or detect location
    useEffect(() => {
        const detectLocation = async () => {
            const saved = localStorage.getItem('dripzy_currency') as Currency;
            if (saved) {
                setCurrencyState(saved);
                return;
            }

            try {
                const res = await fetch('https://ipapi.co/json/');
                const data = await res.json();
                setCountryCode(data.country_code);

                if (data.country_code === 'IN') {
                    setCurrencyState('INR');
                } else {
                    setCurrencyState('USD');
                }
            } catch (error) {
                console.error('Location detection failed:', error);
                setCurrencyState('USD'); // Default to USD
            }
        };

        detectLocation();
    }, []);

    const setCurrency = (c: Currency) => {
        setCurrencyState(c);
        localStorage.setItem('dripzy_currency', c);
    };

    const convertPrice = (price: number, from: Currency, to: Currency) => {
        if (from === to) return price;
        if (from === 'USD' && to === 'INR') return Math.ceil(price * exchangeRate);
        if (from === 'INR' && to === 'USD') return parseFloat((price / exchangeRate).toFixed(2));
        return price;
    };

    const formatPrice = (price: number, sourceCurrency: Currency = 'USD') => {
        const converted = convertPrice(price, sourceCurrency, currency);
        return formatRawPriceInternal(converted, currency);
    };

    const formatRawPriceInternal = (amount: number, targetCurrency: Currency) => {
        if (targetCurrency === 'USD') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(amount);
        } else {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
            }).format(amount);
        }
    };

    // Public version uses current user currency
    const formatRawPrice = (amount: number) => formatRawPriceInternal(amount, currency);

    const formatProductPrice = (product: any, field: 'price' | 'compareAtPrice' = 'price') => {
        if (!product) return '';

        const priceValue = product[field];
        if (priceValue === undefined || priceValue === null) return '';

        // Check for region-specific override
        const overrideMap = field === 'price' ? product.prices : product.compareAtPrices;
        if (overrideMap && overrideMap[currency] !== undefined) {
            return formatRawPriceInternal(overrideMap[currency], currency);
        }

        // Fallback to base price conversion
        return formatPrice(priceValue, product.currency || 'USD');
    };

    return (
        <CurrencyContext.Provider
            value={{
                currency,
                exchangeRate,
                countryCode,
                setCurrency,
                formatPrice,
                formatProductPrice,
                formatRawPrice,
                convertPrice,
            }}
        >
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
