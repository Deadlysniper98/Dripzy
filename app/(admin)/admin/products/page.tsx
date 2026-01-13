'use client';

import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, MoreVertical, ChevronLeft, ChevronRight, Package, Image as ImageIcon } from 'lucide-react';

const PRODUCTS = [
    { id: '1', name: 'MagSafe Wireless Charger', sku: 'DRZ-MAG-001', category: 'Chargers', price: 2999, stock: 145, status: 'Active', image: 'https://images.unsplash.com/photo-1625591340248-6d2894ebd784?q=80&w=100' },
    { id: '2', name: 'iPhone 15 Pro Max Premium Case', sku: 'DRZ-CASE-002', category: 'Cases', price: 4500, stock: 89, status: 'Active', image: 'https://images.unsplash.com/photo-1603539947673-c6eb2934808f?q=80&w=100' },
    { id: '3', name: 'USB-C Fast Charger 30W GaN', sku: 'DRZ-CHG-003', category: 'Chargers', price: 1999, stock: 234, status: 'Active', image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=100' },
    { id: '4', name: 'iPad Air Premium Folio Case', sku: 'DRZ-CASE-004', category: 'Cases', price: 5999, stock: 56, status: 'Active', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=100' },
    { id: '5', name: 'Noise Cancelling Headphones Pro', sku: 'DRZ-AUD-005', category: 'Audio', price: 29999, stock: 23, status: 'Low Stock', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=100' },
    { id: '6', name: 'Premium Braided Lightning Cable 2M', sku: 'DRZ-CBL-006', category: 'Cables', price: 1499, stock: 0, status: 'Out of Stock', image: 'https://images.unsplash.com/photo-1572569028738-411a561109dc?q=80&w=100' },
    { id: '7', name: 'Power Bank 20000mAh Fast Charge', sku: 'DRZ-PWR-007', category: 'Power', price: 3499, stock: 67, status: 'Active', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=100' },
    { id: '8', name: 'Wireless Earbuds Pro ANC', sku: 'DRZ-AUD-008', category: 'Audio', price: 12999, stock: 12, status: 'Low Stock', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=100' },
];

const CATEGORIES = ['All', 'Chargers', 'Cases', 'Audio', 'Cables', 'Power'];

export default function ProductsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const filteredProducts = PRODUCTS.filter(product => {
        const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return { bg: '#dcfce7', text: '#166534' };
            case 'Low Stock': return { bg: '#fef9c3', text: '#854d0e' };
            case 'Out of Stock': return { bg: '#fee2e2', text: '#991b1b' };
            case 'Draft': return { bg: '#f3f4f6', text: '#374151' };
            default: return { bg: '#f3f4f6', text: '#374151' };
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: '0 0 8px' }}>Products</h1>
                    <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>Manage your product catalog</p>
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
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                {[
                    { label: 'Total Products', value: PRODUCTS.length.toString() },
                    { label: 'Active', value: PRODUCTS.filter(p => p.status === 'Active').length.toString() },
                    { label: 'Low Stock', value: PRODUCTS.filter(p => p.status === 'Low Stock').length.toString() },
                    { label: 'Out of Stock', value: PRODUCTS.filter(p => p.status === 'Out of Stock').length.toString() },
                ].map(stat => (
                    <div key={stat.label} style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>{stat.label}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                    <input
                        type="text"
                        placeholder="Search products..."
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

                {/* Category Tabs */}
                <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f5f5f7', padding: '4px', borderRadius: '10px' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                backgroundColor: categoryFilter === cat ? '#fff' : 'transparent',
                                color: categoryFilter === cat ? '#000' : '#666',
                                boxShadow: categoryFilter === cat ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee' }}>
                            <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Product</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>SKU</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Category</th>
                            <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Price</th>
                            <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Stock</th>
                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => (
                            <tr key={product.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '10px',
                                            overflow: 'hidden',
                                            backgroundColor: '#f5f5f7',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <ImageIcon size={20} style={{ color: '#ccc' }} />
                                            )}
                                        </div>
                                        <span style={{ fontWeight: 500 }}>{product.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px', fontSize: '0.85rem', fontFamily: 'monospace', color: '#666' }}>{product.sku}</td>
                                <td style={{ padding: '16px', fontSize: '0.9rem', color: '#666' }}>{product.category}</td>
                                <td style={{ padding: '16px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 }}>₹{product.price.toLocaleString('en-IN')}</td>
                                <td style={{ padding: '16px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 500 }}>{product.stock}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '6px 14px',
                                        borderRadius: '50px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: getStatusColor(product.status).bg,
                                        color: getStatusColor(product.status).text
                                    }}>
                                        {product.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button style={{ padding: '8px', border: '1px solid #e5e5e5', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}>
                                            <Edit2 size={16} style={{ color: '#666' }} />
                                        </button>
                                        <button style={{ padding: '8px', border: '1px solid #e5e5e5', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer' }}>
                                            <Trash2 size={16} style={{ color: '#ef4444' }} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>Showing {filteredProducts.length} of {PRODUCTS.length} products</span>
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
