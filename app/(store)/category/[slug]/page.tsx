'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronDown, Heart, SlidersHorizontal, Loader2, Package } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { CATEGORIES } from '@/lib/categories';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    category: string;
    categories?: string[];
    subcategory?: string;
    featuredImage: string;
    variants: { key: string }[];
    status: string;
    isVisible: boolean;
    currency?: string;
}

const DISPLAY_CATEGORIES = CATEGORIES;

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const categoryName = slug ? (slug.charAt(0).toUpperCase() + slug.slice(1)) : 'Category';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortOpen, setSortOpen] = useState(false);
    const [sort, setSort] = useState('Latest');
    const { addItem } = useCart();

    const fetchProducts = useCallback(async () => {
        if (!slug) return;

        setLoading(true);
        setError(null);
        try {
            // Fetch products filtered by this category/tag
            let queryUrl = `/api/products?limit=100&category=${encodeURIComponent(slug)}`;

            const response = await fetch(queryUrl);
            if (!response.ok) throw new Error('Failed to fetch products');
            const data = await response.json();

            setProducts(data.data?.products || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Sort products
    const sortedProducts = [...products].sort((a, b) => {
        switch (sort) {
            case 'Price: Low':
                return a.price - b.price;
            case 'Price: High':
                return b.price - a.price;
            case 'Popular':
                return 0;
            default:
                return 0; // Latest
        }
    });

    const handleQuickAdd = (product: Product) => {
        addItem({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.featuredImage,
            currency: product.currency || 'USD'
        });
    };

    return (
        <div style={{ background: '#fff', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 32px' }}>
                <section style={{ paddingTop: '160px', paddingBottom: '120px' }}>
                    {/* Header Section */}
                    <div style={{ marginBottom: '60px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: 'var(--af-gray-text, #6e6e73)', fontWeight: 500, letterSpacing: '0.02em' }}>
                            <Link href="/" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} className="hover:text-black">Home</Link>
                            <span>/</span>
                            <Link href="/products" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} className="hover:text-black">Products</Link>
                            <span>/</span>
                            <span style={{ color: 'var(--af-black, #000)' }}>{categoryName}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <h1 style={{
                                    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                                    fontWeight: 700,
                                    letterSpacing: '-0.03em',
                                    margin: '0 0 16px 0',
                                    textTransform: 'capitalize',
                                    color: 'var(--af-black, #000)',
                                    lineHeight: 1.1
                                }}>
                                    {categoryName}
                                </h1>
                                <p style={{ fontSize: '1.1rem', color: 'var(--af-gray-text, #6e6e73)', margin: 0, maxWidth: '500px' }}>
                                    Explore our curated collection of premium {categoryName.toLowerCase()}.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{
                                    padding: '8px 16px',
                                    background: 'var(--af-gray-light, #f5f5f7)',
                                    borderRadius: '30px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: 'var(--af-black, #000)'
                                }}>
                                    {sortedProducts.length} Items
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={() => setSortOpen(!sortOpen)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            color: 'var(--af-black, #000)'
                                        }}
                                    >
                                        {sort} <ChevronDown size={14} style={{ transform: sortOpen ? 'rotate(180deg)' : '', transition: '0.2s' }} />
                                    </button>
                                    {sortOpen && (
                                        <div style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 10px)',
                                            right: 0,
                                            background: '#fff',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                            borderRadius: '16px',
                                            padding: '8px',
                                            zIndex: 50,
                                            minWidth: '160px',
                                            border: '1px solid rgba(0,0,0,0.05)'
                                        }}>
                                            {['Latest', 'Price: Low', 'Price: High'].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => { setSort(s); setSortOpen(false); }}
                                                    style={{
                                                        display: 'block',
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        background: sort === s ? 'var(--af-gray-light, #f5f5f7)' : 'none',
                                                        border: 'none',
                                                        textAlign: 'left',
                                                        fontSize: '13px',
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                        borderRadius: '10px',
                                                        color: sort === s ? 'var(--af-black, #000)' : 'var(--af-gray-text, #6e6e73)',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                            <Loader2 size={40} style={{ animation: 'af-spin 1s linear infinite', marginBottom: '16px', color: 'var(--af-black, #000)' }} />
                            <p style={{ color: 'var(--af-gray-text, #6e6e73)', fontSize: '14px', fontWeight: 500 }}>Loading collection...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#fef2f2', borderRadius: '24px', color: '#991b1b' }}>
                            <p style={{ fontWeight: 600 }}>{error}</p>
                            <button onClick={fetchProducts} style={{ marginTop: '16px', padding: '12px 24px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>Try Again</button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && sortedProducts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '120px 20px', backgroundColor: 'var(--af-gray-light, #f5f5f7)', borderRadius: '32px' }}>
                            <Package size={56} style={{ color: 'var(--af-gray-text, #6e6e73)', marginBottom: '20px', opacity: 0.5 }} />
                            <h3 style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '1.2rem' }}>No products found</h3>
                            <p style={{ color: 'var(--af-gray-text, #6e6e73)', margin: 0, fontSize: '0.95rem' }}>We couldn&apos;t find any products in this collection.</p>
                        </div>
                    )}

                    {/* Visual Grid */}
                    {!loading && !error && sortedProducts.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '40px 32px'
                        }}>
                            {sortedProducts.map((product) => (
                                <div key={product.id} className="af-product-card">
                                    <Link href={`/product/${product.slug || product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                                        <div className="af-product-image-wrap">
                                            <img
                                                src={product.featuredImage || 'https://via.placeholder.com/600?text=Product'}
                                                alt={product.name}
                                                className="af-product-img"
                                            />

                                            <button
                                                onClick={(e) => { e.preventDefault(); /* Add logic */ }}
                                                className="af-wishlist-btn"
                                            >
                                                <Heart size={18} />
                                            </button>

                                            {product.compareAtPrice && product.price && product.compareAtPrice > product.price && (
                                                <div className="af-discount-badge">
                                                    {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ padding: '20px 4px 0 4px' }}>
                                            <h3 className="af-product-title">
                                                {product.name}
                                            </h3>
                                            <p style={{ fontSize: '13px', color: 'var(--af-gray-text, #6e6e73)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                                                {product.category}
                                            </p>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--af-black, #000)', letterSpacing: '-0.02em' }}>
                                                        {product.currency === 'USD'
                                                            ? `₹${(product.price * 85).toLocaleString('en-IN')}`
                                                            : (product.price ? `₹${product.price.toLocaleString('en-IN')}` : 'Unavailable')}
                                                    </span>
                                                    {product.compareAtPrice && product.price && product.compareAtPrice > product.price && (
                                                        <span style={{ fontSize: '13px', color: 'var(--af-gray-text, #888)', textDecoration: 'line-through', marginTop: '2px' }}>
                                                            {product.currency === 'USD'
                                                                ? `₹${(product.compareAtPrice * 85).toLocaleString('en-IN')}`
                                                                : `₹${product.compareAtPrice.toLocaleString('en-IN')}`}
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={(e) => { e.preventDefault(); handleQuickAdd(product); }}
                                                    className="af-quick-add-btn"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <style jsx global>{`
                .af-product-card {
                    group: 1;
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .af-product-card:hover {
                    transform: translateY(-8px);
                }
                .af-product-image-wrap {
                    aspect-ratio: 1;
                    background-color: var(--af-gray-light, #f5f5f7);
                    border-radius: 24px;
                    overflow: hidden;
                    position: relative;
                    isolation: isolate;
                }
                .af-product-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                    mix-blend-mode: multiply;
                }
                .af-product-card:hover .af-product-img {
                    transform: scale(1.08);
                }
                .af-wishlist-btn {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(0,0,0,0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    opacity: 0;
                    transform: translateY(-10px);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 5;
                }
                .af-product-card:hover .af-wishlist-btn {
                    opacity: 1;
                    transform: translateY(0);
                }
                .af-wishlist-btn:hover {
                    background: var(--af-black, #000);
                    color: #fff;
                }
                .af-discount-badge {
                    position: absolute;
                    top: 16px;
                    left: 16px;
                    padding: 6px 14px;
                    background: var(--af-black, #000);
                    color: #fff;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    z-index: 5;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .af-product-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0 0 6px 0;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    color: var(--af-black, #000);
                }
                .af-quick-add-btn {
                    padding: 8px 24px;
                    background: var(--af-black, #000);
                    color: #fff;
                    border: none;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    opacity: 0;
                    transform: translateX(10px);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .af-product-card:hover .af-quick-add-btn {
                    opacity: 1;
                    transform: translateX(0);
                }
                .af-quick-add-btn:hover {
                    background: #333;
                    transform: scale(1.05) translateX(0) !important;
                }
                @keyframes af-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
