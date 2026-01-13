'use client';

import { DollarSign, Package, Users, TrendingUp, ArrowUpRight, ArrowDownRight, ShoppingBag, Eye } from 'lucide-react';

const STATS = [
    { title: 'Total Revenue', value: '₹4,52,310', change: '+20.1%', trend: 'up', icon: DollarSign },
    { title: 'Orders', value: '2,350', change: '+12.5%', trend: 'up', icon: Package },
    { title: 'Customers', value: '12,234', change: '+8.2%', trend: 'up', icon: Users },
    { title: 'Conversion Rate', value: '3.2%', change: '-0.4%', trend: 'down', icon: TrendingUp },
];

const RECENT_ORDERS = [
    { id: 'DRZ12345', customer: 'Rahul Sharma', email: 'rahul@example.com', date: '12 Jan 2026', status: 'Delivered', total: 7499 },
    { id: 'DRZ12344', customer: 'Priya Patel', email: 'priya@example.com', date: '12 Jan 2026', status: 'Processing', total: 2999 },
    { id: 'DRZ12343', customer: 'Amit Kumar', email: 'amit@example.com', date: '11 Jan 2026', status: 'Shipped', total: 14999 },
    { id: 'DRZ12342', customer: 'Sneha Reddy', email: 'sneha@example.com', date: '11 Jan 2026', status: 'Delivered', total: 4500 },
    { id: 'DRZ12341', customer: 'Vikram Singh', email: 'vikram@example.com', date: '10 Jan 2026', status: 'Cancelled', total: 1999 },
];

const TOP_PRODUCTS = [
    { name: 'MagSafe Wireless Charger', sales: 245, revenue: 733755 },
    { name: 'iPhone 15 Pro Max Case', sales: 189, revenue: 850500 },
    { name: 'Noise Cancelling Headphones', sales: 156, revenue: 4679844 },
    { name: 'USB-C Fast Charger 30W', sales: 134, revenue: 267866 },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Delivered': return { bg: '#dcfce7', text: '#166534' };
        case 'Processing': return { bg: '#fef9c3', text: '#854d0e' };
        case 'Shipped': return { bg: '#dbeafe', text: '#1e40af' };
        case 'Cancelled': return { bg: '#fee2e2', text: '#991b1b' };
        default: return { bg: '#f3f4f6', text: '#374151' };
    }
};

export default function DashboardPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: '0 0 8px' }}>Dashboard</h1>
                <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>Welcome back! Here's what's happening with your store.</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                {STATS.map((stat) => (
                    <div key={stat.title} style={{
                        padding: '24px',
                        backgroundColor: '#fff',
                        borderRadius: '16px',
                        border: '1px solid #eee'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                backgroundColor: '#f5f5f7',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <stat.icon size={22} style={{ color: '#333' }} />
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: stat.trend === 'up' ? '#16a34a' : '#dc2626'
                            }}>
                                {stat.change}
                                {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            </div>
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '4px' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.85rem', color: '#888' }}>{stat.title}</div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Recent Orders */}
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Recent Orders</h3>
                        <a href="/admin/orders" style={{ fontSize: '0.85rem', color: '#666', textDecoration: 'none' }}>View all →</a>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #eee' }}>
                                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Order</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Customer</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Date</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {RECENT_ORDERS.map((order) => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                    <td style={{ padding: '16px 24px', fontSize: '0.9rem', fontWeight: 500 }}>#{order.id}</td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{order.customer}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{order.email}</div>
                                    </td>
                                    <td style={{ padding: '16px', fontSize: '0.9rem', color: '#666' }}>{order.date}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '50px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            backgroundColor: getStatusColor(order.status).bg,
                                            color: getStatusColor(order.status).text
                                        }}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 }}>₹{order.total.toLocaleString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Top Products */}
                <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #eee' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>Top Products</h3>
                    </div>
                    <div style={{ padding: '8px 0' }}>
                        {TOP_PRODUCTS.map((product, i) => (
                            <div key={product.name} style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        backgroundColor: '#f5f5f7',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        color: '#666'
                                    }}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{product.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>{product.sales} sales</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>₹{product.revenue.toLocaleString('en-IN')}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                    { label: 'Add Product', icon: ShoppingBag, href: '/admin/products/new', color: '#000' },
                    { label: 'View Orders', icon: Package, href: '/admin/orders', color: '#3b82f6' },
                    { label: 'Customers', icon: Users, href: '/admin/customers', color: '#8b5cf6' },
                    { label: 'Analytics', icon: Eye, href: '/admin/analytics', color: '#ec4899' },
                ].map((action) => (
                    <a key={action.label} href={action.href} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px 20px',
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: '1px solid #eee',
                        textDecoration: 'none',
                        color: '#333',
                        transition: 'all 0.2s'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: action.color + '15',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <action.icon size={20} style={{ color: action.color }} />
                        </div>
                        <span style={{ fontWeight: 500 }}>{action.label}</span>
                    </a>
                ))}
            </div>
        </div>
    );
}
