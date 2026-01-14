'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

interface BestSellersProps {
    featuredIds?: string[];
}

export const BestSellers = ({ featuredIds }: BestSellersProps) => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { formatPrice, formatProductPrice } = useCurrency();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let q;
                if (featuredIds && featuredIds.length > 0) {
                    q = query(collection(db, 'products'), where(documentId(), 'in', featuredIds.slice(0, 10)));
                } else {
                    // Try to fetch active products first
                    const activeQuery = query(collection(db, 'products'), where('status', '==', 'active'), limit(8));
                    const activeSnap = await getDocs(activeQuery);

                    if (activeSnap.empty) {
                        // If no active, just fetch the latest products
                        q = query(collection(db, 'products'), limit(8));
                    } else {
                        setProducts(activeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                        setLoading(false);
                        return;
                    }
                }
                const snapshot = await getDocs(q);
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProducts(items);
            } catch (error) {
                console.error('Error fetching featured products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [featuredIds]);

    if (loading) return null;
    if (products.length === 0) return null;

    return (
        <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '60px 24px', boxSizing: 'border-box' }}>
            <div style={{ marginBottom: '60px', borderBottom: '1px solid #efeff1', paddingBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, margin: 0, letterSpacing: '-0.05em', color: '#000', lineHeight: 1 }}>Best Sellers</h2>
                    <p style={{ color: '#6e6e73', margin: '15px 0 0 0', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Curated Collection</p>
                </div>
            </div>

            <div style={{ display: 'grid', gap: '50px 30px', gridTemplateColumns: 'repeat(4, 1fr)' }} className="product-grid">
                {products.map((product) => {
                    const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
                    return (
                        <Link key={product.id} href={`/product/${product.slug || product.id}`} style={{ background: '#fff', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'all 0.4s' }} className="product-card">
                            {discount > 0 && (
                                <div style={{ position: 'absolute', top: '15px', left: '15px', fontSize: '0.65rem', fontWeight: 700, background: '#000', color: 'white', padding: '6px 12px', borderRadius: '30px', zIndex: 5 }}>
                                    {discount}% OFF
                                </div>
                            )}

                            <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', width: '100%', borderRadius: '24px', background: '#f5f5f7' }}>
                                <img src={product.featuredImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 1s' }} className="product-image" />
                            </div>

                            <div style={{ padding: '20px 4px 0 4px' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.4, margin: '0 0 8px 0', color: '#000' }}>{product.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatProductPrice(product)}</span>
                                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                                        <span style={{ fontSize: '0.9rem', color: '#b0b0b0', textDecoration: 'line-through' }}>{formatProductPrice(product, 'compareAtPrice')}</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            <style jsx>{`
                .product-card:hover { transform: translateY(-8px); }
                .product-card:hover .product-image { transform: scale(1.08); }
                @media (max-width: 1024px) { .product-grid { grid-template-columns: repeat(3, 1fr) !important; } }
                @media (max-width: 768px) { .product-grid { grid-template-columns: repeat(2, 1fr) !important; } }
                @media (max-width: 480px) { .product-grid { grid-template-columns: 1fr !important; } }
            `}</style>
        </section>
    );
};
