'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, CreditCard, Truck, Shield, Check, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useEffect, useCallback } from 'react';

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const { formatPrice, formatRawPrice, currency, countryCode: detectedCountry } = useCurrency();
    const [step, setStep] = useState(1);
    const [fetchingShipping, setFetchingShipping] = useState(false);
    const [shippingRates, setShippingRates] = useState<any[]>([]);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [selectedRate, setSelectedRate] = useState<any>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        country: '',
        paymentMethod: currency === 'USD' ? 'paypal' : 'upi'
    });

    const subtotal = cartTotal;
    // CJ shipping rates are in USD, convert to INR if needed
    const shippingUsd = selectedRate ? selectedRate.amount : 0;
    const shipping = currency === 'INR' ? Math.ceil(shippingUsd * 83) : shippingUsd;
    const total = subtotal + shipping;

    const fetchShippingRates = useCallback(async (country: string) => {
        if (!country || items.length === 0) return;
        setFetchingShipping(true);
        try {
            const res = await fetch('/api/shipping/rates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items, countryCode: country })
            });
            const data = await res.json();
            if (data.success && data.rates?.length > 0) {
                setShippingRates(data.rates);
                setSelectedRate(data.rates[0]);
            }
        } catch (error) {
            console.error('Error fetching shipping:', error);
        } finally {
            setFetchingShipping(false);
        }
    }, [items]);

    useEffect(() => {
        if (detectedCountry && !formData.country) {
            setFormData(prev => ({ ...prev, country: detectedCountry }));
            fetchShippingRates(detectedCountry);
        }
    }, [detectedCountry, fetchShippingRates]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: '' });
        }
    };

    const validateShippingForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!formData.firstName.trim()) errors.firstName = 'First name is required';
        if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
        if (!formData.address.trim()) errors.address = 'Address is required';
        if (!formData.city.trim()) errors.city = 'City is required';
        if (!formData.state.trim()) errors.state = 'State is required';
        if (!formData.pincode.trim()) errors.pincode = 'PIN/ZIP code is required';
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (formData.phone.replace(/\D/g, '').length < 10) {
            errors.phone = 'Please enter a valid phone number';
        }
        if (!formData.country) errors.country = 'Please select a country';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleProceedToPayment = () => {
        if (validateShippingForm()) {
            setStep(2);
        }
    };

    const placeOrder = async () => {
        setPlacingOrder(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: formData.phone,
                    shippingAddress: {
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode,
                        country: formData.country,
                        countryCode: formData.country === 'IN' ? 'IN' : 'US',
                    },
                    items: items.map(item => ({
                        productId: item.productId,
                        variantId: item.variantId,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        image: item.image,
                        currency: item.currency || 'USD',
                    })),
                    subtotal,
                    shipping,
                    total,
                    currency,
                    paymentMethod: formData.paymentMethod,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setOrderNumber(data.data.orderNumber);
                clearCart();
                setStep(3);
            } else {
                alert('Failed to place order: ' + data.error);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setPlacingOrder(false);
        }
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

    const inputErrorStyle = {
        ...inputStyle,
        border: '1px solid #ef4444',
        backgroundColor: '#fef2f2'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#333'
    };

    const errorTextStyle = {
        fontSize: '0.75rem',
        color: '#ef4444',
        marginTop: '4px'
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingTop: '80px' }}>
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
                                <label style={labelStyle}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="your@email.com"
                                    style={formErrors.email ? inputErrorStyle : inputStyle}
                                />
                                {formErrors.email && <div style={errorTextStyle}>{formErrors.email}</div>}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>First Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="John"
                                        style={formErrors.firstName ? inputErrorStyle : inputStyle}
                                    />
                                    {formErrors.firstName && <div style={errorTextStyle}>{formErrors.firstName}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>Last Name <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Doe"
                                        style={formErrors.lastName ? inputErrorStyle : inputStyle}
                                    />
                                    {formErrors.lastName && <div style={errorTextStyle}>{formErrors.lastName}</div>}
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Street Address <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="123 Main Street, Apt 4B"
                                    style={formErrors.address ? inputErrorStyle : inputStyle}
                                />
                                {formErrors.address && <div style={errorTextStyle}>{formErrors.address}</div>}
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Country / Region <span style={{ color: '#ef4444' }}>*</span></label>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={(e) => {
                                        handleInputChange(e);
                                        fetchShippingRates(e.target.value);
                                    }}
                                    style={formErrors.country ? inputErrorStyle : inputStyle}
                                >
                                    <option value="">Select Country</option>
                                    <option value="IN">India</option>
                                    <option value="US">United States</option>
                                    <option value="GB">United Kingdom</option>
                                    <option value="CA">Canada</option>
                                    <option value="AU">Australia</option>
                                    <option value="DE">Germany</option>
                                    <option value="FR">France</option>
                                </select>
                                {formErrors.country && <div style={errorTextStyle}>{formErrors.country}</div>}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={labelStyle}>City <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="Mumbai"
                                        style={formErrors.city ? inputErrorStyle : inputStyle}
                                    />
                                    {formErrors.city && <div style={errorTextStyle}>{formErrors.city}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>State <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        placeholder="Maharashtra"
                                        style={formErrors.state ? inputErrorStyle : inputStyle}
                                    />
                                    {formErrors.state && <div style={errorTextStyle}>{formErrors.state}</div>}
                                </div>
                                <div>
                                    <label style={labelStyle}>PIN Code <span style={{ color: '#ef4444' }}>*</span></label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        placeholder="400001"
                                        style={formErrors.pincode ? inputErrorStyle : inputStyle}
                                    />
                                    {formErrors.pincode && <div style={errorTextStyle}>{formErrors.pincode}</div>}
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={labelStyle}>Phone Number <span style={{ color: '#ef4444' }}>*</span></label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="+91 98765 43210"
                                    style={formErrors.phone ? inputErrorStyle : inputStyle}
                                />
                                {formErrors.phone && <div style={errorTextStyle}>{formErrors.phone}</div>}
                            </div>

                            <button onClick={handleProceedToPayment} style={{ width: '100%', padding: '16px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                                Continue to Payment
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '24px' }}>Payment Method</h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                                {currency === 'USD' ? (
                                    <>
                                        {[
                                            { id: 'paypal', label: 'PayPal', icon: Shield, desc: 'Pay via PayPal or Credit Card' },
                                            { id: 'stripe', label: 'Stripe', icon: CreditCard, desc: 'Secure payment via Stripe' }
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
                                    </>
                                ) : (
                                    <>
                                        {[
                                            { id: 'upi', label: 'UPI', icon: Shield, desc: 'GPay, PhonePe, Paytm' },
                                            { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
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
                                    </>
                                )}
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
                                <button
                                    onClick={placeOrder}
                                    disabled={placingOrder}
                                    style={{
                                        flex: 2,
                                        padding: '16px',
                                        backgroundColor: placingOrder ? '#666' : '#000',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '50px',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        cursor: placingOrder ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {placingOrder ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            {formData.paymentMethod === 'paypal' ? 'Pay with PayPal' : 'Place Order'} • {formatRawPrice(total)}
                                        </>
                                    )}
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
                            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#000', marginBottom: '32px' }}>Order #{orderNumber || 'Processing...'}</p>
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
                        {items.map(item => (
                            <div key={item.id} style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#eee', flexShrink: 0 }}>
                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '4px' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#888' }}>Qty: {item.quantity}</div>
                                </div>
                                <div style={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                            <span style={{ color: '#666' }}>Subtotal</span>
                            <span>{formatRawPrice(subtotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                            <span style={{ color: '#666' }}>Shipping</span>
                            {fetchingShipping ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <span style={{ color: shipping === 0 ? '#22c55e' : undefined }}>
                                    {shipping === 0 ? 'Free' : formatRawPrice(shipping)}
                                </span>
                            )}
                        </div>
                        {selectedRate && (
                            <div style={{ fontSize: '0.8rem', color: '#888', textAlign: 'right', marginTop: '-8px' }}>
                                {selectedRate.name} • {selectedRate.aging}
                            </div>
                        )}
                        {shippingRates.length > 1 && (
                            <div style={{ marginTop: '8px' }}>
                                <label style={{ fontSize: '0.75rem', color: '#888', marginBottom: '4px', display: 'block' }}>Change Shipping Method</label>
                                <select
                                    style={{ ...inputStyle, padding: '8px', fontSize: '0.8rem' }}
                                    value={selectedRate?.code || ''}
                                    onChange={(e) => {
                                        const rate = shippingRates.find(r => r.code === e.target.value);
                                        if (rate) setSelectedRate(rate);
                                    }}
                                >
                                    {shippingRates.map(r => (
                                        <option key={r.code || r.name} value={r.code || r.name}>
                                            {r.name} ({r.aging}) - {formatRawPrice(currency === 'INR' ? Math.ceil(r.amount * 83) : r.amount)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #e5e5e5', fontSize: '1.1rem', fontWeight: 600 }}>
                        <span>Total</span>
                        <span>{formatRawPrice(total)}</span>
                    </div>

                    <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Shield size={20} style={{ color: '#22c55e' }} />
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                            {currency === 'USD' ? 'Secure checkout powered by PayPal & Stripe' : 'Secure checkout powered by Razorpay'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
