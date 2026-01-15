'use client';

import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function CartPage() {
    const { items, updateQuantity, removeItem, cartTotal } = useCart();
    const { formatRawPrice, currency, convertPrice } = useCurrency();
    const [voucher, setVoucher] = useState('');

    if (items.length === 0) {
        return (
            <div className="empty-cart-container">
                <div className="animate-scale-in" style={{ textAlign: 'center' }}>
                    <div className="empty-cart-icon">
                        <ShoppingBag size={48} color="#ccc" />
                    </div>
                    <h1 className="empty-cart-title">Your cart is empty</h1>
                    <p className="empty-cart-text">
                        Looks like you haven't added any drip to your workspace yet. Let's find something amazing for you!
                    </p>
                    <Link href="/products" className="btn-premium" style={{ textDecoration: 'none', padding: '18px 48px' }}>
                        Start Shopping <ArrowRight size={20} />
                    </Link>
                </div>

                <style jsx>{`
                    .empty-cart-container {
                        min-height: 80vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background-color: #fff;
                        padding: 140px 24px 80px;
                    }
                    .empty-cart-icon {
                        width: 120px;
                        height: 120px;
                        background: #f5f5f7;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 32px;
                    }
                    .empty-cart-title {
                        font-size: 2.5rem;
                        font-weight: 800;
                        margin-bottom: 16px;
                        letter-spacing: -0.02em;
                    }
                    .empty-cart-text {
                        color: #666;
                        font-size: 1.1rem;
                        margin-bottom: 40px;
                        max-width: 400px;
                        margin: 0 auto 40px;
                        line-height: 1.6;
                    }
                    @media (max-width: 768px) {
                        .empty-cart-container {
                            padding: 120px 20px 60px;
                        }
                        .empty-cart-icon {
                            width: 100px;
                            height: 100px;
                        }
                        .empty-cart-title {
                            font-size: 1.8rem;
                        }
                        .empty-cart-text {
                            font-size: 1rem;
                            padding: 0 20px;
                        }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="cart-container">
                {/* Header */}
                <div className="cart-header animate-fade-in">
                    <h1 className="cart-title">Shopping Bag</h1>
                    <p className="cart-subtitle">{items.length} {items.length === 1 ? 'item' : 'items'} in your bag</p>
                </div>

                <div className="cart-grid">
                    {/* Items List */}
                    <div className="cart-items-section">
                        {items.map((item, idx) => (
                            <div key={item.id} className="cart-item animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                                <div className="cart-item-image">
                                    <img src={item.image} alt={item.name} />
                                </div>
                                <div className="cart-item-details">
                                    <div className="cart-item-top">
                                        <div className="cart-item-info">
                                            <Link href={`/product/${item.productId}`} className="cart-item-link">
                                                <h3 className="cart-item-name">{item.productId ? item.name.split(' - ')[0] : item.name}</h3>
                                            </Link>
                                            {item.variantName && (
                                                <span className="cart-item-variant">{item.variantName}</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="cart-item-remove"
                                            title="Remove item"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="cart-item-bottom">
                                        <div className="qty-controls">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="qty-btn"
                                                title="Decrease"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="qty-btn"
                                                title="Increase"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <p className="cart-item-price">
                                            {formatRawPrice(
                                                (item.prices?.[currency] ??
                                                    convertPrice(item.price, (item.currency as any) || 'USD', currency)) * item.quantity
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Order Benefits */}
                        <div className="benefits-grid">
                            <div className="benefit-card">
                                <Truck size={20} color="#000" />
                                <span className="benefit-label">Fast Delivery</span>
                            </div>
                            <div className="benefit-card">
                                <ShieldCheck size={20} color="#000" />
                                <span className="benefit-label">Secure Payment</span>
                            </div>
                            <div className="benefit-card">
                                <RefreshCw size={20} color="#000" />
                                <span className="benefit-label">Easy Returns</span>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="cart-summary-wrapper">
                        <div className="cart-summary glass-effect">
                            <h2 className="summary-title">Order Summary</h2>

                            <div className="summary-rows">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>{formatRawPrice(cartTotal)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span className="free-shipping">FREE</span>
                                </div>
                                <div className="summary-divider" />
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>{formatRawPrice(cartTotal)}</span>
                                </div>
                            </div>

                            <div className="voucher-section">
                                <label className="voucher-label">Add Voucher</label>
                                <div className="voucher-input-row">
                                    <input
                                        type="text"
                                        placeholder="Enter code"
                                        value={voucher}
                                        onChange={(e) => setVoucher(e.target.value)}
                                        className="voucher-input"
                                    />
                                    <button className="voucher-btn">Apply</button>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="btn-premium checkout-btn"
                            >
                                Checkout Now <ArrowRight size={20} />
                            </Link>

                            <p className="summary-note">
                                Taxes and shipping fees will be finalized at checkout.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .cart-page {
                    background-color: #fff;
                    min-height: 100vh;
                    padding-top: 130px;
                    padding-bottom: 80px;
                }
                .cart-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 0 24px;
                }
                .cart-header {
                    margin-bottom: 40px;
                }
                .cart-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    letter-spacing: -0.03em;
                    margin: 0;
                }
                .cart-subtitle {
                    color: #666;
                    margin-top: 8px;
                    font-size: 1rem;
                }
                .cart-grid {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 48px;
                }
                .cart-items-section {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .cart-item {
                    display: flex;
                    gap: 20px;
                    padding: 20px;
                    background: #fff;
                    border-radius: 20px;
                    border: 1px solid #f0f0f0;
                    transition: all 0.2s;
                }
                .cart-item:hover {
                    box-shadow: 0 8px 24px rgba(0,0,0,0.06);
                }
                .cart-item-image {
                    width: 120px;
                    height: 120px;
                    background-color: #f5f5f7;
                    border-radius: 16px;
                    overflow: hidden;
                    flex-shrink: 0;
                }
                .cart-item-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .cart-item-details {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-width: 0;
                }
                .cart-item-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 12px;
                }
                .cart-item-info {
                    flex: 1;
                    min-width: 0;
                }
                .cart-item-link {
                    text-decoration: none;
                    color: #000;
                }
                .cart-item-name {
                    font-size: 1.1rem;
                    font-weight: 700;
                    margin: 0 0 6px;
                    line-height: 1.3;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }
                .cart-item-variant {
                    font-size: 0.85rem;
                    color: #888;
                    background: #f5f5f7;
                    padding: 4px 10px;
                    border-radius: 20px;
                    display: inline-block;
                    font-weight: 500;
                }
                .cart-item-remove {
                    background: none;
                    border: none;
                    color: #ccc;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 50%;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                .cart-item-remove:hover {
                    color: #ef4444;
                    background: #fef2f2;
                }
                .cart-item-bottom {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 16px;
                }
                .qty-controls {
                    display: flex;
                    align-items: center;
                    background: #f5f5f7;
                    padding: 4px;
                    border-radius: 50px;
                    gap: 8px;
                }
                .qty-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #fff;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    transition: all 0.2s;
                }
                .qty-btn:hover {
                    background: #000;
                    color: #fff;
                }
                .qty-value {
                    font-size: 0.95rem;
                    font-weight: 700;
                    min-width: 28px;
                    text-align: center;
                }
                .cart-item-price {
                    font-size: 1.2rem;
                    font-weight: 800;
                    margin: 0;
                }
                .benefits-grid {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-top: 24px;
                }
                .benefit-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    background: #f9fafb;
                    padding: 16px 20px;
                    border-radius: 14px;
                    flex: 1;
                    max-width: 140px;
                    text-align: center;
                }
                .benefit-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #333;
                    white-space: nowrap;
                }
                .cart-summary-wrapper {
                    position: sticky;
                    top: 130px;
                    height: fit-content;
                }
                .cart-summary {
                    padding: 28px;
                    border-radius: 24px;
                    border: 1px solid #f0f0f0;
                    background-color: rgba(255,255,255,0.9);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.04);
                }
                .summary-title {
                    font-size: 1.4rem;
                    font-weight: 800;
                    margin: 0 0 24px;
                    letter-spacing: -0.02em;
                }
                .summary-rows {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 28px;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 1rem;
                    color: #666;
                    font-weight: 500;
                }
                .summary-row.total {
                    font-size: 1.4rem;
                    font-weight: 800;
                    color: #000;
                }
                .free-shipping {
                    color: #059669;
                    font-weight: 700;
                }
                .summary-divider {
                    height: 1px;
                    background-color: #f0f0f0;
                    margin: 8px 0;
                }
                .voucher-section {
                    margin-bottom: 24px;
                }
                .voucher-label {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #000;
                    margin-bottom: 8px;
                    display: block;
                }
                .voucher-input-row {
                    display: flex;
                    gap: 8px;
                }
                .voucher-input {
                    flex: 1;
                    padding: 12px 16px;
                    border-radius: 12px;
                    border: 1px solid #e5e5e5;
                    font-size: 0.95rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .voucher-input:focus {
                    border-color: #000;
                }
                .voucher-btn {
                    padding: 12px 20px;
                    background: #000;
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .voucher-btn:hover {
                    background: #333;
                }
                .checkout-btn {
                    width: 100%;
                    text-decoration: none;
                    padding: 18px;
                    font-size: 1.05rem;
                }
                .summary-note {
                    text-align: center;
                    font-size: 0.8rem;
                    color: #999;
                    margin-top: 16px;
                    font-weight: 500;
                }

                /* Tablet */
                @media (max-width: 1024px) {
                    .cart-grid {
                        grid-template-columns: 1fr;
                        gap: 32px;
                    }
                    .cart-summary-wrapper {
                        position: static;
                    }
                    .benefits-grid {
                        gap: 10px;
                    }
                }

                /* Mobile */
                @media (max-width: 768px) {
                    .cart-page {
                        padding-top: 100px;
                        padding-bottom: 60px;
                    }
                    .cart-container {
                        padding: 0 16px;
                    }
                    .cart-header {
                        margin-bottom: 24px;
                    }
                    .cart-title {
                        font-size: 1.8rem;
                    }
                    .cart-subtitle {
                        font-size: 0.9rem;
                    }
                    .cart-grid {
                        gap: 24px;
                    }
                    .cart-item {
                        padding: 16px;
                        gap: 16px;
                        border-radius: 16px;
                    }
                    .cart-item-image {
                        width: 90px;
                        height: 90px;
                        border-radius: 12px;
                    }
                    .cart-item-name {
                        font-size: 0.95rem;
                    }
                    .cart-item-variant {
                        font-size: 0.75rem;
                        padding: 3px 8px;
                    }
                    .cart-item-bottom {
                        margin-top: 12px;
                        flex-wrap: wrap;
                        gap: 12px;
                    }
                    .qty-controls {
                        padding: 3px;
                    }
                    .qty-btn {
                        width: 28px;
                        height: 28px;
                    }
                    .qty-value {
                        font-size: 0.85rem;
                        min-width: 24px;
                    }
                    .cart-item-price {
                        font-size: 1.1rem;
                    }
                    .benefits-grid {
                        gap: 8px;
                        margin-top: 20px;
                    }
                    .benefit-card {
                        padding: 12px 10px;
                        border-radius: 12px;
                        max-width: none;
                    }
                    .benefit-label {
                        font-size: 0.65rem;
                    }
                    .cart-summary {
                        padding: 20px;
                        border-radius: 20px;
                    }
                    .summary-title {
                        font-size: 1.2rem;
                    }
                    .checkout-btn {
                        padding: 16px;
                        font-size: 1rem;
                    }
                }

                /* Small Mobile */
                @media (max-width: 480px) {
                    .cart-page {
                        padding-top: 90px;
                    }
                    .cart-container {
                        padding: 0 12px;
                    }
                    .cart-title {
                        font-size: 1.5rem;
                    }
                    .cart-item {
                        padding: 14px;
                        gap: 12px;
                    }
                    .cart-item-image {
                        width: 80px;
                        height: 80px;
                    }
                    .cart-item-name {
                        font-size: 0.9rem;
                    }
                    .cart-item-remove {
                        padding: 6px;
                    }
                    .cart-item-price {
                        font-size: 1rem;
                    }
                    .benefits-grid {
                        gap: 6px;
                    }
                    .benefit-card {
                        padding: 10px 6px;
                        border-radius: 10px;
                    }
                    .benefit-label {
                        font-size: 0.6rem;
                    }
                    .cart-summary {
                        padding: 16px;
                    }
                    .voucher-input {
                        padding: 10px 12px;
                        font-size: 0.9rem;
                    }
                    .voucher-btn {
                        padding: 10px 16px;
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </div>
    );
}
