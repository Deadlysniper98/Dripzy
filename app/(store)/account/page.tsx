'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Package, MapPin, CreditCard, Heart, LogOut, ChevronRight, Edit2, Loader2, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function AccountPage() {
    const { user, signOut } = useAuth();
    const { formatPrice } = useCurrency();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');

    // Data States
    const [orders, setOrders] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [wishlist, setWishlist] = useState<any[]>([]);

    // Loading States
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [loadingWishlist, setLoadingWishlist] = useState(false);

    // Form States
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'IN',
        phone: ''
    });

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        // Initial fetches based on tab could be optimized, but fetching all for now is fine
        fetchOrders();
        fetchAddresses();
        fetchWishlist();
    }, [user, router]);

    const fetchOrders = async () => {
        if (!user) return;
        setLoadingOrders(true);
        try {
            const res = await fetch(`/api/orders?userId=${user.uid}`);
            const data = await res.json();
            if (data.success) setOrders(data.data.orders);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const fetchAddresses = async () => {
        if (!user) return;
        setLoadingAddresses(true);
        try {
            const res = await fetch(`/api/user/addresses?userId=${user.uid}`);
            const data = await res.json();
            if (data.success) setAddresses(data.data);
        } catch (error) {
            console.error('Failed to fetch addresses', error);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const fetchWishlist = async () => {
        if (!user) return;
        setLoadingWishlist(true);
        try {
            const res = await fetch(`/api/user/wishlist?userId=${user.uid}`);
            const data = await res.json();
            if (data.success) setWishlist(data.data);
        } catch (error) {
            console.error('Failed to fetch wishlist', error);
        } finally {
            setLoadingWishlist(false);
        }
    };

    const handleSaveAddress = async () => {
        if (!user) return;
        // Basic validation
        if (!newAddress.address || !newAddress.city || !newAddress.pincode || !newAddress.phone) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const res = await fetch('/api/user/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid, ...newAddress })
            });
            const data = await res.json();
            if (data.success) {
                setAddresses([...addresses, data.data]);
                setShowAddAddress(false);
                setNewAddress({
                    label: 'Home',
                    name: user.displayName || '',
                    address: '',
                    city: '',
                    state: '',
                    pincode: '',
                    country: 'IN',
                    phone: ''
                });
            } else {
                alert('Failed to save address');
            }
        } catch (error) {
            console.error('Error saving address:', error);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!user || !confirm('Are you sure you want to delete this address?')) return;
        try {
            const res = await fetch(`/api/user/addresses?userId=${user.uid}&addressId=${addressId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                setAddresses(addresses.filter(a => a.id !== addressId));
            }
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'orders', label: 'Orders', icon: Package },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    ];

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return '#22c55e';
            case 'shipped':
            case 'in transit': return '#eab308';
            case 'processing': return '#3b82f6';
            case 'cancelled': return '#ef4444';
            default: return '#888';
        }
    };

    if (!user) return null; // Or loading spinner

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff', paddingTop: '120px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 60px' }}>
                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 600, marginBottom: '8px' }}>My Account</h1>
                    <p style={{ color: '#888', fontSize: '0.95rem' }}>Manage your profile, orders, and preferences</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 280px) 1fr', gap: '48px', alignItems: 'start' }}>
                    {/* Sidebar */}
                    <div style={{ backgroundColor: '#fafafa', borderRadius: '24px', padding: '24px', position: 'sticky', top: '120px' }}>
                        {/* User Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #e5e5e5' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 600 }}>
                                {user.displayName ? user.displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'U'}
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.displayName || 'User'}</div>
                                <div style={{ fontSize: '0.85rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
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

                        <button
                            onClick={() => signOut()}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', border: 'none', backgroundColor: 'transparent', color: '#ef4444', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', width: '100%', marginTop: '24px', borderTop: '1px solid #e5e5e5', paddingTop: '24px' }}
                        >
                            <LogOut size={20} />
                            Sign Out
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ minHeight: '400px' }}>
                        {activeTab === 'profile' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Profile Information</h2>
                                </div>

                                <div style={{ backgroundColor: '#fafafa', borderRadius: '20px', padding: '32px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 500 }}>{user.displayName || 'Not provided'}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 500 }}>{user.email}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User ID</div>
                                            <div style={{ fontSize: '1rem', fontWeight: 500, fontFamily: 'monospace' }}>{user.uid.substring(0, 8)}...</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '32px' }}>Order History</h2>

                                {loadingOrders ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                                        <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 16px' }} />
                                        Loading your orders...
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: '#fafafa', borderRadius: '20px' }}>
                                        <Package size={48} style={{ color: '#ddd', marginBottom: '16px' }} />
                                        <p style={{ color: '#666' }}>No orders found.</p>
                                        <Link href="/products" style={{ display: 'inline-block', marginTop: '16px', padding: '10px 24px', backgroundColor: '#000', color: '#fff', borderRadius: '50px', textDecoration: 'none', fontSize: '0.9rem' }}>Start Shopping</Link>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {orders.map(order => (
                                            <div key={order.id} style={{ backgroundColor: '#fafafa', borderRadius: '20px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                    <div style={{ width: '48px', height: '48px', backgroundColor: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Package size={24} style={{ color: '#666' }} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Order #{order.orderNumber}</div>
                                                        <div style={{ fontSize: '0.85rem', color: '#888' }}>
                                                            {new Date(order.createdAt).toLocaleDateString()} • {order.items?.length || 0} items
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                                    <div style={{ padding: '6px 14px', borderRadius: '50px', backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status), fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' }}>
                                                        {order.status}
                                                    </div>
                                                    <div style={{ fontWeight: 600, minWidth: '80px', textAlign: 'right' }}>{formatPrice(order.total)}</div>
                                                    {/* Link to order details could go here */}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Saved Addresses</h2>
                                    <button
                                        onClick={() => setShowAddAddress(true)}
                                        style={{ padding: '10px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Plus size={16} /> Add New
                                    </button>
                                </div>

                                {showAddAddress && (
                                    <div style={{ marginBottom: '32px', backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '20px', padding: '24px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>New Address</h3>
                                            <button onClick={() => setShowAddAddress(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                            <input
                                                placeholder="Label (e.g. Home)"
                                                value={newAddress.label}
                                                onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                                            />
                                            <input
                                                placeholder="Full Name"
                                                value={newAddress.name}
                                                onChange={e => setNewAddress({ ...newAddress, name: e.target.value })}
                                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                                            />
                                        </div>
                                        <input
                                            placeholder="Street Address"
                                            value={newAddress.address}
                                            onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', marginBottom: '16px' }}
                                        />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                            <input
                                                placeholder="City"
                                                value={newAddress.city}
                                                onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                                            />
                                            <input
                                                placeholder="State"
                                                value={newAddress.state}
                                                onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                                            />
                                            <input
                                                placeholder="Pincode"
                                                value={newAddress.pincode}
                                                onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' }}
                                            />
                                        </div>
                                        <input
                                            placeholder="Phone Number"
                                            value={newAddress.phone}
                                            onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', width: '100%', marginBottom: '16px' }}
                                        />
                                        <button
                                            onClick={handleSaveAddress}
                                            style={{ padding: '12px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '50px', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            Save Address
                                        </button>
                                    </div>
                                )}

                                {loadingAddresses ? (
                                    <div style={{ textAlign: 'center', color: '#888' }}><Loader2 className="animate-spin" /></div>
                                ) : addresses.length === 0 && !showAddAddress ? (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#888', backgroundColor: '#fafafa', borderRadius: '20px' }}>
                                        No saved addresses. Add one to speed up checkout.
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                        {addresses.map(addr => (
                                            <div key={addr.id} style={{ backgroundColor: '#fafafa', borderRadius: '20px', padding: '24px', position: 'relative' }}>
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
                                                    <button
                                                        onClick={() => handleDeleteAddress(addr.id)}
                                                        style={{ padding: '8px 12px', border: '1px solid #fee2e2', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'wishlist' && (
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '32px' }}>My Wishlist</h2>

                                {loadingWishlist ? (
                                    <div style={{ textAlign: 'center', color: '#888' }}><Loader2 className="animate-spin" /></div>
                                ) : wishlist.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: '#fafafa', borderRadius: '20px' }}>
                                        <Heart size={48} style={{ color: '#ddd', marginBottom: '16px' }} />
                                        <p style={{ color: '#666' }}>Your wishlist is empty.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                                        {wishlist.map(item => (
                                            <div key={item.id} style={{ backgroundColor: '#fafafa', borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
                                                <Link href={`/product/${item.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                    <div style={{ aspectRatio: '1/1', overflow: 'hidden', backgroundColor: '#eee' }}>
                                                        {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                    </div>
                                                </Link>
                                                <div style={{ padding: '16px' }}>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                                    <div style={{ fontWeight: 600 }}>{item.price ? formatPrice(item.price) : 'N/A'}</div>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Remove from wishlist?')) {
                                                            await fetch(`/api/user/wishlist?userId=${user.uid}&itemId=${item.id}`, { method: 'DELETE' });
                                                            setWishlist(wishlist.filter(w => w.id !== item.id));
                                                        }
                                                    }}
                                                    style={{ position: 'absolute', top: '10px', right: '10px', padding: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                    <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '8px' }}>Payment saves will be enabled soon</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
