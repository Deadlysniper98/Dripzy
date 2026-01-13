'use client';

import Link from 'next/link';

const PRODUCTS = [
    { id: '1', name: 'MagSafe Wireless Charger', price: 2999, originalPrice: 3999, discount: 25, colors: ['#000', '#2b3d50'], image: 'https://images.unsplash.com/photo-1625591340248-6d2894ebd784?q=80&w=600' },
    { id: '5', name: 'Noise Cancelling Headphones Pro', price: 29999, originalPrice: 34999, discount: 14, colors: ['#000'], image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600' },
    { id: '6', name: 'Premium Braided Lightning Cable 2M', price: 1499, originalPrice: 1999, discount: 25, colors: ['#000', '#3f51b5', '#673ab7', '#757575'], image: 'https://images.unsplash.com/photo-1572569028738-411a561109dc?q=80&w=600' },
    { id: '2', name: 'iPhone 15 Pro Max Premium Case', price: 4500, originalPrice: 5999, discount: 25, colors: ['#000', '#1a1a1a', '#2c3e50'], image: 'https://images.unsplash.com/photo-1603539947673-c6eb2934808f?q=80&w=600' },
    { id: '8', name: 'Wireless Earbuds Pro ANC', price: 12999, originalPrice: 19999, discount: 35, colors: ['#1c2e4a', '#3d5229', '#f5f5f5', '#f8c8dc'], image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600' },
    { id: '3', name: 'USB-C Fast Charger 30W GaN', price: 1999, originalPrice: 2999, discount: 33, colors: ['#000', '#d32f2f', '#388e3c'], image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=600' },
    { id: '7', name: 'Power Bank 20000mAh Fast Charge', price: 3499, originalPrice: 4999, discount: 30, colors: ['#d32f2f', '#ffab91', '#fff', '#cddc39'], image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=600' },
    { id: '4', name: 'iPad Air Premium Folio Case', price: 5999, originalPrice: 7999, discount: 25, colors: ['#000'], image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600' },
];

export const BestSellers = () => {
    return (
        <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '60px 24px', boxSizing: 'border-box' }}>
            {/* Header */}
            <div style={{ marginBottom: '60px', borderBottom: '1px solid #efeff1', paddingBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, margin: 0, letterSpacing: '-0.05em', color: '#000', lineHeight: 1 }}>Best Sellers</h2>
                    <p style={{ color: '#6e6e73', margin: '15px 0 0 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Curated Collection</p>
                </div>
            </div>

            {/* Product Grid */}
            <div style={{ display: 'grid', gap: '50px 30px', gridTemplateColumns: 'repeat(4, 1fr)' }} className="product-grid">
                {PRODUCTS.map((product) => (
                    <Link key={product.id} href={`/product/${product.id}`} style={{ background: '#fff', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'transform 0.4s cubic-bezier(0.2, 0, 0.2, 1)' }} className="product-card">
                        {/* Badge */}
                        <div style={{ position: 'absolute', top: '15px', left: '15px', fontSize: '0.65rem', fontWeight: 700, background: 'rgba(0, 0, 0, 0.85)', color: 'white', padding: '6px 12px', borderRadius: '30px', zIndex: 5, backdropFilter: 'blur(4px)' }}>
                            -{product.discount}%
                        </div>

                        {/* Image */}
                        <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', width: '100%', borderRadius: '24px', background: '#fdfdfd' }} className="image-wrap">
                            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 1.2s cubic-bezier(0.2, 0, 0.2, 1)' }} className="product-image" />
                        </div>

                        {/* Info */}
                        <div style={{ padding: '24px 8px 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.4, margin: '0 0 10px 0', color: '#000', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                                    {product.colors.slice(0, 4).map((color, i) => (
                                        <span key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.08)', display: 'block', backgroundColor: color }}></span>
                                    ))}
                                    {product.colors.length > 4 && <span style={{ fontSize: '0.7rem', color: '#b0b0b0', fontWeight: 500, marginLeft: '2px' }}>+{product.colors.length - 4}</span>}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#000', display: 'block' }}>₹{product.price.toLocaleString('en-IN')}</span>
                                <span style={{ fontSize: '0.85rem', color: '#b0b0b0', textDecoration: 'line-through', display: 'block', marginTop: '4px', fontWeight: 400 }}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <style>{`
                .product-card:hover { transform: translateY(-5px); }
                .product-card:hover .product-image { transform: scale(1.05); }
                @media (max-width: 1024px) { .product-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 40px 20px !important; } }
                @media (max-width: 768px) { .product-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 30px 15px !important; } }
            `}</style>
        </section>
    );
};
