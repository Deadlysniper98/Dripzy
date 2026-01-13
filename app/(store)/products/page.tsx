'use client';

import Link from 'next/link';
import { ChevronRight, ChevronDown, Heart, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

const PRODUCTS = [
    { id: '1', name: 'MagSafe Wireless Charger', price: 2999, category: 'Chargers', subtitle: 'Electronics', colors: '3 Colors', image: 'https://images.unsplash.com/photo-1625591340248-6d2894ebd784?q=80&w=600' },
    { id: '2', name: 'iPhone 15 Pro Max Case', price: 4500, category: 'Cases', subtitle: 'Protection', colors: '5 Colors', image: 'https://images.unsplash.com/photo-1603539947673-c6eb2934808f?q=80&w=600' },
    { id: '3', name: 'USB-C Fast Charger 30W', price: 1999, category: 'Chargers', subtitle: 'Power Adapter', colors: '1 Color', image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=600' },
    { id: '4', name: 'iPad Air Folio Case', price: 5999, category: 'Cases', subtitle: 'Tablet Case', colors: '4 Colors', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600' },
    { id: '5', name: 'Noise Cancelling Headphones', price: 29999, category: 'Audio', subtitle: 'Over-Ear', colors: '2 Colors', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600' },
    { id: '6', name: 'Braided Lightning Cable', price: 1499, category: 'Cables', subtitle: '2m Length', colors: '3 Colors', image: 'https://images.unsplash.com/photo-1572569028738-411a561109dc?q=80&w=600' },
    { id: '7', name: 'Portable Power Bank 20000mAh', price: 3499, category: 'Power', subtitle: 'Fast Charging', colors: '2 Colors', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=600' },
    { id: '8', name: 'Wireless Earbuds Pro', price: 12999, category: 'Audio', subtitle: 'True Wireless', colors: '3 Colors', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600' },
];

const CATEGORIES = ['All', 'Chargers', 'Cases', 'Audio', 'Cables', 'Power'];

export default function ProductsPage() {
    const [category, setCategory] = useState('All');
    const [sortOpen, setSortOpen] = useState(false);
    const [sort, setSort] = useState('Latest');
    const { addItem } = useCart();

    const filtered = category === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === category);

    const handleQuickAdd = (product: typeof PRODUCTS[0]) => {
        addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
    };

    return (
        <div style={{ background: '#fafafa', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
                <section style={{ paddingTop: '140px', paddingBottom: '80px' }}>
                    {/* Breadcrumb */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.85rem', color: '#888' }}>
                        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Home page</Link>
                        <span>→</span>
                        <Link href="/products" style={{ color: '#888', textDecoration: 'none' }}>Electronics</Link>
                        <span>→</span>
                        <span style={{ color: '#000' }}>All Products</span>
                    </div>

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>
                            Electronics & Accessories
                        </h1>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '4px' }}>Electronics & Accessories</p>
                            <p style={{ fontWeight: 600 }}>— {filtered.length} results</p>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 0',
                        borderTop: '1px solid #e5e5e5',
                        borderBottom: '1px solid #e5e5e5',
                        marginBottom: '40px',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        {/* Category Filters */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: category === cat ? 600 : 400,
                                        color: category === cat ? '#000' : '#666',
                                        cursor: 'pointer',
                                        padding: '6px 0',
                                        borderBottom: category === cat ? '2px solid #000' : '2px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>Under ₹5,000</span>
                                <div style={{ width: '80px', height: '2px', background: '#ddd', borderRadius: '2px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '20%', right: '30%', height: '100%', background: '#000', borderRadius: '2px' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <SlidersHorizontal size={16} /> Open filter
                            </button>

                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setSortOpen(!sortOpen)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
                                >
                                    {sort} <ChevronDown size={16} style={{ transform: sortOpen ? 'rotate(180deg)' : '', transition: '0.2s' }} />
                                </button>
                                {sortOpen && (
                                    <div style={{ position: 'absolute', top: '100%', right: 0, background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: '10px', padding: '8px', zIndex: 10, minWidth: '120px' }}>
                                        {['Latest', 'Price: Low', 'Price: High', 'Popular'].map(s => (
                                            <button key={s} onClick={() => { setSort(s); setSortOpen(false); }} style={{ display: 'block', width: '100%', padding: '10px 12px', background: 'none', border: 'none', textAlign: 'left', fontSize: '0.9rem', cursor: 'pointer', borderRadius: '6px' }}>{s}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '32px'
                    }}>
                        {filtered.map((product) => (
                            <div key={product.id} style={{ position: 'relative' }}>
                                <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{
                                        aspectRatio: '1',
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        marginBottom: '16px',
                                        position: 'relative'
                                    }}>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                            className="product-img"
                                        />
                                        <button
                                            onClick={(e) => { e.preventDefault(); }}
                                            style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                background: '#fff',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <Heart size={18} />
                                        </button>
                                    </div>
                                </Link>

                                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>{product.name}</h3>
                                <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '2px' }}>{product.subtitle}</p>
                                <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>{product.colors}</p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600 }}>₹{product.price.toLocaleString('en-IN')}</span>
                                    <button
                                        onClick={() => handleQuickAdd(product)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '0.85rem',
                                            color: '#000',
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            fontWeight: 500
                                        }}
                                    >
                                        Add to cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <style>{`
                .product-img:hover { transform: scale(1.05); }
                @media (max-width: 900px) {
                    section > div:last-child { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 600px) {
                    section > div:last-child { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
