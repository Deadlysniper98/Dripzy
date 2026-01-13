'use client';

import { useState } from 'react';
import { Search, Filter, Download, Eye, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';

const ORDERS = [
    { id: 'DRZ12345', customer: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 98765 43210', date: '12 Jan 2026, 2:30 PM', status: 'Delivered', items: 2, total: 7499, payment: 'Razorpay' },
    { id: 'DRZ12344', customer: 'Priya Patel', email: 'priya@example.com', phone: '+91 87654 32109', date: '12 Jan 2026, 11:15 AM', status: 'Processing', items: 1, total: 2999, payment: 'COD' },
    { id: 'DRZ12343', customer: 'Amit Kumar', email: 'amit@example.com', phone: '+91 76543 21098', date: '11 Jan 2026, 6:45 PM', status: 'Shipped', items: 3, total: 14999, payment: 'Razorpay' },
    { id: 'DRZ12342', customer: 'Sneha Reddy', email: 'sneha@example.com', phone: '+91 65432 10987', date: '11 Jan 2026, 3:20 PM', status: 'Delivered', items: 1, total: 4500, payment: 'UPI' },
    { id: 'DRZ12341', customer: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 54321 09876', date: '10 Jan 2026, 9:00 AM', status: 'Cancelled', items: 2, total: 1999, payment: 'Razorpay' },
    { id: 'DRZ12340', customer: 'Anjali Gupta', email: 'anjali@example.com', phone: '+91 43210 98765', date: '10 Jan 2026, 7:30 AM', status: 'Delivered', items: 4, total: 22499, payment: 'Razorpay' },
    { id: 'DRZ12339', customer: 'Karan Mehta', email: 'karan@example.com', phone: '+91 32109 87654', date: '9 Jan 2026, 5:15 PM', status: 'Processing', items: 1, total: 5999, payment: 'COD' },
    { id: 'DRZ12338', customer: 'Neha Joshi', email: 'neha@example.com', phone: '+91 21098 76543', date: '9 Jan 2026, 1:45 PM', status: 'Shipped', items: 2, total: 8999, payment: 'UPI' },
];

const STATUSES = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Delivered': return { bg: '#dcfce7', text: '#166534' };
        case 'Processing': return { bg: '#fef9c3', text: '#854d0e' };
        case 'Shipped': return { bg: '#dbeafe', text: '#1e40af' };
        case 'Cancelled': return { bg: '#fee2e2', text: '#991b1b' };
        default: return { bg: '#f3f4f6', text: '#374151' };
    }
};

export default function OrdersPage() {
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOrders = ORDERS.filter(order => {
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: '0 0 8px' }}>Orders</h1>
                    <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>Manage and track all customer orders</p>
                </div>
                <button style={{
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
                }}>
                    <Download size={18} /> Export
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {/* Search */}
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

                {/* Status Tabs */}
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
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Order ID</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Customer</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Date</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Items</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Payment</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Total</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>#{order.id}</span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{order.customer}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{order.email}</div>
                                </td>
                                <td style={{ padding: '16px', fontSize: '0.85rem', color: '#666' }}>{order.date}</td>
                                <td style={{ padding: '16px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 500 }}>{order.items}</td>
                                <td style={{ padding: '16px', fontSize: '0.85rem', color: '#666' }}>{order.payment}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '6px 14px',
                                        borderRadius: '50px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: getStatusColor(order.status).bg,
                                        color: getStatusColor(order.status).text
                                    }}>
                                        {order.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 }}>₹{order.total.toLocaleString('en-IN')}</td>
                                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button style={{ padding: '8px', border: '1px solid #e5e5e5', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}>
                                            <Eye size={16} style={{ color: '#666' }} />
                                        </button>
                                        <button style={{ padding: '8px', border: '1px solid #e5e5e5', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}>
                                            <MoreVertical size={16} style={{ color: '#666' }} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>Showing {filteredOrders.length} of {ORDERS.length} orders</span>
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
        </div>
    );
}
