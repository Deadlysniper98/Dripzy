'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, ChevronDown, Heart, SlidersHorizontal, Loader2, Package } from 'lucide-react';
import { useState, useEffect, useCallback, Suspense } from 'react';
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

const DISPLAY_CATEGORIES = ['All', ...CATEGORIES];

function ProductsContent() {
    const searchParams = useSearchParams();
    const urlCategory = searchParams.get('cat');

    // Initialize category from URL if present, otherwise 'All'
    const [category, setCategory] = useState(urlCategory || 'All');

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortOpen, setSortOpen] = useState(false);
    const [sort, setSort] = useState('Latest');
    const { addItem } = useCart();

    // Update category when URL changes
    useEffect(() => {
        if (urlCategory) {
            setCategory(urlCategory);
        } else {
            setCategory('All');
        }
    }, [urlCategory]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let queryUrl = '/api/products?limit=100';
            if (category !== 'All') {
                queryUrl += `&category=${encodeURIComponent(category)}`;
            }

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
    }, [category]);

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
                return 0; // Would need popularity data
            default:
                return 0; // Latest - keep original order
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

    // Get variant colors count
    const getVariantText = (product: Product) => {
        const count = product.variants?.length || 1;
        return count === 1 ? '1 Variant' : `${count} Variants`;
    };

    return (
        <div style={{ background: '#fafafa', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
                <section style={{ paddingTop: '140px', paddingBottom: '80px' }}>
                    {/* Breadcrumb */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '0.85rem', color: '#888' }}>
                        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Home page</Link>
                        <span>→</span>
                        <span style={{ color: '#000', textTransform: 'capitalize' }}>{category === 'All' ? 'All Products' : category}</span>
                    </div>

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 600, letterSpacing: '-0.02em', margin: 0, textTransform: 'capitalize' }}>
                            {category === 'All' ? 'All Products' : category}
                        </h1>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '4px' }}>Shop our collection</p>
                            <p style={{ fontWeight: 600 }}>— {sortedProducts.length} results</p>
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
                            {DISPLAY_CATEGORIES.map(cat => (
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

                    {/* Loading State */}
                    {loading && (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px 20px',
                            color: '#888'
                        }}>
                            <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
                            <p>Loading products...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px 20px',
                            backgroundColor: '#fef2f2',
                            borderRadius: '16px',
                            color: '#991b1b'
                        }}>
                            <p style={{ fontWeight: 500 }}>{error}</p>
                            <button
                                onClick={fetchProducts}
                                style={{
                                    marginTop: '16px',
                                    padding: '12px 24px',
                                    backgroundColor: '#000',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer'
                                }}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && !error && sortedProducts.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px 20px',
                            backgroundColor: '#f5f5f7',
                            borderRadius: '16px'
                        }}>
                            <Package size={48} style={{ color: '#888', marginBottom: '16px' }} />
                            <h3 style={{ margin: '0 0 8px', fontWeight: 600 }}>No products found</h3>
                            <p style={{ color: '#888', margin: 0 }}>
                                {category !== 'All'
                                    ? `No products in the "${category}" category yet.`
                                    : 'Products are being added to the store. Check back soon!'}
                            </p>
                        </div>
                    )}

                    {/* Product Grid */}
                    {!loading && !error && sortedProducts.length > 0 && (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', // Responsive grid
                            gap: '32px'
                        }}>
                            {sortedProducts.map((product) => (
                                <div key={product.id} style={{ position: 'relative' }}>
                                    <Link href={`/product/${product.slug || product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{
                                            aspectRatio: '1',
                                            backgroundColor: '#f0f0f0',
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            marginBottom: '16px',
                                            position: 'relative',
                                            isolation: 'isolate' // Fixes safari overflow issues
                                        }}>
                                            <img
                                                src={product.featuredImage || 'https://via.placeholder.com/600?text=Product'}
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
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                    zIndex: 2
                                                }}
                                            >
                                                <Heart size={18} />
                                            </button>

                                            {/* Compare At Price Badge */}
                                            {product.compareAtPrice && product.price && product.compareAtPrice > product.price && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    left: '12px',
                                                    padding: '4px 10px',
                                                    backgroundColor: '#ef4444',
                                                    color: '#fff',
                                                    borderRadius: '50px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    zIndex: 2
                                                }}>
                                                    {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    <h3 style={{
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        marginBottom: '4px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {product.name}
                                    </h3>
                                    <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '2px' }}>{product.category}</p>
                                    <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>{getVariantText(product)}</p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontWeight: 600 }}>
                                                {/* Simple currency conversion display for now (assuming 1 USD = 85 INR if currency is USD) */}
                                                {product.currency === 'USD'
                                                    ? `₹${(product.price * 85).toLocaleString('en-IN')}`
                                                    : (product.price ? `₹${product.price.toLocaleString('en-IN')}` : 'Price unavailable')}
                                            </span>
                                            {product.compareAtPrice && product.price && product.compareAtPrice > product.price && (
                                                <span style={{
                                                    marginLeft: '8px',
                                                    fontSize: '0.85rem',
                                                    color: '#888',
                                                    textDecoration: 'line-through'
                                                }}>
                                                    {product.currency === 'USD'
                                                        ? `₹${(product.compareAtPrice * 85).toLocaleString('en-IN')}`
                                                        : `₹${product.compareAtPrice.toLocaleString('en-IN')}`}
                                                </span>
                                            )}
                                        </div>
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
                    )}
                </section>
            </div>

            <style>{`
                .product-img:hover { transform: scale(1.05); }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
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

export default function ProductsPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px' }}><Loader2 size={40} className="animate-spin" /></div>}>
            <ProductsContent />
        </Suspense>
    );
}
