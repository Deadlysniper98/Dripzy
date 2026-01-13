'use client';

import { useState } from 'react';
import { Search, Download, Mail, Phone, MoreVertical, ChevronLeft, ChevronRight, User } from 'lucide-react';

const CUSTOMERS = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 98765 43210', orders: 12, spent: 45999, joined: '15 Oct 2025', status: 'Active' },
    { id: 2, name: 'Priya Patel', email: 'priya@example.com', phone: '+91 87654 32109', orders: 8, spent: 32500, joined: '22 Nov 2025', status: 'Active' },
    { id: 3, name: 'Amit Kumar', email: 'amit@example.com', phone: '+91 76543 21098', orders: 5, spent: 18999, joined: '1 Dec 2025', status: 'Active' },
    { id: 4, name: 'Sneha Reddy', email: 'sneha@example.com', phone: '+91 65432 10987', orders: 3, spent: 12500, joined: '5 Dec 2025', status: 'Inactive' },
    { id: 5, name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 54321 09876', orders: 15, spent: 78499, joined: '10 Sep 2025', status: 'Active' },
    { id: 6, name: 'Anjali Gupta', email: 'anjali@example.com', phone: '+91 43210 98765', orders: 7, spent: 28999, joined: '18 Nov 2025', status: 'Active' },
    { id: 7, name: 'Karan Mehta', email: 'karan@example.com', phone: '+91 32109 87654', orders: 2, spent: 5999, joined: '8 Jan 2026', status: 'Active' },
    { id: 8, name: 'Neha Joshi', email: 'neha@example.com', phone: '+91 21098 76543', orders: 0, spent: 0, joined: '12 Jan 2026', status: 'New' },
];

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCustomers = CUSTOMERS.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return { bg: '#dcfce7', text: '#166534' };
            case 'Inactive': return { bg: '#fee2e2', text: '#991b1b' };
            case 'New': return { bg: '#dbeafe', text: '#1e40af' };
            default: return { bg: '#f3f4f6', text: '#374151' };
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: '0 0 8px' }}>Customers</h1>
                    <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>View and manage your customer base</p>
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

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                    { label: 'Total Customers', value: CUSTOMERS.length.toString() },
                    { label: 'Active', value: CUSTOMERS.filter(c => c.status === 'Active').length.toString() },
                    { label: 'New This Month', value: CUSTOMERS.filter(c => c.status === 'New').length.toString() },
                    { label: 'Total Revenue', value: `₹${CUSTOMERS.reduce((sum, c) => sum + c.spent, 0).toLocaleString('en-IN')}` },
                ].map(stat => (
                    <div key={stat.label} style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>{stat.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: '400px' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                <input
                    type="text"
                    placeholder="Search customers..."
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

            {/* Customers Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Customer</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Contact</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Orders</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Total Spent</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Joined</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            backgroundColor: '#000',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.85rem',
                                            fontWeight: 600
                                        }}>
                                            {customer.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{customer.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#666' }}>
                                            <Mail size={14} /> {customer.email}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#666' }}>
                                            <Phone size={14} /> {customer.phone}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>{customer.orders}</td>
                                <td style={{ padding: '16px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 }}>₹{customer.spent.toLocaleString('en-IN')}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '6px 14px',
                                        borderRadius: '50px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: getStatusColor(customer.status).bg,
                                        color: getStatusColor(customer.status).text
                                    }}>
                                        {customer.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', fontSize: '0.85rem', color: '#666' }}>{customer.joined}</td>
                                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                    <button style={{ padding: '8px', border: '1px solid #e5e5e5', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}>
                                        <MoreVertical size={16} style={{ color: '#666' }} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>Showing {filteredCustomers.length} of {CUSTOMERS.length} customers</span>
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
