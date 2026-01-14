'use client';

import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ChevronRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useCurrency } from '@/context/CurrencyContext';

export default function CartPage() {
    const { items, updateQuantity, removeItem, cartTotal } = useCart();
    const { formatPrice, formatRawPrice, currency } = useCurrency();
    const [voucher, setVoucher] = useState('');
    const [discount, setDiscount] = useState(0);

    const deliveryFee = items.length > 0 ? (currency === 'USD' ? 5 : 99) : 0;
    const subtotal = cartTotal;
    const total = subtotal - discount + deliveryFee;

    const applyVoucher = () => {
        if (voucher.toUpperCase() === 'SAVE10') {
            setDiscount(subtotal * 0.1);
        }
    };

    return (
        <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 24px',
            minHeight: '100vh',
            backgroundColor: '#fff'
        }}>
            <section style={{ paddingTop: '140px', paddingBottom: '80px' }}>
                {/* Breadcrumb */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '32px',
                    fontSize: '0.85rem',
                    color: '#888'
                }}>
                    <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
                    <ChevronRight size={14} />
                    <span style={{ color: '#000' }}>Shopping Cart</span>
                </div>

                <h1 style={{
                    fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                    fontWeight: 600,
                    marginBottom: '48px',
                    letterSpacing: '-0.02em'
                }}>
                    Shopping Cart
                </h1>

                {items.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        backgroundColor: '#fafafa',
                        borderRadius: '16px'
                    }}>
                        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '24px' }}>
                            Your cart is empty
                        </p>
                        <Link
                            href="/products"
                            style={{
                                display: 'inline-block',
                                padding: '14px 32px',
                                backgroundColor: '#000',
                                color: '#fff',
                                borderRadius: '50px',
                                textDecoration: 'none',
                                fontWeight: 500
                            }}
                        >
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 380px',
                        gap: '48px',
                        alignItems: 'start'
                    }}>
                        {/* Cart Items */}
                        <div>
                            {/* Table Header */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '2fr 1fr 1fr 60px',
                                padding: '16px 0',
                                borderBottom: '1px solid #eee',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                color: '#888',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                <span>Product</span>
                                <span style={{ textAlign: 'center' }}>Quantity</span>
                                <span style={{ textAlign: 'right' }}>Total</span>
                                <span></span>
                            </div>

                            {/* Cart Items List */}
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 1fr 1fr 60px',
                                        alignItems: 'center',
                                        padding: '24px 0',
                                        borderBottom: '1px solid #f0f0f0'
                                    }}
                                >
                                    {/* Product Info */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{
                                            width: '100px',
                                            height: '100px',
                                            backgroundColor: '#f5f5f7',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            flexShrink: 0
                                        }}>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div>
                                            <h3 style={{
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                marginBottom: '6px'
                                            }}>
                                                {item.name}
                                            </h3>
                                            <p style={{
                                                fontSize: '0.85rem',
                                                color: '#888'
                                            }}>
                                                Electronics
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                border: '1px solid #e0e0e0',
                                                background: '#fff',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span style={{
                                            minWidth: '32px',
                                            textAlign: 'center',
                                            fontWeight: 500
                                        }}>
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                border: '1px solid #e0e0e0',
                                                background: '#fff',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    {/* Price */}
                                    <div style={{ textAlign: 'right', fontWeight: 600 }}>
                                        {formatPrice(item.price * item.quantity, (item.currency as any) || 'USD')}
                                    </div>

                                    {/* Delete */}
                                    <div style={{ textAlign: 'right' }}>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#888',
                                                cursor: 'pointer',
                                                padding: '8px'
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Update Cart Button */}
                            <div style={{ marginTop: '24px' }}>
                                <Link
                                    href="/products"
                                    style={{
                                        display: 'inline-block',
                                        padding: '14px 28px',
                                        backgroundColor: '#000',
                                        color: '#fff',
                                        borderRadius: '50px',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div style={{
                            backgroundColor: '#fafafa',
                            borderRadius: '20px',
                            padding: '32px',
                            position: 'sticky',
                            top: '140px'
                        }}>
                            <h2 style={{
                                fontSize: '1.2rem',
                                fontWeight: 600,
                                marginBottom: '24px'
                            }}>
                                Order Summary
                            </h2>

                            {/* Voucher Input */}
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                marginBottom: '24px'
                            }}>
                                <input
                                    type="text"
                                    placeholder="Discount voucher"
                                    value={voucher}
                                    onChange={(e) => setVoucher(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '12px 16px',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '50px',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    onClick={applyVoucher}
                                    style={{
                                        padding: '12px 20px',
                                        border: '1px solid #000',
                                        borderRadius: '50px',
                                        background: '#fff',
                                        fontWeight: 500,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Apply
                                </button>
                            </div>

                            {/* Price Breakdown */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                paddingBottom: '20px',
                                borderBottom: '1px solid #e0e0e0',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '0.95rem'
                                }}>
                                    <span style={{ color: '#666' }}>Sub Total</span>
                                    <span style={{ fontWeight: 500 }}>{formatRawPrice(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '0.95rem',
                                        color: '#22c55e'
                                    }}>
                                        <span>Discount (10%)</span>
                                        <span>-{formatRawPrice(discount)}</span>
                                    </div>
                                )}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '0.95rem'
                                }}>
                                    <span style={{ color: '#666' }}>Delivery fee</span>
                                    <span style={{ fontWeight: 500 }}>{formatRawPrice(deliveryFee)}</span>
                                </div>
                            </div>

                            {/* Total */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px'
                            }}>
                                <span style={{ fontWeight: 500 }}>Total</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                    {formatRawPrice(total)}
                                </span>
                            </div>

                            {/* Warranty Info */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                padding: '16px',
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                marginBottom: '24px',
                                fontSize: '0.85rem',
                                color: '#666'
                            }}>
                                <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <span>
                                    <strong style={{ color: '#000' }}>90 Day Limited Warranty</strong> against manufacturer's defects. <Link href="#" style={{ color: '#000', textDecoration: 'underline' }}>Details</Link>
                                </span>
                            </div>

                            {/* Checkout Button */}
                            <Link
                                href="/checkout"
                                style={{
                                    display: 'block',
                                    width: '100%',
                                    padding: '16px',
                                    backgroundColor: '#000',
                                    color: '#fff',
                                    textAlign: 'center',
                                    borderRadius: '50px',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    fontSize: '1rem'
                                }}
                            >
                                Checkout Now
                            </Link>
                        </div>
                    </div>
                )}
            </section>

            <style>{`
                @media (max-width: 900px) {
                    section > div:last-child {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
