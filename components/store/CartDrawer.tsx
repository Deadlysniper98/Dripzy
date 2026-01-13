'use client';

import { useCart } from '@/context/CartContext';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export const CartDrawer = () => {
    const { items, isDrawerOpen, toggleDrawer, updateQuantity, removeItem, cartTotal } = useCart();

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
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    opacity: isDrawerOpen ? 1 : 0,
                    visibility: isDrawerOpen ? 'visible' : 'hidden',
                    transition: 'opacity 0.3s ease, visibility 0.3s ease',
                }}
                onClick={toggleDrawer}
            />

            {/* Drawer */}
            <div
                className="cart-drawer"
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '100%',
                    maxWidth: '420px',
                    height: '100%',
                    backgroundColor: '#fff',
                    boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
                    zIndex: 1001,
                    display: 'flex',
                    flexDirection: 'column',
                    transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '24px',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Your Cart</h2>
                    <button
                        onClick={toggleDrawer}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Cart Items */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
                            <p style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Your cart is empty.</p>
                            <button
                                onClick={toggleDrawer}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#000',
                                    fontWeight: 600,
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem'
                                }}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {items.map((item) => (
                                <div key={item.id} style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        backgroundColor: '#f5f5f7',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        flexShrink: 0
                                    }}>
                                        <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: 500, margin: 0, lineHeight: 1.4, maxWidth: '180px' }}>{item.name}</h3>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#aaa',
                                                    cursor: 'pointer',
                                                    padding: '4px'
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <p style={{ fontWeight: 700, margin: '8px 0', fontSize: '1rem' }}>₹{item.price.toFixed(2)}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    border: '1px solid #e5e5e5',
                                                    background: '#fff',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 500, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    border: '1px solid #e5e5e5',
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div style={{
                        padding: '24px',
                        borderTop: '1px solid #f0f0f0',
                        backgroundColor: '#fafafa'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                            fontSize: '1.1rem',
                            fontWeight: 700
                        }}>
                            <span>Total</span>
                            <span>₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <Link
                            href="/checkout"
                            onClick={toggleDrawer}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '16px',
                                backgroundColor: '#000',
                                color: '#fff',
                                textAlign: 'center',
                                borderRadius: '50px',
                                fontWeight: 600,
                                fontSize: '1rem',
                                textDecoration: 'none',
                                boxSizing: 'border-box'
                            }}
                        >
                            Checkout
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
};
