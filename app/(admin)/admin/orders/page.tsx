'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Eye, ChevronLeft, ChevronRight, Package, Truck, CheckCircle, XCircle, Clock, Loader2, X, Edit, CreditCard } from 'lucide-react';

interface Order {
    id: string;
    orderNumber: string;
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    shippingAddress: {
        address: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        countryCode?: string;
    };
    items: {
        productId: string;
        variantId?: string;
        name: string;
        price: number;
        quantity: number;
        image: string;
    }[];
    subtotal: number;
    shipping: number;
    shippingInfo?: {
        method: string;
        estimatedDelivery: string;
        code?: string;
    };
    total: number;
    currency: string;
    paymentMethod: string;
    paymentId?: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    fulfillmentStatus: 'unfulfilled' | 'pending' | 'fulfilled';
    cjOrderId?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    createdAt: string;
}

const STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'delivered': return { bg: '#dcfce7', text: '#166534' };
        case 'processing': return { bg: '#fef9c3', text: '#854d0e' };
        case 'shipped': return { bg: '#dbeafe', text: '#1e40af' };
        case 'cancelled': return { bg: '#fee2e2', text: '#991b1b' };
        case 'pending': return { bg: '#f3f4f6', text: '#374151' };
        default: return { bg: '#f3f4f6', text: '#374151' };
    }
};

const getFulfillmentColor = (status: string) => {
    switch (status) {
        case 'fulfilled': return { bg: '#dcfce7', text: '#166534' };
        case 'pending': return { bg: '#fef9c3', text: '#854d0e' };
        case 'unfulfilled': return { bg: '#fee2e2', text: '#991b1b' };
        default: return { bg: '#f3f4f6', text: '#374151' };
    }
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [fulfilling, setFulfilling] = useState<string | null>(null);
    const [fulfillConfirmOrder, setFulfillConfirmOrder] = useState<Order | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (data.success) {
                setOrders(data.data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFulfill = async (orderId: string) => {
        console.log('[FULFILL] Starting fulfillment for order:', orderId);
        setFulfillConfirmOrder(null); // Close modal

        setFulfilling(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}/fulfill`, { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                alert(`Order sent to CJ! CJ Order ID: ${data.data.cjOrderId}`);
                fetchOrders();
            } else {
                const detailStr = data.details ? `\n\nDetails: ${JSON.stringify(data.details, null, 2)}` : '';
                alert(`Failed: ${data.error}${detailStr}`);
            }
        } catch (error) {
            console.error('Error fulfilling order:', error);
            alert('An unexpected error occurred during fulfillment. Check console.');
        } finally {
            setFulfilling(null);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setUpdating(orderId);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();

            if (data.success) {
                fetchOrders();
            } else {
                alert(`Failed: ${data.error}`);
            }
        } catch (error) {
            console.error('Error updating order:', error);
        } finally {
            setUpdating(null);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter === 'All' || order.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesSearch = order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatPrice = (amount: number, currency: string) => {
        if (currency === 'INR') {
            return `₹${amount.toLocaleString('en-IN')}`;
        }
        return `$${amount.toFixed(2)}`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: '0 0 8px' }}>Orders</h1>
                    <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>Manage and fulfill customer orders</p>
                </div>
                <button
                    onClick={fetchOrders}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        backgroundColor: '#000',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                    { label: 'Total Orders', value: orders.length, icon: Package, color: '#3b82f6' },
                    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, icon: Clock, color: '#f59e0b' },
                    { label: 'Unfulfilled', value: orders.filter(o => o.fulfillmentStatus === 'unfulfilled').length, icon: XCircle, color: '#ef4444' },
                    { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: '#22c55e' },
                ].map((stat) => (
                    <div key={stat.label} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #eee' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '10px', backgroundColor: `${stat.color}15`, borderRadius: '10px' }}>
                                <stat.icon size={20} style={{ color: stat.color }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</div>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>{stat.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px 12px 44px',
                            border: '1px solid #e5e5e5',
                            borderRadius: '10px',
                            fontSize: '0.9rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f5f5f7', padding: '4px', borderRadius: '10px' }}>
                    {STATUSES.map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                backgroundColor: statusFilter === status ? '#fff' : 'transparent',
                                color: statusFilter === status ? '#000' : '#666',
                                boxShadow: statusFilter === status ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 16px', color: '#888' }} />
                        <p style={{ color: '#888' }}>Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <Package size={48} style={{ margin: '0 auto 16px', color: '#ccc' }} />
                        <p style={{ color: '#888', marginBottom: '8px' }}>No orders found</p>
                        <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Orders will appear here when customers complete checkout</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #eee' }}>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Order</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Customer</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Items</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Region</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Payment</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Fulfillment</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Shipping</th>
                                <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Total</th>
                                <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>#{order.orderNumber}</span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{order.customer?.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{order.customer?.email}</div>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem', color: '#666' }}>{formatDate(order.createdAt)}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 500 }}>{order.items?.length || 0}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            backgroundColor: '#f3f4f6',
                                            color: '#374151'
                                        }}>
                                            {order.shippingAddress?.countryCode || order.shippingAddress?.country === 'India' ? 'IN' : 'US'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 12px',
                                                borderRadius: '50px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: '#f0f9ff',
                                                color: '#0369a1',
                                                textTransform: 'uppercase'
                                            }}>
                                                <CreditCard size={12} />
                                                {order.paymentMethod || 'N/A'}
                                            </span>
                                            {order.paymentMethod === 'cod' && (
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '0.7rem',
                                                    color: '#16a34a',
                                                    fontWeight: 600
                                                }}>
                                                    <CheckCircle size={10} /> Verified
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '50px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            backgroundColor: getStatusColor(order.status).bg,
                                            color: getStatusColor(order.status).text,
                                            textTransform: 'capitalize'
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '50px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            backgroundColor: getFulfillmentColor(order.fulfillmentStatus).bg,
                                            color: getFulfillmentColor(order.fulfillmentStatus).text,
                                            textTransform: 'capitalize'
                                        }}>
                                            {order.fulfillmentStatus}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '5px 10px',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: order.shippingInfo?.method?.toLowerCase().includes('express') || order.shippingInfo?.method?.toLowerCase().includes('dhl') ? '#fef3c7' : '#f0fdf4',
                                                color: order.shippingInfo?.method?.toLowerCase().includes('express') || order.shippingInfo?.method?.toLowerCase().includes('dhl') ? '#92400e' : '#166534',
                                                maxWidth: '130px',
                                                textOverflow: 'ellipsis',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap'
                                            }} title={order.shippingInfo?.method || 'Standard'}>
                                                <Truck size={12} />
                                                {order.shippingInfo?.method || 'Standard'}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#000' }}>
                                                {formatPrice(order.shipping, order.currency)}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 }}>
                                        {formatPrice(order.total, order.currency)}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                style={{ padding: '8px', border: '1px solid #e5e5e5', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}
                                                title="View Details"
                                            >
                                                <Eye size={16} style={{ color: '#666' }} />
                                            </button>
                                            <button
                                                onClick={() => setEditingOrder(order)}
                                                style={{ padding: '8px', border: '1px solid #e5e5e5', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}
                                                title="Edit Order"
                                            >
                                                <Edit size={16} style={{ color: '#666' }} />
                                            </button>
                                            {order.fulfillmentStatus === 'unfulfilled' && (
                                                <button
                                                    onClick={() => setFulfillConfirmOrder(order)}
                                                    disabled={fulfilling === order.id}
                                                    style={{
                                                        padding: '8px 12px',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        backgroundColor: '#000',
                                                        color: '#fff',
                                                        cursor: fulfilling === order.id ? 'not-allowed' : 'pointer',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}
                                                    title="Fulfill via CJ"
                                                >
                                                    {fulfilling === order.id ? (
                                                        <Loader2 size={14} className="animate-spin" />
                                                    ) : (
                                                        <Truck size={14} />
                                                    )}
                                                    Fulfill
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>Showing {filteredOrders.length} of {orders.length} orders</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <button style={{ padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }} onClick={() => setSelectedOrder(null)}>
                    <div
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '20px',
                            width: '100%',
                            maxWidth: '700px',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            padding: '32px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600 }}>Order #{selectedOrder.orderNumber}</h2>
                                <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.85rem' }}>{formatDate(selectedOrder.createdAt)}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Status Row */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                            <span style={{
                                padding: '8px 16px',
                                borderRadius: '50px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                backgroundColor: getStatusColor(selectedOrder.status).bg,
                                color: getStatusColor(selectedOrder.status).text,
                                textTransform: 'capitalize'
                            }}>
                                {selectedOrder.status}
                            </span>
                            <span style={{
                                padding: '8px 16px',
                                borderRadius: '50px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                backgroundColor: getFulfillmentColor(selectedOrder.fulfillmentStatus).bg,
                                color: getFulfillmentColor(selectedOrder.fulfillmentStatus).text,
                                textTransform: 'capitalize'
                            }}>
                                {selectedOrder.fulfillmentStatus}
                            </span>
                        </div>

                        {/* Customer & Shipping */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                                <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Customer</h4>
                                <p style={{ margin: '0 0 4px', fontWeight: 500 }}>{selectedOrder.customer?.name}</p>
                                <p style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#666' }}>{selectedOrder.customer?.email}</p>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{selectedOrder.customer?.phone}</p>
                            </div>
                            <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                                <h4 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Shipping Address</h4>
                                <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>{selectedOrder.shippingAddress?.address}</p>
                                <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>{selectedOrder.shippingAddress?.pincode}, {selectedOrder.shippingAddress?.country}</p>
                            </div>
                        </div>

                        {/* Tracking Info */}
                        {selectedOrder.trackingNumber && (
                            <div style={{ padding: '16px 20px', backgroundColor: '#dbeafe', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Truck size={20} style={{ color: '#1e40af' }} />
                                <div>
                                    <span style={{ fontWeight: 600, color: '#1e40af' }}>Tracking: </span>
                                    <span style={{ color: '#1e40af' }}>{selectedOrder.trackingNumber}</span>
                                </div>
                            </div>
                        )}

                        {/* Items */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ margin: '0 0 16px', fontSize: '0.85rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Items</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '10px' }}>
                                        {item.image && (
                                            <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: '0 0 4px', fontWeight: 500 }}>{item.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Qty: {item.quantity}</p>
                                        </div>
                                        <div style={{ textAlign: 'right', fontWeight: 600 }}>
                                            {formatPrice(item.price * item.quantity, selectedOrder.currency)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                                <span style={{ color: '#666' }}>Subtotal</span>
                                <span>{formatPrice(selectedOrder.subtotal, selectedOrder.currency)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                                <span style={{ color: '#666' }}>Shipping</span>
                                <span>{formatPrice(selectedOrder.shipping, selectedOrder.currency)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #eee', fontSize: '1.1rem', fontWeight: 700 }}>
                                <span>Total</span>
                                <span>{formatPrice(selectedOrder.total, selectedOrder.currency)}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            {selectedOrder.fulfillmentStatus === 'unfulfilled' && (
                                <button
                                    onClick={() => {
                                        setFulfillConfirmOrder(selectedOrder);
                                        setSelectedOrder(null);
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        backgroundColor: '#000',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Truck size={18} /> Fulfill via CJ Dropshipping
                                </button>
                            )}
                            <select
                                value={selectedOrder.status}
                                onChange={(e) => {
                                    handleUpdateStatus(selectedOrder.id, e.target.value);
                                    setSelectedOrder({ ...selectedOrder, status: e.target.value as any });
                                }}
                                style={{
                                    padding: '14px 20px',
                                    border: '1px solid #e5e5e5',
                                    borderRadius: '10px',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    backgroundColor: '#fff'
                                }}
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Order Modal */}
            {editingOrder && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }} onClick={() => setEditingOrder(null)}>
                    <div
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '20px',
                            width: '100%',
                            maxWidth: '700px',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            padding: '32px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600 }}>Edit Order #{editingOrder.orderNumber}</h2>
                                <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.85rem' }}>Update order details</p>
                            </div>
                            <button onClick={() => setEditingOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Customer Info */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ margin: '0 0 16px', fontSize: '0.85rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Customer Information</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '6px' }}>Name</label>
                                    <input
                                        type="text"
                                        value={editingOrder.customer?.name || ''}
                                        onChange={(e) => setEditingOrder({
                                            ...editingOrder,
                                            customer: { ...editingOrder.customer, name: e.target.value }
                                        })}
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '0.9rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '6px' }}>Email</label>
                                    <input
                                        type="email"
                                        value={editingOrder.customer?.email || ''}
                                        onChange={(e) => setEditingOrder({
                                            ...editingOrder,
                                            customer: { ...editingOrder.customer, email: e.target.value }
                                        })}
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '0.9rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '6px' }}>Phone</label>
                                    <input
                                        type="tel"
                                        value={editingOrder.customer?.phone || ''}
                                        onChange={(e) => setEditingOrder({
                                            ...editingOrder,
                                            customer: { ...editingOrder.customer, phone: e.target.value }
                                        })}
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ margin: '0 0 16px', fontSize: '0.85rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Shipping Address</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '6px' }}>Address</label>
                                    <input
                                        type="text"
                                        value={editingOrder.shippingAddress?.address || ''}
                                        onChange={(e) => setEditingOrder({
                                            ...editingOrder,
                                            shippingAddress: { ...editingOrder.shippingAddress, address: e.target.value }
                                        })}
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '0.9rem' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '6px' }}>City</label>
                                        <input
                                            type="text"
                                            value={editingOrder.shippingAddress?.city || ''}
                                            onChange={(e) => setEditingOrder({
                                                ...editingOrder,
                                                shippingAddress: { ...editingOrder.shippingAddress, city: e.target.value }
                                            })}
                                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '6px' }}>State</label>
                                        <input
                                            type="text"
                                            value={editingOrder.shippingAddress?.state || ''}
                                            onChange={(e) => setEditingOrder({
                                                ...editingOrder,
                                                shippingAddress: { ...editingOrder.shippingAddress, state: e.target.value }
                                            })}
                                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '6px' }}>PIN Code</label>
                                        <input
                                            type="text"
                                            value={editingOrder.shippingAddress?.pincode || ''}
                                            onChange={(e) => setEditingOrder({
                                                ...editingOrder,
                                                shippingAddress: { ...editingOrder.shippingAddress, pincode: e.target.value }
                                            })}
                                            style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '6px' }}>Country</label>
                                    <select
                                        value={editingOrder.shippingAddress?.country || ''}
                                        onChange={(e) => setEditingOrder({
                                            ...editingOrder,
                                            shippingAddress: { ...editingOrder.shippingAddress, country: e.target.value }
                                        })}
                                        title="Select Country"
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '0.9rem' }}
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
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ margin: '0 0 16px', fontSize: '0.85rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Order Items</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {editingOrder.items?.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '10px', alignItems: 'center' }}>
                                        {item.image && (
                                            <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>{item.name}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <label style={{ fontSize: '0.8rem', color: '#666' }}>Qty:</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const newItems = [...editingOrder.items];
                                                    newItems[idx] = { ...newItems[idx], quantity: parseInt(e.target.value) || 1 };
                                                    setEditingOrder({ ...editingOrder, items: newItems });
                                                }}
                                                style={{ width: '60px', padding: '6px 10px', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <label style={{ fontSize: '0.8rem', color: '#666' }}>Price:</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.price}
                                                onChange={(e) => {
                                                    const newItems = [...editingOrder.items];
                                                    newItems[idx] = { ...newItems[idx], price: parseFloat(e.target.value) || 0 };
                                                    setEditingOrder({ ...editingOrder, items: newItems });
                                                }}
                                                style={{ width: '80px', padding: '6px 10px', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'right' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Status */}
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ margin: '0 0 16px', fontSize: '0.85rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Order Status</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '6px' }}>Status</label>
                                    <select
                                        value={editingOrder.status}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value as any })}
                                        title="Select Status"
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '0.9rem' }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '6px' }}>Fulfillment Status</label>
                                    <select
                                        value={editingOrder.fulfillmentStatus}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, fulfillmentStatus: e.target.value as any })}
                                        title="Select Fulfillment Status"
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '0.9rem' }}
                                    >
                                        <option value="unfulfilled">Unfulfilled</option>
                                        <option value="pending">Pending</option>
                                        <option value="fulfilled">Fulfilled</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setEditingOrder(null)}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#fff',
                                    color: '#000',
                                    border: '1px solid #e5e5e5',
                                    borderRadius: '10px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setUpdating(editingOrder.id);
                                    try {
                                        // Calculate new totals
                                        const newSubtotal = editingOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                        const orderToSave = {
                                            ...editingOrder,
                                            subtotal: newSubtotal,
                                            total: newSubtotal + (editingOrder.shipping || 0)
                                        };

                                        const res = await fetch(`/api/orders/${editingOrder.id}`, {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(orderToSave),
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            alert('Order updated successfully!');
                                            setEditingOrder(null);
                                            fetchOrders();
                                        } else {
                                            alert(`Failed: ${data.error}`);
                                        }
                                    } catch (error) {
                                        console.error('Error updating order:', error);
                                        alert('Failed to update order');
                                    } finally {
                                        setUpdating(null);
                                    }
                                }}
                                disabled={updating === editingOrder.id}
                                style={{
                                    padding: '12px 32px',
                                    backgroundColor: updating === editingOrder.id ? '#888' : '#000',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: 600,
                                    cursor: updating === editingOrder.id ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {updating === editingOrder.id ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fulfillment Confirmation Modal */}
            {fulfillConfirmOrder && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '450px',
                        width: '90%',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#fef3c7',
                                borderRadius: '12px'
                            }}>
                                <Truck size={24} style={{ color: '#d97706' }} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                                Confirm Fulfillment
                            </h3>
                        </div>

                        <div style={{
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '8px' }}>
                                Order Details
                            </div>
                            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                #{fulfillConfirmOrder.orderNumber}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>
                                {fulfillConfirmOrder.customer.name} • {formatPrice(fulfillConfirmOrder.total, fulfillConfirmOrder.currency)}
                            </div>
                        </div>

                        <div style={{
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '10px',
                            padding: '14px',
                            marginBottom: '24px',
                            fontSize: '0.85rem',
                            color: '#991b1b'
                        }}>
                            ⚠️ This will send the order to CJ Dropshipping and <strong>charge your CJ wallet balance</strong>.
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setFulfillConfirmOrder(null)}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleFulfill(fulfillConfirmOrder.id)}
                                disabled={fulfilling === fulfillConfirmOrder.id}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    backgroundColor: '#000',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: 600,
                                    cursor: fulfilling === fulfillConfirmOrder.id ? 'not-allowed' : 'pointer',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {fulfilling === fulfillConfirmOrder.id ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Truck size={16} />
                                        Confirm & Fulfill
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
