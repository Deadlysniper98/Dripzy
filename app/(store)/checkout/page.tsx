'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, CreditCard, Truck, Shield, Check } from 'lucide-react';

// Mock cart data
const CART_ITEMS = [
    { id: '1', name: 'MagSafe Wireless Charger', price: 2999, quantity: 1, image: 'https://images.unsplash.com/photo-1625591340248-6d2894ebd784?q=80&w=200' },
    { id: '2', name: 'iPhone 15 Pro Max Premium Case', price: 4500, quantity: 2, image: 'https://images.unsplash.com/photo-1603539947673-c6eb2934808f?q=80&w=200' },
];

export default function CheckoutPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        paymentMethod: 'card'
    });

    const subtotal = CART_ITEMS.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 999 ? 0 : 99;
    const total = subtotal + shipping;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        border: '1px solid #e5e5e5',
        borderRadius: '12px',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box' as const
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#333'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
            {/* Header */}
            <div style={{ borderBottom: '1px solid #eee', padding: '20px 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', textDecoration: 'none', fontSize: '0.9rem' }}>
                        <ChevronLeft size={20} /> Back to Cart
                    </Link>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Checkout</h1>
                    <div style={{ width: '100px' }}></div>
                </div>
            </div>

            {/* Progress Steps */}
            <div style={{ maxWidth: '600px', margin: '40px auto 0', padding: '0 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                    {['Shipping', 'Payment', 'Confirmation'].map((label, i) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: step > i + 1 ? '#22c55e' : step === i + 1 ? '#000' : '#e5e5e5',
                                color: step >= i + 1 ? '#fff' : '#999',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}>
                                {step > i + 1 ? <Check size={16} /> : i + 1}
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: step === i + 1 ? 600 : 400, color: step === i + 1 ? '#000' : '#888' }}>{label}</span>
                            {i < 2 && <div style={{ width: '40px', height: '2px', backgroundColor: step > i + 1 ? '#22c55e' : '#e5e5e5', marginLeft: '12px' }}></div>}
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '60px', alignItems: 'start' }}>
                {/* Left Column - Forms */}
                <div>
                    {step === 1 && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px' }}>Shipping Information</h2>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" style={inputStyle} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>First Name</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Last Name</label>
                                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Street Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Main Street, Apt 4B" style={inputStyle} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>City</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Mumbai" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>State</label>
                                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="Maharashtra" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>PIN Code</label>
                                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="400001" style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={labelStyle}>Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" style={inputStyle} />
                            </div>

                            <button onClick={() => setStep(2)} style={{ width: '100%', padding: '16px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                                Continue to Payment
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px' }}>Payment Method</h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                                {[
                                    { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
                                    { id: 'upi', label: 'UPI', icon: Shield, desc: 'GPay, PhonePe, Paytm' },
                                    { id: 'cod', label: 'Cash on Delivery', icon: Truck, desc: 'Pay when you receive' }
                                ].map(method => (
                                    <label key={method.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '20px',
                                        border: formData.paymentMethod === method.id ? '2px solid #000' : '1px solid #e5e5e5',
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}>
                                        <input type="radio" name="paymentMethod" value={method.id} checked={formData.paymentMethod === method.id} onChange={handleInputChange} style={{ width: '20px', height: '20px', accentColor: '#000' }} />
                                        <method.icon size={24} style={{ color: '#666' }} />
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{method.label}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#888' }}>{method.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {formData.paymentMethod === 'card' && (
                                <div style={{ marginBottom: '32px' }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={labelStyle}>Card Number</label>
                                        <input type="text" placeholder="1234 5678 9012 3456" style={inputStyle} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={labelStyle}>Expiry Date</label>
                                            <input type="text" placeholder="MM/YY" style={inputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>CVV</label>
                                            <input type="text" placeholder="123" style={inputStyle} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '16px', backgroundColor: '#fff', color: '#000', border: '1px solid #000', borderRadius: '50px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                                    Back
                                </button>
                                <button onClick={() => setStep(3)} style={{ flex: 2, padding: '16px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                                    Place Order • ₹{total.toLocaleString('en-IN')}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <div style={{ width: '80px', height: '80px', backgroundColor: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Check size={40} color="#fff" />
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '12px' }}>Order Confirmed!</h2>
                            <p style={{ color: '#666', marginBottom: '8px' }}>Thank you for your purchase</p>
                            <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '32px' }}>Order #DRZ{Math.floor(Math.random() * 100000)}</p>
                            <p style={{ color: '#666', marginBottom: '32px' }}>We've sent a confirmation email to {formData.email || 'your email'}</p>
                            <Link href="/products" style={{ display: 'inline-block', padding: '16px 40px', backgroundColor: '#000', color: '#fff', borderRadius: '50px', textDecoration: 'none', fontWeight: 600 }}>
                                Continue Shopping
                            </Link>
                        </div>
                    )}
                </div>

                {/* Right Column - Order Summary */}
                <div style={{ backgroundColor: '#fafafa', borderRadius: '24px', padding: '32px', position: 'sticky', top: '120px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '24px' }}>Order Summary</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e5e5' }}>
                        {CART_ITEMS.map(item => (
                            <div key={item.id} style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#eee', flexShrink: 0 }}>
                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '4px' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#888' }}>Qty: {item.quantity}</div>
                                </div>
                                <div style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                            <span style={{ color: '#666' }}>Subtotal</span>
                            <span>₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                            <span style={{ color: '#666' }}>Shipping</span>
                            <span style={{ color: shipping === 0 ? '#22c55e' : undefined }}>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #e5e5e5', fontSize: '1.1rem', fontWeight: 600 }}>
                        <span>Total</span>
                        <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>

                    <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Shield size={20} style={{ color: '#22c55e' }} />
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>Secure checkout powered by Razorpay</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
