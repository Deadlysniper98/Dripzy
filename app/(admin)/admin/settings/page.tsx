'use client';

import { useState } from 'react';
import { Store, CreditCard, Truck, Bell, Shield, Globe, Save } from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Store },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'shipping', label: 'Shipping', icon: Truck },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #e5e5e5',
        borderRadius: '10px',
        fontSize: '0.9rem',
        outline: 'none',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: '0 0 8px' }}>Settings</h1>
                    <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>Manage your store configuration</p>
                </div>
                <button
                    onClick={handleSave}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: saved ? '#22c55e' : '#000',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                >
                    <Save size={18} /> {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '32px' }}>
                {/* Sidebar Tabs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                border: 'none',
                                borderRadius: '10px',
                                backgroundColor: activeTab === tab.id ? '#f5f5f7' : 'transparent',
                                color: activeTab === tab.id ? '#000' : '#666',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s'
                            }}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', padding: '32px' }}>
                    {activeTab === 'general' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, paddingBottom: '16px', borderBottom: '1px solid #eee' }}>Store Information</h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Store Name</label>
                                    <input type="text" defaultValue="Dripzy" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Store URL</label>
                                    <input type="text" defaultValue="dripzy.in" style={inputStyle} />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Store Description</label>
                                <textarea defaultValue="Premium Electronics & Accessories - Quality products at best prices." style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Contact Email</label>
                                    <input type="email" defaultValue="support@dripzy.in" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Contact Phone</label>
                                    <input type="tel" defaultValue="+91 98765 43210" style={inputStyle} />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Store Address</label>
                                <input type="text" defaultValue="123 Main Street, Mumbai, Maharashtra 400001" style={inputStyle} />
                            </div>

                            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '16px 0 0', paddingTop: '24px', paddingBottom: '16px', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>Regional Settings</h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Currency</label>
                                    <select style={inputStyle} defaultValue="INR">
                                        <option value="INR">Indian Rupee (₹)</option>
                                        <option value="USD">US Dollar ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Timezone</label>
                                    <select style={inputStyle} defaultValue="IST">
                                        <option value="IST">Asia/Kolkata (IST)</option>
                                        <option value="UTC">UTC</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, paddingBottom: '16px', borderBottom: '1px solid #eee' }}>Payment Methods</h2>

                            {/* Razorpay */}
                            <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '48px', height: '48px', backgroundColor: '#072654', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>R</div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>Razorpay</div>
                                            <div style={{ fontSize: '0.85rem', color: '#888' }}>Accept cards, UPI, netbanking</div>
                                        </div>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: '#000' }} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Enabled</span>
                                    </label>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Key ID</label>
                                        <input type="text" placeholder="rzp_live_xxxxx" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Key Secret</label>
                                        <input type="password" placeholder="••••••••••••" style={inputStyle} />
                                    </div>
                                </div>
                            </div>

                            {/* COD */}
                            <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '48px', height: '48px', backgroundColor: '#f5f5f7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💵</div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>Cash on Delivery</div>
                                            <div style={{ fontSize: '0.85rem', color: '#888' }}>Pay when delivered</div>
                                        </div>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: '#000' }} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Enabled</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'shipping' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, paddingBottom: '16px', borderBottom: '1px solid #eee' }}>Shipping Settings</h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Free Shipping Threshold (₹)</label>
                                    <input type="number" defaultValue="999" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Standard Shipping Fee (₹)</label>
                                    <input type="number" defaultValue="99" style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Estimated Delivery (Days)</label>
                                    <input type="text" defaultValue="3-7" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Express Delivery Fee (₹)</label>
                                    <input type="number" defaultValue="199" style={inputStyle} />
                                </div>
                            </div>

                            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '16px 0 0', paddingTop: '24px', paddingBottom: '16px', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>CJ Dropshipping</h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>CJ Client ID</label>
                                    <input type="text" placeholder="Enter CJ Client ID" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>CJ Client Secret</label>
                                    <input type="password" placeholder="••••••••••••" style={inputStyle} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, paddingBottom: '16px', borderBottom: '1px solid #eee' }}>Email Notifications</h2>

                            {[
                                { label: 'New Order', desc: 'Get notified when a new order is placed' },
                                { label: 'Low Stock Alert', desc: 'Alert when product stock falls below 10' },
                                { label: 'Customer Signup', desc: 'Notify when a new customer registers' },
                                { label: 'Payment Failed', desc: 'Alert on payment failures' },
                                { label: 'Weekly Report', desc: 'Weekly sales and analytics summary' },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f5f5f5' }}>
                                    <div>
                                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>{item.label}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#888' }}>{item.desc}</div>
                                    </div>
                                    <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: '#000', cursor: 'pointer' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
