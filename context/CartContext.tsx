'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCurrency } from './CurrencyContext';

export type CartItem = {
    id: string; // Composite ID: productId-variantId
    productId: string;
    variantId?: string;
    variantName?: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    currency?: string;
    prices?: { [key: string]: number };
};

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    isDrawerOpen: boolean;
    toggleDrawer: () => void;
    isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const [isInitialized, setIsInitialized] = useState(false);

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('dripzy_cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setItems(parsed);
                }
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        if (!isInitialized) return;

        if (typeof window !== 'undefined') {
            localStorage.setItem('dripzy_cart', JSON.stringify(items));
        }
    }, [items, isInitialized]);

    const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === newItem.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...newItem, quantity: 1 }];
        });
        setIsDrawerOpen(true); // Open drawer on add
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(id);
            return;
        }
        setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity } : i))
        );
    };

    const clearCart = () => setItems([]);

    const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

    const { currency: currentCurrency, convertPrice } = useCurrency();

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = items.reduce((sum, item) => {
        let itemPrice = 0;

        // Priority 1: Check for explicit currency override
        if (item.prices && item.prices[currentCurrency] !== undefined) {
            itemPrice = item.prices[currentCurrency];
        } else {
            // Priority 2: Standard conversion
            itemPrice = convertPrice(item.price, (item.currency as any) || 'USD', currentCurrency);
        }

        return sum + (itemPrice * item.quantity);
    }, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                isDrawerOpen,
                toggleDrawer,
                isInitialized,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
