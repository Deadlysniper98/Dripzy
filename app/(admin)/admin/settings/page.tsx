'use client';

import { useState, useEffect } from 'react';
import { Store, CreditCard, Truck, Bell, Shield, Globe, Save, Package, CheckCircle, XCircle, RefreshCw, ExternalLink, Loader2, AlertCircle, Search, BarChart3, ShoppingBag, Download, Copy, Check } from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const [saved, setSaved] = useState(false);

    // CJ Dropshipping state
    const [cjApiKey, setCjApiKey] = useState('');
    const [cjStatus, setCjStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
    const [cjLoading, setCjLoading] = useState(false);
    const [cjMessage, setCjMessage] = useState('');
    const [cjTokenInfo, setCjTokenInfo] = useState<{
        accessToken?: string;
        expiresAt?: string;
    } | null>(null);

    // Google Settings state
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
    const [searchConsoleId, setSearchConsoleId] = useState('');
    const [merchantCenterId, setMerchantCenterId] = useState('');
    const [copied, setCopied] = useState<string | null>(null);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    // Check CJ connection status
    const checkCJConnection = async () => {
        setCjLoading(true);
        setCjMessage('');
        try {
            const res = await fetch('/api/cj/auth');
            const data = await res.json();

            if (data.success) {
                setCjStatus('connected');
                setCjMessage(`Connected! ${data.categoriesCount} categories available.`);
            } else {
                setCjStatus('error');
                setCjMessage(data.error || 'Not connected');
            }
        } catch (error) {
            setCjStatus('error');
            setCjMessage('Failed to check connection');
        } finally {
            setCjLoading(false);
        }
    };

    // Generate new CJ access token
    const generateCJToken = async () => {
        if (!cjApiKey) {
            setCjMessage('Please enter your CJ API Key');
            return;
        }

        setCjLoading(true);
        setCjMessage('');
        try {
            const res = await fetch('/api/cj/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'getToken',
                    apiKey: cjApiKey,
                }),
            });
            const data = await res.json();

            if (data.success) {
                setCjStatus('connected');
                setCjTokenInfo({
                    accessToken: data.data.accessToken?.substring(0, 20) + '...',
                    expiresAt: data.data.accessTokenExpiryDate,
                });
                setCjMessage('Token generated successfully! Add these to your .env.local file.');
            } else {
                setCjStatus('error');
                setCjMessage(data.error || 'Failed to generate token');
            }
        } catch (error) {
            setCjStatus('error');
            setCjMessage('Failed to generate token');
        } finally {
            setCjLoading(false);
        }
    };

    // Check connection on mount
    useEffect(() => {
        if (activeTab === 'integrations') {
            checkCJConnection();
        }
    }, [activeTab]);

    const tabs = [
        { id: 'general', label: 'General', icon: Store },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'shipping', label: 'Shipping', icon: Truck },
        { id: 'integrations', label: 'Integrations', icon: Package },
        { id: 'google', label: 'Google', icon: Globe },
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
                        </div>
                    )}

                    {activeTab === 'integrations' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                                CJ Dropshipping Integration
                            </h2>

                            {/* Status Card */}
                            <div style={{
                                padding: '20px',
                                borderRadius: '12px',
                                border: '1px solid',
                                borderColor: cjStatus === 'connected' ? '#bbf7d0' : cjStatus === 'error' ? '#fecaca' : '#e5e5e5',
                                backgroundColor: cjStatus === 'connected' ? '#f0fdf4' : cjStatus === 'error' ? '#fef2f2' : '#f9fafb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {cjLoading ? (
                                        <Loader2 size={24} style={{ color: '#888', animation: 'spin 1s linear infinite' }} />
                                    ) : cjStatus === 'connected' ? (
                                        <CheckCircle size={24} style={{ color: '#22c55e' }} />
                                    ) : cjStatus === 'error' ? (
                                        <XCircle size={24} style={{ color: '#ef4444' }} />
                                    ) : (
                                        <AlertCircle size={24} style={{ color: '#888' }} />
                                    )}
                                    <div>
                                        <div style={{ fontWeight: 600 }}>
                                            {cjLoading ? 'Checking connection...' : cjStatus === 'connected' ? 'Connected' : 'Not Connected'}
                                        </div>
                                        {cjMessage && (
                                            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>{cjMessage}</div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={checkCJConnection}
                                    disabled={cjLoading}
                                    style={{
                                        padding: '8px 16px',
                                        border: '1px solid #e5e5e5',
                                        borderRadius: '8px',
                                        backgroundColor: '#fff',
                                        cursor: cjLoading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    <RefreshCw size={14} /> Refresh
                                </button>
                            </div>

                            {/* Setup Instructions */}
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                borderRadius: '12px'
                            }}>
                                <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 600, color: '#0369a1' }}>
                                    How to set up CJ Dropshipping:
                                </h3>
                                <ol style={{ margin: 0, paddingLeft: '20px', color: '#0369a1', fontSize: '0.9rem', lineHeight: 1.8 }}>
                                    <li>
                                        Go to{' '}
                                        <a
                                            href="https://www.cjdropshipping.com/myCJ.html#/apikey"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#0369a1', fontWeight: 500 }}
                                        >
                                            CJ Dropshipping API Key page <ExternalLink size={12} style={{ display: 'inline' }} />
                                        </a>
                                    </li>
                                    <li>Click "Generate" to create your API key</li>
                                    <li>Copy the API key and paste it below</li>
                                    <li>Click "Generate Token" to get your access token</li>
                                    <li>Add the tokens to your <code style={{ backgroundColor: '#dbeafe', padding: '2px 6px', borderRadius: '4px' }}>.env.local</code> file</li>
                                </ol>
                            </div>

                            {/* API Key Input */}
                            <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontWeight: 700,
                                        fontSize: '1.2rem'
                                    }}>
                                        CJ
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>CJ Dropshipping</div>
                                        <div style={{ fontSize: '0.85rem', color: '#888' }}>Import products and fulfill orders automatically</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={labelStyle}>API Key</label>
                                    <input
                                        type="text"
                                        placeholder="CJUserNum@api@xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                        value={cjApiKey}
                                        onChange={(e) => setCjApiKey(e.target.value)}
                                        style={inputStyle}
                                    />
                                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '8px' }}>
                                        Your API key from the CJ Dropshipping developer portal
                                    </div>
                                </div>

                                <button
                                    onClick={generateCJToken}
                                    disabled={cjLoading || !cjApiKey}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: cjLoading || !cjApiKey ? '#e5e5e5' : '#000',
                                        color: cjLoading || !cjApiKey ? '#888' : '#fff',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        cursor: cjLoading || !cjApiKey ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {cjLoading ? (
                                        <>
                                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                            Generating...
                                        </>
                                    ) : (
                                        <>Generate Token</>
                                    )}
                                </button>

                                {/* Token Info */}
                                {cjTokenInfo && (
                                    <div style={{
                                        marginTop: '20px',
                                        padding: '16px',
                                        backgroundColor: '#f0fdf4',
                                        borderRadius: '8px',
                                        border: '1px solid #bbf7d0'
                                    }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#166534', marginBottom: '12px' }}>
                                            ✓ Token Generated Successfully
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#166534' }}>
                                            <strong>Access Token:</strong> {cjTokenInfo.accessToken}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#166534' }}>
                                            <strong>Expires:</strong> {cjTokenInfo.expiresAt}
                                        </div>
                                        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#15803d' }}>
                                            Add these values to your <code>.env.local</code> file and restart the server.
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Margin Settings */}
                            <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px' }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600 }}>Pricing Settings</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={labelStyle}>Default Profit Margin (%)</label>
                                        <input type="number" defaultValue="50" style={inputStyle} />
                                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '8px' }}>
                                            Applied when importing products from CJ
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>USD to INR Rate</label>
                                        <input type="number" defaultValue="83" step="0.1" style={inputStyle} />
                                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '8px' }}>
                                            Exchange rate for price conversion
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'google' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Google Analytics */}
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, paddingBottom: '16px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <BarChart3 size={24} style={{ color: '#f59e0b' }} />
                                    Google Analytics
                                </h2>
                                <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', marginTop: '16px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={labelStyle}>Measurement ID (GA4)</label>
                                        <input
                                            type="text"
                                            placeholder="G-XXXXXXXXXX"
                                            value={googleAnalyticsId}
                                            onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                                            style={inputStyle}
                                        />
                                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '8px' }}>
                                            Find this in Google Analytics → Admin → Data Streams → Web
                                        </div>
                                    </div>
                                    <a
                                        href="https://analytics.google.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontSize: '0.9rem', textDecoration: 'none' }}
                                    >
                                        Open Google Analytics <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>

                            {/* Google Search Console */}
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, paddingBottom: '16px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Search size={24} style={{ color: '#4285f4' }} />
                                    Google Search Console
                                </h2>
                                <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', marginTop: '16px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={labelStyle}>Site Verification Meta Tag</label>
                                        <input
                                            type="text"
                                            placeholder="google-site-verification=xxxxxxxxxxxx"
                                            value={searchConsoleId}
                                            onChange={(e) => setSearchConsoleId(e.target.value)}
                                            style={inputStyle}
                                        />
                                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '8px' }}>
                                            Add this to verify your site ownership in Search Console
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0369a1', marginBottom: '8px' }}>
                                            Your Sitemap URL:
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <code style={{ flex: 1, padding: '8px 12px', backgroundColor: '#fff', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #e5e5e5' }}>
                                                https://dripzy.store/sitemap.xml
                                            </code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText('https://dripzy.store/sitemap.xml');
                                                    setCopied('sitemap');
                                                    setTimeout(() => setCopied(null), 2000);
                                                }}
                                                style={{ padding: '8px', border: '1px solid #e5e5e5', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer' }}
                                            >
                                                {copied === 'sitemap' ? <Check size={16} style={{ color: '#22c55e' }} /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <a
                                        href="https://search.google.com/search-console"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontSize: '0.9rem', textDecoration: 'none' }}
                                    >
                                        Open Search Console <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>

                            {/* Google Merchant Center */}
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, paddingBottom: '16px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <ShoppingBag size={24} style={{ color: '#4285f4' }} />
                                    Google Merchant Center
                                </h2>

                                {/* Product Feed Export */}
                                <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', marginTop: '16px' }}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600 }}>Product Feed Export</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '16px' }}>
                                        Export your products in Google Merchant Center compatible format for manual upload.
                                    </p>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        <a
                                            href="/api/products/export?format=csv&currency=INR"
                                            download="google-merchant-feed.csv"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '12px 20px',
                                                backgroundColor: '#000',
                                                color: '#fff',
                                                borderRadius: '10px',
                                                fontSize: '0.9rem',
                                                fontWeight: 500,
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <Download size={16} /> Download CSV (INR)
                                        </a>
                                        <a
                                            href="/api/products/export?format=csv&currency=USD"
                                            download="google-merchant-feed.csv"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '12px 20px',
                                                backgroundColor: '#f5f5f7',
                                                color: '#000',
                                                borderRadius: '10px',
                                                fontSize: '0.9rem',
                                                fontWeight: 500,
                                                textDecoration: 'none',
                                                border: '1px solid #e5e5e5'
                                            }}
                                        >
                                            <Download size={16} /> Download CSV (USD)
                                        </a>
                                        <a
                                            href="/api/products/export?format=xml&currency=INR"
                                            download="google-merchant-feed.xml"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '12px 20px',
                                                backgroundColor: '#f5f5f7',
                                                color: '#000',
                                                borderRadius: '10px',
                                                fontSize: '0.9rem',
                                                fontWeight: 500,
                                                textDecoration: 'none',
                                                border: '1px solid #e5e5e5'
                                            }}
                                        >
                                            <Download size={16} /> Download XML
                                        </a>
                                    </div>
                                </div>

                                {/* Scheduled Feed URL */}
                                <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', marginTop: '16px' }}>
                                    <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600 }}>Scheduled Feed URL</h3>
                                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px' }}>
                                        Use this URL in Google Merchant Center for automatic scheduled fetch:
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <code style={{ flex: 1, padding: '12px 16px', backgroundColor: '#f5f5f7', borderRadius: '8px', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            https://dripzy.store/api/products/export?format=xml&currency=INR
                                        </code>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText('https://dripzy.store/api/products/export?format=xml&currency=INR');
                                                setCopied('feed');
                                                setTimeout(() => setCopied(null), 2000);
                                            }}
                                            style={{ padding: '12px', border: '1px solid #e5e5e5', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}
                                        >
                                            {copied === 'feed' ? <Check size={16} style={{ color: '#22c55e' }} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Merchant Center ID */}
                                <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', marginTop: '16px' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={labelStyle}>Merchant Center ID</label>
                                        <input
                                            type="text"
                                            placeholder="123456789"
                                            value={merchantCenterId}
                                            onChange={(e) => setMerchantCenterId(e.target.value)}
                                            style={inputStyle}
                                        />
                                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '8px' }}>
                                            Your Merchant Center account ID (for reference)
                                        </div>
                                    </div>
                                </div>

                                {/* Setup Instructions */}
                                <div style={{ padding: '20px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', marginTop: '16px' }}>
                                    <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 600, color: '#0369a1' }}>
                                        How to connect to Google Merchant Center:
                                    </h3>
                                    <ol style={{ margin: 0, paddingLeft: '20px', color: '#0369a1', fontSize: '0.9rem', lineHeight: 1.8 }}>
                                        <li>
                                            Create a{' '}
                                            <a
                                                href="https://merchants.google.com/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#0369a1', fontWeight: 500 }}
                                            >
                                                Google Merchant Center account <ExternalLink size={12} style={{ display: 'inline' }} />
                                            </a>
                                        </li>
                                        <li>Verify and claim your website URL</li>
                                        <li>Go to Products → Feeds → Create Feed</li>
                                        <li>Choose "Scheduled fetch" and paste the Feed URL above</li>
                                        <li>Set fetch frequency (daily recommended)</li>
                                        <li>Submit for review</li>
                                    </ol>
                                </div>

                                {/* Quick Links */}
                                <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
                                    <a
                                        href="https://merchants.google.com/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontSize: '0.9rem', textDecoration: 'none' }}
                                    >
                                        Open Merchant Center <ExternalLink size={14} />
                                    </a>
                                    <a
                                        href="https://support.google.com/merchants/answer/7439058"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontSize: '0.9rem', textDecoration: 'none' }}
                                    >
                                        Product Data Specification <ExternalLink size={14} />
                                    </a>
                                    <a
                                        href="https://support.google.com/merchants/answer/188494"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontSize: '0.9rem', textDecoration: 'none' }}
                                    >
                                        Feed Requirements <ExternalLink size={14} />
                                    </a>
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

            {/* CSS for spinner animation */}
            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
