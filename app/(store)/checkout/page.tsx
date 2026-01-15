'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, Truck, Shield, Check, Loader2, Smartphone, CreditCard, ShoppingBag, ShieldCheck, ArrowRight, Lock, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useAuth } from '@/context/AuthContext';
import PayPalPayment from '@/components/store/PayPalPayment';

// Load Razorpay script
const loadRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function CheckoutPage() {
    const { items, cartTotal, clearCart, isInitialized } = useCart();
    const { formatPrice, formatRawPrice, convertPrice, currency, setCurrency, countryCode: detectedCountry } = useCurrency();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [fetchingShipping, setFetchingShipping] = useState(false);
    const [shippingRates, setShippingRates] = useState<any[]>([]);
    const [showShippingOptions, setShowShippingOptions] = useState(false);

    // Address Management State
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [saveNewAddress, setSaveNewAddress] = useState(false);

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
        paymentMethod: 'paypal' // Default
    });

    // Automatic Currency Switching
    useEffect(() => {
        if (formData.country === 'IN' && currency !== 'INR') {
            setCurrency('INR');
        } else if (formData.country && formData.country !== 'IN' && currency !== 'USD') {
            setCurrency('USD');
        }
    }, [formData.country, currency, setCurrency]);

    // Phone verification for COD
    const [showPhoneVerify, setShowPhoneVerify] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);

    const subtotal = cartTotal;
    const shippingUsd = selectedRate ? Number(selectedRate.amount) : 0;
    const shipping = currency === 'INR' ? Math.ceil(shippingUsd * 87) : shippingUsd;
    const total = subtotal + shipping;

    // Reset payment method when currency changes
    useEffect(() => {
        if (currency === 'INR') {
            setFormData(prev => ({ ...prev, paymentMethod: 'razorpay' })); // Default for India
        } else {
            setFormData(prev => ({ ...prev, paymentMethod: 'paypal' })); // Default for others
        }
    }, [currency]);

    // Fetch user addresses if logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, email: user.email || '' }));
            fetchAddresses();
        }
    }, [user]);

    const fetchAddresses = async () => {
        if (!user) return;
        setLoadingAddresses(true);
        try {
            const res = await fetch(`/api/user/addresses?userId=${user.uid}`);
            const data = await res.json();
            if (data.success) {
                setSavedAddresses(data.data);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const handleAddressSelect = (addressId: string) => {
        if (addressId === 'new') {
            setSelectedAddressId(null);
            setFormData(prev => ({
                ...prev,
                firstName: '',
                lastName: '',
                address: '',
                city: '',
                state: '',
                pincode: '',
                phone: '',
                country: detectedCountry || ''
            }));
        } else {
            const address = savedAddresses.find(a => a.id === addressId);
            if (address) {
                setSelectedAddressId(addressId);
                const [first, ...last] = (address.name || '').split(' ');
                setFormData(prev => ({
                    ...prev,
                    firstName: first || '',
                    lastName: last.join(' ') || '',
                    address: address.address || '',
                    city: address.city || '',
                    state: address.state || '',
                    pincode: address.pincode || '',
                    phone: address.phone || '',
                    country: address.countryCode || address.country || ''
                }));
                if (address.countryCode || address.country) {
                    fetchShippingRates(address.countryCode || address.country);
                }
            }
        }
    };

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
            } else {
                setShippingRates([]); // Clear previous rates if none found
                setSelectedRate(null);
            }
        } catch (error) {
            console.error('Error fetching shipping:', error);
        } finally {
            setFetchingShipping(false);
        }
    }, [items]);

    useEffect(() => {
        if (detectedCountry && !formData.country && !selectedAddressId) {
            setFormData(prev => ({ ...prev, country: detectedCountry }));
        }
    }, [detectedCountry, selectedAddressId, formData.country]);

    useEffect(() => {
        if (formData.country && items.length > 0) {
            fetchShippingRates(formData.country);
        }
    }, [items.length, formData.country, fetchShippingRates]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (formErrors[name]) {
            setFormErrors({ ...formErrors, [name]: '' });
        }
        if (selectedAddressId && name !== 'paymentMethod' && name !== 'email') {
            setSelectedAddressId(null);
        }
    };

    const validateShippingForm = () => {
        const errors: Record<string, string> = {};
        if (!formData.email.trim()) { errors.email = 'Email' } else if (!/\S+@\S+\.\S+/.test(formData.email)) { errors.email = 'Valid email' }
        if (!formData.firstName.trim()) errors.firstName = 'First name';
        if (!formData.lastName.trim()) errors.lastName = 'Last name';
        if (!formData.address.trim()) errors.address = 'Address';
        if (!formData.city.trim()) errors.city = 'City';
        if (!formData.state.trim()) errors.state = 'State';
        if (!formData.pincode.trim()) errors.pincode = 'PIN';
        if (!formData.phone.trim()) { errors.phone = 'Phone' } else if (formData.phone.replace(/\D/g, '').length < 10) { errors.phone = 'Valid phone' }
        if (!formData.country) errors.country = 'Country';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleProceedToPayment = () => {
        if (validateShippingForm()) {
            setStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const formDataRef = useRef(formData);
    const itemsRef = useRef(items);
    const subtotalRef = useRef(subtotal);
    const shippingRef = useRef(shipping);
    const totalRef = useRef(total);
    const currencyRef = useRef(currency);
    const userRef = useRef(user);
    const saveNewAddressRef = useRef(saveNewAddress);
    const selectedAddressIdRef = useRef(selectedAddressId);

    useEffect(() => {
        formDataRef.current = formData;
        itemsRef.current = items;
        subtotalRef.current = subtotal;
        shippingRef.current = shipping;
        totalRef.current = total;
        currencyRef.current = currency;
        userRef.current = user;
        saveNewAddressRef.current = saveNewAddress;
        selectedAddressIdRef.current = selectedAddressId;
    });

    const createOrderPayload = useCallback(() => ({
        userId: userRef.current?.uid,
        customer: `${formDataRef.current.firstName} ${formDataRef.current.lastName}`,
        email: formDataRef.current.email,
        phone: formDataRef.current.phone,
        shippingAddress: {
            address: formDataRef.current.address,
            city: formDataRef.current.city,
            state: formDataRef.current.state,
            pincode: formDataRef.current.pincode,
            country: formDataRef.current.country,
            countryCode: formDataRef.current.country,
        },
        items: itemsRef.current.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            currency: item.currency || 'USD',
        })),
        subtotal: subtotalRef.current,
        shipping: shippingRef.current,
        total: totalRef.current,
        currency: currencyRef.current,
        paymentMethod: formDataRef.current.paymentMethod,
    }), []);

    const handlePlaceOrder = useCallback(async (transactionId?: string, paymentDetails?: any) => {
        setPlacingOrder(true);
        try {
            if (userRef.current && saveNewAddressRef.current && !selectedAddressIdRef.current) {
                try {
                    await fetch('/api/user/addresses', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: userRef.current.uid,
                            label: 'Home',
                            name: `${formDataRef.current.firstName} ${formDataRef.current.lastName}`,
                            address: formDataRef.current.address,
                            city: formDataRef.current.city,
                            state: formDataRef.current.state,
                            pincode: formDataRef.current.pincode,
                            country: formDataRef.current.country,
                            countryCode: formDataRef.current.country,
                            phone: formDataRef.current.phone
                        })
                    });
                } catch (addrErr) { console.error('Address save fail', addrErr) }
            }

            const payload = {
                ...createOrderPayload(),
                paymentStatus: transactionId ? 'paid' : 'pending',
                transactionId: transactionId,
                paymentDetails: paymentDetails
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                setOrderNumber(data.data.orderNumber);
                clearCart();
                setStep(3);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert('Order Error: ' + data.error);
            }
        } catch (error) {
            console.error('Order Error:', error);
            alert('Something went wrong.');
        } finally {
            setPlacingOrder(false);
        }
    }, [clearCart, createOrderPayload]);

    const handleRazorpayPayment = async () => {
        const res = await loadRazorpay();
        if (!res) { alert('Razorpay failed'); return; }
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            amount: Math.round(total * 100),
            currency: currency,
            name: "Dripzy Store",
            handler: function (response: any) { handlePlaceOrder(response.razorpay_payment_id, response); },
            prefill: { name: `${formData.firstName} ${formData.lastName}`, email: formData.email, contact: formData.phone },
            theme: { color: "#000000" }
        };
        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
    };

    const handleCODOrder = () => {
        if (!phoneVerified) { setShowPhoneVerify(true); return; }
        handlePlaceOrder();
    };

    if (!isInitialized) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={48} className="af-spin" style={{ margin: '0 auto 24px', color: '#000' }} />
                    <p style={{ color: '#000', fontWeight: 700, fontSize: '1.2rem' }}>Securing Your Session...</p>
                </div>
            </div>
        );
    }

    if (items.length === 0 && step !== 3) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: '24px' }}>
                <div style={{ width: '120px', height: '120px', backgroundColor: '#f5f5f7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                    <ShoppingBag size={48} color="#ccc" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px' }}>Your bag is empty</h2>
                <Link href="/products" className="btn-premium" style={{ textDecoration: 'none', padding: '18px 48px' }}>
                    Go Shopping
                </Link>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingBottom: '100px' }}>
            {/* Header */}
            <header style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '80px', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', zIndex: 100, borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', height: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#000', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                        <ChevronLeft size={20} /> Back
                    </Link>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.05em' }}>DRIPZY.</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                        <Lock size={14} /> Secure Checkout
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1400px', margin: '140px auto 0', padding: '0 24px' }}>
                {step === 3 ? (
                    <div className="animate-scale-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                        <div style={{ width: '100px', height: '100px', backgroundColor: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 20px 40px rgba(5, 150, 105, 0.2)' }}>
                            <Check size={48} color="#fff" />
                        </div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.03em' }}>Order Confirmed!</h1>
                        <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '40px', lineHeight: 1.6 }}>Your style has been secured. Order <span style={{ color: '#000', fontWeight: 700 }}>#{orderNumber}</span> is being processed.</p>
                        <Link href="/products" className="btn-premium" style={{ textDecoration: 'none', padding: '20px 60px', fontSize: '1.1rem' }}>
                            Continue Shopping <ArrowRight size={20} />
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '80px' }} className="checkout-grid">
                        {/* Left Side: Forms */}
                        <div className="animate-fade-in">
                            {/* Stepper */}
                            <div style={{ display: 'flex', gap: '24px', marginBottom: '48px' }}>
                                {['Shipping', 'Payment'].map((label, i) => (
                                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            backgroundColor: step >= i + 1 ? '#000' : '#f0f0f0',
                                            color: step >= i + 1 ? '#fff' : '#aaa',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.85rem', fontWeight: 800
                                        }}>
                                            {step > i + 1 ? <Check size={16} /> : i + 1}
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '1rem', color: step >= i + 1 ? '#000' : '#aaa' }}>{label}</span>
                                        {i === 0 && <div style={{ width: '40px', height: '1px', backgroundColor: '#f0f0f0' }}></div>}
                                    </div>
                                ))}
                            </div>

                            {step === 1 && (
                                <section>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '32px', letterSpacing: '-0.02em' }}>Shipping Information</h2>

                                    {savedAddresses.length > 0 && (
                                        <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Saved Addresses</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                {savedAddresses.map(addr => (
                                                    <div
                                                        key={addr.id}
                                                        onClick={() => handleAddressSelect(addr.id)}
                                                        style={{
                                                            padding: '24px', borderRadius: '24px', border: selectedAddressId === addr.id ? '2px solid #000' : '1px solid #f0f0f0',
                                                            cursor: 'pointer', backgroundColor: selectedAddressId === addr.id ? '#fafafa' : '#fff',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '8px' }}>{addr.label}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5 }}>{addr.name}<br />{addr.address}<br />{addr.city}, {addr.state}</div>
                                                    </div>
                                                ))}
                                                <div
                                                    onClick={() => handleAddressSelect('new')}
                                                    style={{ padding: '24px', borderRadius: '24px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontWeight: 600, cursor: 'pointer' }}
                                                >
                                                    + Add New Address
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                        <div className="form-group" style={{ marginBottom: '8px' }}>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', display: 'block', color: '#333' }}>Email Address</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" style={{ width: '100%', padding: '18px 24px', borderRadius: '16px', border: formErrors.email ? '2px solid #ef4444' : '1px solid #e5e7eb', background: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                                            <div className="form-field-group">
                                                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', display: 'block', color: '#333' }}>First Name</label>
                                                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" style={{ width: '100%', padding: '18px 24px', borderRadius: '16px', border: formErrors.firstName ? '2px solid #ef4444' : '1px solid #e5e7eb', background: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }} />
                                            </div>
                                            <div className="form-field-group">
                                                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', display: 'block', color: '#333' }}>Last Name</label>
                                                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" style={{ width: '100%', padding: '18px 24px', borderRadius: '16px', border: formErrors.lastName ? '2px solid #ef4444' : '1px solid #e5e7eb', background: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', display: 'block', color: '#333' }}>Street Address</label>
                                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Street, Apt 4" style={{ width: '100%', padding: '18px 24px', borderRadius: '16px', border: formErrors.address ? '2px solid #ef4444' : '1px solid #e5e7eb', background: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px' }}>
                                            <div className="form-field-group">
                                                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', display: 'block', color: '#333' }}>City</label>
                                                <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" style={{ width: '100%', padding: '18px 24px', borderRadius: '16px', border: formErrors.city ? '2px solid #ef4444' : '1px solid #e5e7eb', background: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }} />
                                            </div>
                                            <div className="form-field-group">
                                                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', display: 'block', color: '#333' }}>State</label>
                                                <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" style={{ width: '100%', padding: '18px 24px', borderRadius: '16px', border: formErrors.state ? '2px solid #ef4444' : '1px solid #e5e7eb', background: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }} />
                                            </div>
                                            <div className="form-field-group">
                                                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', display: 'block', color: '#333' }}>PIN Code</label>
                                                <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="Code" style={{ width: '100%', padding: '18px 24px', borderRadius: '16px', border: formErrors.pincode ? '2px solid #ef4444' : '1px solid #e5e7eb', background: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                                            <div className="form-field-group">
                                                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', display: 'block', color: '#333' }}>Country</label>
                                                <select name="country" value={formData.country} onChange={handleInputChange} style={{ width: '100%', padding: '18px 24px', borderRadius: '16px', border: formErrors.country ? '2px solid #ef4444' : '1px solid #e5e7eb', background: '#fff', fontSize: '1rem', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                                                    <option value="">Select Country</option>
                                                    <option value="IN">India</option>
                                                    <option value="US">United States</option>
                                                    <option value="GB">United Kingdom</option>
                                                    <option value="CA">Canada</option>
                                                    <option value="AU">Australia</option>
                                                </select>
                                            </div>
                                            <div className="form-field-group">
                                                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px', display: 'block', color: '#333' }}>Phone</label>
                                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 234 567 890" style={{ width: '100%', padding: '18px 24px', borderRadius: '16px', border: formErrors.phone ? '2px solid #ef4444' : '1px solid #e5e7eb', background: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }} />
                                            </div>
                                        </div>
                                    </div>



                                    <button onClick={handleProceedToPayment} className="btn-premium" style={{ width: '100%', padding: '20px', marginTop: '48px', fontSize: '1.1rem' }}>
                                        Continue to Payment <ArrowRight size={20} />
                                    </button>
                                </section>
                            )}

                            {step === 2 && (
                                <section>
                                    <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '32px', letterSpacing: '-0.02em' }}>Payment Method</h2>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
                                        {currency === 'INR' ? (
                                            <>
                                                <label style={{ padding: '24px', borderRadius: '24px', border: formData.paymentMethod === 'razorpay' ? '2.5px solid #000' : '1px solid #f0f0f0', cursor: 'pointer', display: 'flex', gap: '16px', alignItems: 'center', transition: 'all 0.2s', backgroundColor: formData.paymentMethod === 'razorpay' ? '#fcfcfc' : '#fff' }}>
                                                    <input type="radio" name="paymentMethod" value="razorpay" checked={formData.paymentMethod === 'razorpay'} onChange={handleInputChange} style={{ width: '20px', height: '20px', accentColor: '#000' }} />
                                                    <CreditCard size={32} />
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Instant Payment</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>UPI, Cards, Netbanking via Razorpay</div>
                                                    </div>
                                                </label>
                                                <label style={{ padding: '24px', borderRadius: '24px', border: formData.paymentMethod === 'cod' ? '2.5px solid #000' : '1px solid #f0f0f0', cursor: 'pointer', display: 'flex', gap: '16px', alignItems: 'center', transition: 'all 0.2s', backgroundColor: formData.paymentMethod === 'cod' ? '#fcfcfc' : '#fff' }}>
                                                    <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} style={{ width: '20px', height: '20px', accentColor: '#000' }} />
                                                    <Truck size={32} />
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Cash on Delivery</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>Pay when you receive the drip</div>
                                                    </div>
                                                </label>
                                            </>
                                        ) : (
                                            <div style={{ padding: '32px', borderRadius: '24px', border: '2.5px solid #000', backgroundColor: '#fcfcfc' }}>
                                                <PayPalPayment
                                                    key={currency}
                                                    amount={total}
                                                    currency={currency}
                                                    onSuccess={(details) => handlePlaceOrder(details.id, details)}
                                                    onError={(err) => alert("Payment error. Choose another method.")}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {currency === 'INR' && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>
                                            <button onClick={() => setStep(1)} className="btn-premium-outline" style={{ padding: '20px' }}>Back</button>
                                            <button
                                                onClick={formData.paymentMethod === 'razorpay' ? handleRazorpayPayment : handleCODOrder}
                                                disabled={placingOrder}
                                                className="btn-premium"
                                                style={{ padding: '20px' }}
                                            >
                                                {placingOrder ? <Loader2 className="af-spin" /> : 'Complete Order'}
                                            </button>
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>

                        {/* Right Side: Order Summary */}
                        <div style={{ position: 'sticky', top: '140px', height: 'fit-content' }}>
                            <div className="glass-effect" style={{ padding: '40px', borderRadius: '32px', border: '1px solid #f0f0f0', boxShadow: 'var(--d-shadow-premium)' }}>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '32px' }}>Order Summary</h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
                                    {items.map(item => (
                                        <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f5f5f7', border: '1px solid #f0f0f0', flexShrink: 0 }}>
                                                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#000', lineHeight: 1.3 }}>{item.productId ? item.name.split(' - ')[0] : item.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Qty: {item.quantity} × {formatRawPrice(item.prices?.[currency] ?? convertPrice(item.price, (item.currency as any) || 'USD', currency))}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid #f0f0f0', paddingTop: '32px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', color: '#666', fontWeight: 600 }}>
                                        <span>Subtotal</span>
                                        <span>{formatRawPrice(subtotal)}</span>
                                    </div>
                                    {/* Shipping Selection */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div
                                            onClick={() => setShowShippingOptions(!showShippingOptions)}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                fontSize: '1rem',
                                                color: '#333',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                padding: '8px 0'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Truck size={18} color="#000" />
                                                <span>Shipping</span>
                                                <ChevronDown
                                                    size={16}
                                                    style={{
                                                        transform: showShippingOptions ? 'rotate(180deg)' : 'rotate(0)',
                                                        transition: 'transform 0.3s'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {fetchingShipping ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888' }}>
                                                        <Loader2 size={14} className="af-spin" />
                                                        <span style={{ fontSize: '0.8rem' }}>Fetching rates...</span>
                                                    </div>
                                                ) : selectedRate ? (
                                                    <span style={{ fontWeight: 700 }}>{shipping === 0 ? 'FREE' : formatRawPrice(shipping)}</span>
                                                ) : (
                                                    <span style={{ color: '#888', fontSize: '0.85rem' }}>Select</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Selected Rate Summary */}
                                        {selectedRate && !showShippingOptions && (
                                            <div style={{
                                                background: '#f5f5f7',
                                                padding: '14px 16px',
                                                borderRadius: '14px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#000' }}>{selectedRate.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>Est. {selectedRate.aging || '7-15 days'}</div>
                                                </div>
                                                <div style={{
                                                    background: '#000',
                                                    color: '#fff',
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 800
                                                }}>
                                                    {shipping === 0 ? 'FREE' : formatRawPrice(shipping)}
                                                </div>
                                            </div>
                                        )}

                                        {/* Expanded Rate Options */}
                                        {showShippingOptions && (
                                            <div className="animate-slide-down" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {fetchingShipping ? (
                                                    [1, 2, 3].map(i => (
                                                        <div key={i} className="skeleton-line" style={{ height: '72px', borderRadius: '14px' }}></div>
                                                    ))
                                                ) : shippingRates.length > 0 ? (
                                                    shippingRates.map((rate, i) => {
                                                        const rateAmountDisplay = rate.amount === 0 ? 'FREE' : formatRawPrice(currency === 'INR' ? Math.ceil(Number(rate.amount) * 87) : Number(rate.amount));
                                                        const isSelected = selectedRate?.code === rate.code || selectedRate?.name === rate.name;

                                                        return (
                                                            <div
                                                                key={i}
                                                                onClick={() => { setSelectedRate(rate); setShowShippingOptions(false); }}
                                                                className="shipping-option-card"
                                                                style={{
                                                                    padding: '16px',
                                                                    borderRadius: '14px',
                                                                    border: isSelected ? '2px solid #000' : '1px solid #e5e7eb',
                                                                    cursor: 'pointer',
                                                                    backgroundColor: isSelected ? '#fafafa' : '#fff',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                                                                    <div style={{
                                                                        width: '22px',
                                                                        height: '22px',
                                                                        borderRadius: '50%',
                                                                        border: isSelected ? '2px solid #000' : '2px solid #ccc',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        transition: 'all 0.2s',
                                                                        backgroundColor: isSelected ? '#000' : 'transparent'
                                                                    }}>
                                                                        {isSelected && <Check size={12} color="#fff" />}
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#000' }}>{rate.name}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '2px' }}>
                                                                            {rate.aging ? `Estimated ${rate.aging}` : 'Standard delivery'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#000' }}>
                                                                    {rateAmountDisplay}
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div style={{ padding: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#888', background: '#f9f9f9', borderRadius: '14px' }}>
                                                        <Truck size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                                        <div>Enter your address to see available shipping methods from CJ Dropshipping.</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 900, color: '#000', marginTop: '16px' }}>
                                        <span>Total</span>
                                        <span>{formatRawPrice(total)}</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: '#666' }}>
                                        <ShieldCheck size={20} color="#059669" />
                                        <span>Safe & Encrypted Payments</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem', color: '#666' }}>
                                        <Truck size={20} color="#000" />
                                        <span>Fast 5-7 Day Delivery</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <style jsx>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-down {
                    animation: slideDown 0.3s ease-out forwards;
                }
                .shipping-option-card {
                    transition: all 0.2s ease;
                }
                .shipping-option-card:hover {
                    border-color: #000 !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .skeleton-line {
                    background: linear-gradient(90deg, #f0f0f0 25%, #f7f7f7 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @media (max-width: 1024px) {
                    .checkout-grid {
                        grid-template-columns: 1fr !important;
                    }
                    header .maxWidth { padding: 0 16px; }
                }
            `}</style>
        </div>
    );
}
