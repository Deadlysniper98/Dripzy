'use client';

import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export const CartDrawer = () => {
    const { items, isDrawerOpen, toggleDrawer, updateQuantity, removeItem, cartTotal } = useCart();
    const { formatPrice, formatRawPrice, currency, convertPrice } = useCurrency();

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('cart-drawer-open');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('cart-drawer-open');
        }
        return () => {
            document.body.style.overflow = '';
            document.body.classList.remove('cart-drawer-open');
        };
    }, [isDrawerOpen]);

    return (
        <>
            {/* Backdrop */}
            <div
                className="cart-drawer-backdrop"
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    zIndex: 2000,
                    opacity: isDrawerOpen ? 1 : 0,
                    visibility: isDrawerOpen ? 'visible' : 'hidden',
                    transition: 'opacity 0.4s ease, visibility 0.4s ease',
                }}
                onClick={toggleDrawer}
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                className="cart-drawer glass-effect"
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '100%',
                    maxWidth: '440px',
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    boxShadow: '-20px 0 50px rgba(0,0,0,0.15)',
                    zIndex: 2001,
                    display: 'flex',
                    flexDirection: 'column',
                    transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                    borderLeft: '1px solid rgba(0,0,0,0.05)',
                    WebkitBackdropFilter: 'blur(20px)',
                    overflowX: 'hidden',
                    boxSizing: 'border-box'
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '32px 24px',
                    borderBottom: '1px solid rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ShoppingBag size={24} />
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Your Cart</h2>
                        <span style={{ fontSize: '0.85rem', background: '#000', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>{items.length}</span>
                    </div>
                    <button
                        onClick={toggleDrawer}
                        style={{
                            background: 'rgba(0,0,0,0.05)',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '10px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                        title="Close cart"
                        aria-label="Close cart"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="cart-drawer-content" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 20px' }} className="animate-fade-in">
                            <div style={{ width: '80px', height: '80px', background: '#f5f5f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <ShoppingBag size={32} color="#aaa" />
                            </div>
                            <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '24px', fontWeight: 500 }}>Your workspace is waiting for some drip.</p>
                            <button
                                onClick={toggleDrawer}
                                className="btn-premium-outline"
                                style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                                title="Start shopping"
                                aria-label="Start shopping"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {items.map((item, idx) => (
                                <div key={item.id} className="animate-slide-up" style={{ display: 'flex', gap: '20px', animationDelay: `${idx * 0.05}s`, padding: '16px', background: '#fff', borderRadius: '20px', border: '1px solid var(--d-gray-100)', transition: 'all 0.3s' }}>
                                    <div style={{
                                        width: '90px',
                                        height: '90px',
                                        backgroundColor: '#f5f5f7',
                                        borderRadius: '14px',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        border: '1px solid rgba(0,0,0,0.03)'
                                    }}>
                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, lineHeight: 1.3, color: '#000' }}>{item.productId ? item.name.split(' - ')[0] : item.name}</h3>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#ccc',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        transition: 'color 0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                                    onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
                                                    title="Remove item"
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            {item.variantName && (
                                                <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px', fontWeight: 500 }}>{item.variantName}</div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f5f5f7', padding: '4px', borderRadius: '50px' }}>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                                                    title="Decrease quantity"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                                                    title="Increase quantity"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <p style={{ fontWeight: 800, margin: 0, fontSize: '1rem', color: '#000' }}>
                                                {formatRawPrice(
                                                    (item.prices?.[currency] ??
                                                        convertPrice(item.price, (item.currency as any) || 'USD', currency)) * item.quantity
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div style={{
                        padding: '32px 24px',
                        borderTop: '1px solid rgba(0,0,0,0.05)',
                        backgroundColor: '#fff',
                        boxShadow: '0 -20px 40px rgba(0,0,0,0.03)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px'
                        }}>
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#666' }}>Subtotal</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{formatRawPrice(cartTotal)}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
                            <Link
                                href="/checkout"
                                onClick={toggleDrawer}
                                className="btn-premium"
                                style={{ width: '100%', fontSize: '1.1rem', boxSizing: 'border-box' }}
                                title="Proceed to checkout"
                                aria-label="Proceed to checkout"
                            >
                                Checkout Now
                            </Link>
                            <Link
                                href="/cart"
                                onClick={toggleDrawer}
                                className="btn-premium-outline"
                                style={{ width: '100%', fontSize: '1rem', border: 'none', boxSizing: 'border-box' }}
                                title="View detailed cart"
                                aria-label="View detailed cart"
                            >
                                View Detailed Cart
                            </Link>
                        </div>
                        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#aaa', marginTop: '20px', fontWeight: 500 }}>
                            Shipping & taxes calculated at checkout
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};
