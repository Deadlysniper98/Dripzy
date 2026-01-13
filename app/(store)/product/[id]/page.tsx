'use client';

import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { Heart, Star, ChevronRight, ChevronLeft, ChevronDown, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

const PRODUCTS: Record<string, any> = {
    '1': { id: '1', name: 'MagSafe Wireless Charger', price: 2999, originalPrice: 3999, category: 'Chargers', rating: 4.5, reviews: 2543, tags: ['Fast Charging', 'MagSafe'], description: 'Premium MagSafe Wireless Charger with 15W fast charging.', images: ['https://images.unsplash.com/photo-1625591340248-6d2894ebd784?q=80&w=800', 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=800'], features: ['Magnetic alignment', '15W charging', 'USB-C cable'] },
    '2': { id: '2', name: 'iPhone 15 Pro Max Case', price: 4500, category: 'Cases', rating: 4.8, reviews: 1876, tags: ['MagSafe', 'Military Grade'], description: 'Ultra-slim protective case with MagSafe compatibility.', images: ['https://images.unsplash.com/photo-1603539947673-c6eb2934808f?q=80&w=800'], features: ['MagSafe compatible', 'Military protection'], sizes: ['iPhone 15', 'iPhone 15 Pro', 'iPhone 15 Pro Max'] },
    '3': { id: '3', name: 'USB-C Fast Charger 30W', price: 1999, category: 'Chargers', rating: 4.3, reviews: 987, tags: ['GaN', 'Compact'], description: 'Compact 30W GaN charger for all devices.', images: ['https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=800'], features: ['GaN technology', '30W output'] },
    '4': { id: '4', name: 'iPad Air Folio Case', price: 5999, category: 'Cases', rating: 4.6, reviews: 654, tags: ['Premium', 'Multi-Angle'], description: 'Premium folio case with auto sleep/wake.', images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=800'], features: ['Auto sleep/wake', 'Multi-angle stand'] },
    '5': { id: '5', name: 'Noise Cancelling Headphones', price: 29999, originalPrice: 34999, category: 'Audio', rating: 4.9, reviews: 3421, tags: ['Hi-Res', 'ANC'], description: 'Flagship headphones with adaptive ANC.', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800'], features: ['Adaptive ANC', '40-hour battery'] },
    '6': { id: '6', name: 'Braided Lightning Cable', price: 1499, category: 'Cables', rating: 4.4, reviews: 2156, tags: ['MFi Certified', 'Durable'], description: 'Ultra-durable braided cable with MFi certification.', images: ['https://images.unsplash.com/photo-1572569028738-411a561109dc?q=80&w=800'], features: ['MFi certified', '2m length'] },
    '7': { id: '7', name: 'Power Bank 20000mAh', price: 3499, category: 'Power', rating: 4.5, reviews: 1234, tags: ['High Capacity'], description: 'High-capacity power bank with fast charging.', images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=800'], features: ['20000mAh', 'USB-C PD'] },
    '8': { id: '8', name: 'Wireless Earbuds Pro', price: 12999, category: 'Audio', rating: 4.7, reviews: 2876, tags: ['ANC', 'IPX5'], description: 'Premium earbuds with active noise cancellation.', images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800'], features: ['Active ANC', '32-hour battery'] },
};

const RELATED = [
    { id: '3', name: 'USB-C Charger', price: 1999, image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=400' },
    { id: '6', name: 'Lightning Cable', price: 1499, image: 'https://images.unsplash.com/photo-1572569028738-411a561109dc?q=80&w=400' },
    { id: '7', name: 'Power Bank', price: 3499, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=400' },
    { id: '8', name: 'Earbuds Pro', price: 12999, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=400' },
];

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const product = PRODUCTS[id] || PRODUCTS['1'];
    const { addItem } = useCart();
    const [adding, setAdding] = useState(false);
    const [imgIdx, setImgIdx] = useState(0);
    const [qty, setQty] = useState(1);
    const [size, setSize] = useState(product.sizes?.[0] || '');
    const [liked, setLiked] = useState(false);
    const [open, setOpen] = useState({ reviews: false, shipping: false });

    const add = () => { setAdding(true); for (let i = 0; i < qty; i++) addItem({ id: product.id, name: product.name, price: product.price, image: product.images[0] }); setTimeout(() => setAdding(false), 800); };

    return (
        <div style={{ background: '#fff', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
                <section style={{ paddingTop: '140px', paddingBottom: '40px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', fontSize: '0.85rem', color: '#888' }}>
                        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
                        <ChevronRight size={14} />
                        <Link href="/products" style={{ color: '#888', textDecoration: 'none' }}>{product.category}</Link>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 500px) 1fr', gap: '48px' }}>
                        <div>
                            <div style={{ position: 'relative', aspectRatio: '1', borderRadius: '16px', overflow: 'hidden', background: '#f5f5f7', marginBottom: '16px' }}>
                                <img src={product.images[imgIdx]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {product.images.length > 1 && <>
                                    <button onClick={() => setImgIdx((imgIdx - 1 + product.images.length) % product.images.length)} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}><ChevronLeft size={18} /></button>
                                    <button onClick={() => setImgIdx((imgIdx + 1) % product.images.length)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '36px', height: '36px', borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}><ChevronRight size={18} /></button>
                                </>}
                            </div>
                            {product.images.length > 1 && <div style={{ display: 'flex', gap: '10px' }}>{product.images.map((img: string, i: number) => <button key={i} onClick={() => setImgIdx(i)} style={{ width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden', border: imgIdx === i ? '2px solid #000' : '2px solid transparent', padding: 0, cursor: 'pointer', background: '#f5f5f7' }}><img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></button>)}</div>}
                        </div>

                        <div>
                            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: '12px', letterSpacing: '-0.02em' }}>{product.name}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', gap: '3px' }}>{[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < Math.floor(product.rating) ? '#000' : 'none'} stroke="#000" />)}</div>
                                <span style={{ fontSize: '0.9rem', color: '#666' }}>{product.reviews.toLocaleString()} Reviews</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>{product.tags.map((t: string, i: number) => <span key={i} style={{ padding: '6px 12px', borderRadius: '50px', border: '1px solid #e0e0e0', fontSize: '0.8rem' }}>{t}</span>)}</div>
                            <p style={{ color: '#555', lineHeight: 1.6, marginBottom: '20px', fontSize: '0.95rem' }}>{product.description}</p>

                            {product.sizes && <div style={{ marginBottom: '20px' }}><h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '10px' }}>Select Model</h3><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{product.sizes.map((s: string) => <button key={s} onClick={() => setSize(s)} style={{ padding: '10px 14px', borderRadius: '50px', border: size === s ? '2px solid #000' : '1px solid #e0e0e0', background: size === s ? '#000' : '#fff', color: size === s ? '#fff' : '#000', fontSize: '0.85rem', cursor: 'pointer' }}>{s}</button>)}</div></div>}

                            <div style={{ marginBottom: '20px' }}><h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '10px' }}>Quantity</h3><div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={14} /></button><span style={{ fontSize: '1rem', fontWeight: 500, minWidth: '32px', textAlign: 'center' }}>{qty}</span><button onClick={() => setQty(qty + 1)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #000', background: '#000', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} /></button></div></div>

                            <div style={{ marginBottom: '16px' }}><span style={{ fontSize: '1.8rem', fontWeight: 700 }}>₹{(product.price * qty).toLocaleString('en-IN')}</span>{product.originalPrice && <span style={{ marginLeft: '10px', fontSize: '1.1rem', color: '#888', textDecoration: 'line-through' }}>₹{(product.originalPrice * qty).toLocaleString('en-IN')}</span>}</div>

                            {product.originalPrice && <div style={{ padding: '14px', background: '#f5f5f7', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem' }}><strong>{Math.round((1 - product.price / product.originalPrice) * 100)}% Off</strong> - Limited time offer</div>}

                            <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
                                <button onClick={add} style={{ flex: 1, padding: '14px', background: '#000', color: '#fff', borderRadius: '50px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>{adding ? '✓ Added!' : 'Buy Now'}</button>
                                <button onClick={add} style={{ flex: 1, padding: '14px', background: '#fff', color: '#000', borderRadius: '50px', fontWeight: 600, border: '1px solid #000', cursor: 'pointer' }}>Add To Cart</button>
                                <button onClick={() => setLiked(!liked)} style={{ width: '52px', borderRadius: '50%', border: '1px solid #e0e0e0', background: liked ? '#fee' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><Heart size={20} fill={liked ? '#f00' : 'none'} color={liked ? '#f00' : '#000'} /></button>
                            </div>

                            <div style={{ borderTop: '1px solid #f0f0f0' }}>
                                {['reviews', 'shipping'].map(sec => <div key={sec}><button onClick={() => setOpen({ ...open, [sec]: !open[sec as keyof typeof open] })} style={{ width: '100%', padding: '18px 0', display: 'flex', justifyContent: 'space-between', background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500, textTransform: 'capitalize' }}>{sec} <ChevronDown size={18} style={{ transform: open[sec as keyof typeof open] ? 'rotate(180deg)' : '', transition: '0.2s' }} /></button>{open[sec as keyof typeof open] && <div style={{ padding: '16px 0', color: '#666', fontSize: '0.9rem' }}>{sec === 'reviews' ? 'Reviews coming soon...' : 'Free Shipping: 5-7 days | Express: 2-3 days (₹99)'}</div>}</div>)}
                            </div>
                        </div>
                    </div>
                </section>

                <section style={{ paddingBottom: '80px' }}><h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>You May Also Like</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>{RELATED.filter(p => p.id !== product.id).slice(0, 4).map(item => <Link key={item.id} href={`/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}><div style={{ aspectRatio: '1', background: '#f5f5f7', borderRadius: '14px', overflow: 'hidden', marginBottom: '10px' }}><img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div><h3 style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '4px' }}>{item.name}</h3><p style={{ fontWeight: 600 }}>₹{item.price.toLocaleString('en-IN')}</p></Link>)}</div></section>
            </div>
        </div>
    );
}
