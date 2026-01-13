'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Package, MapPin, CreditCard, Heart, LogOut, ChevronRight, Edit2 } from 'lucide-react';

// Mock user data
const USER = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    avatar: null
};

const ORDERS = [
    { id: 'DRZ12345', date: '12 Jan 2026', status: 'Delivered', total: 7499, items: 2 },
    { id: 'DRZ12290', date: '5 Jan 2026', status: 'In Transit', total: 2999, items: 1 },
    { id: 'DRZ11987', date: '28 Dec 2025', status: 'Delivered', total: 14999, items: 3 },
];

const ADDRESSES = [
    { id: 1, label: 'Home', name: 'John Doe', address: '123 Main Street, Apt 4B', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', phone: '+91 98765 43210', isDefault: true },
    { id: 2, label: 'Office', name: 'John Doe', address: 'WeWork, 15th Floor, Express Towers', city: 'Mumbai', state: 'Maharashtra', pincode: '400021', phone: '+91 98765 43210', isDefault: false },
];

const WISHLIST = [
    { id: '5', name: 'Noise Cancelling Headphones Pro', price: 29999, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=200' },
    { id: '8', name: 'Wireless Earbuds Pro ANC', price: 12999, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=200' },
];

export default function AccountPage() {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'orders', label: 'Orders', icon: Package },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return '#22c55e';
            case 'In Transit': return '#eab308';
            case 'Processing': return '#3b82f6';
            default: return '#888';
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingTop: '120px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px' }}>
                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 600, marginBottom: '8px' }}>My Account</h1>
                    <p style={{ color: '#888', fontSize: '0.95rem' }}>Manage your profile, orders, and preferences</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '48px', alignItems: 'start' }}>
                    {/* Sidebar */}
                    <div style={{ backgroundColor: '#fafafa', borderRadius: '24px', padding: '24px', position: 'sticky', top: '120px' }}>
                        {/* User Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e5e5' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 600 }}>
                                {USER.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>{USER.name}</div>
                                <div style={{ fontSize: '0.85rem', color: '#888' }}>{USER.email}</div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '14px 16px',
                                        border: 'none',
                                        borderRadius: '12px',
                                        backgroundColor: activeTab === tab.id ? '#000' : 'transparent',
                                        color: activeTab === tab.id ? '#fff' : '#333',
                                        fontSize: '0.95rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        width: '100%',
                                        textAlign: 'left'
                                    }}
                                >
                                    <tab.icon size={20} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', border: 'none', backgroundColor: 'transparent', color: '#ef4444', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', width: '100%', marginTop: '24px', borderTop: '1px solid #e5e5e5', paddingTop: '24px' }}>
                            <LogOut size={20} />
                            Sign Out
                        </button>
                    </div>

                    {/* Content */}
                    <div>
                        {activeTab === 'profile' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Profile Information</h2>
                                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', border: '1px solid #e5e5e5', borderRadius: '50px', backgroundColor: '#fff', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
                                        <Edit2 size={16} /> Edit
                                    </button>
                                </div>

                                <div style={{ backgroundColor: '#fafafa', borderRadius: '20px', padding: '32px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 500 }}>{USER.name}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 500 }}>{USER.email}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 500 }}>{USER.phone}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member Since</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 500 }}>December 2025</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '32px' }}>Order History</h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {ORDERS.map(order => (
                                        <div key={order.id} style={{ backgroundColor: '#fafafa', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div style={{ width: '48px', height: '48px', backgroundColor: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Package size={24} style={{ color: '#666' }} />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>Order #{order.id}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#888' }}>{order.date} • {order.items} item{order.items > 1 ? 's' : ''}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                                <div style={{ padding: '6px 14px', borderRadius: '50px', backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status), fontSize: '0.85rem', fontWeight: 600 }}>
                                                    {order.status}
                                                </div>
                                                <div style={{ fontWeight: 600, minWidth: '100px', textAlign: 'right' }}>₹{order.total.toLocaleString('en-IN')}</div>
                                                <ChevronRight size={20} style={{ color: '#888' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Saved Addresses</h2>
                                    <button style={{ padding: '10px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                                        + Add New
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    {ADDRESSES.map(addr => (
                                        <div key={addr.id} style={{ backgroundColor: '#fafafa', borderRadius: '20px', padding: '24px', position: 'relative', border: addr.isDefault ? '2px solid #000' : '2px solid transparent' }}>
                                            {addr.isDefault && (
                                                <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#000', color: '#fff', padding: '4px 10px', borderRadius: '50px' }}>Default</div>
                                            )}
                                            <div style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <MapPin size={16} /> {addr.label}
                                            </div>
                                            <div style={{ fontSize: '0.95rem', color: '#333', marginTop: '12px', lineHeight: 1.6 }}>
                                                {addr.name}<br />
                                                {addr.address}<br />
                                                {addr.city}, {addr.state} {addr.pincode}<br />
                                                {addr.phone}
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                                <button style={{ padding: '8px 16px', border: '1px solid #e5e5e5', borderRadius: '50px', backgroundColor: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}>Edit</button>
                                                <button style={{ padding: '8px 16px', border: '1px solid #e5e5e5', borderRadius: '50px', backgroundColor: '#fff', fontSize: '0.85rem', cursor: 'pointer', color: '#ef4444' }}>Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'wishlist' && (
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '32px' }}>My Wishlist</h2>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                    {WISHLIST.map(item => (
                                        <Link key={item.id} href={`/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div style={{ backgroundColor: '#fafafa', borderRadius: '20px', overflow: 'hidden' }}>
                                                <div style={{ aspectRatio: '1/1', overflow: 'hidden' }}>
                                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div style={{ padding: '16px' }}>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '8px' }}>{item.name}</div>
                                                    <div style={{ fontWeight: 600 }}>₹{item.price.toLocaleString('en-IN')}</div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Payment Methods</h2>
                                    <button style={{ padding: '10px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                                        + Add Card
                                    </button>
                                </div>

                                <div style={{ backgroundColor: '#fafafa', borderRadius: '20px', padding: '32px', textAlign: 'center' }}>
                                    <CreditCard size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
                                    <p style={{ color: '#888', margin: 0 }}>No payment methods saved yet</p>
                                    <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '8px' }}>Add a card for faster checkout</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
