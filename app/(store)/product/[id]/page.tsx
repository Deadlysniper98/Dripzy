'use client';

import { useCart } from '@/context/CartContext';
import { useState, useEffect, use } from 'react';
import { Heart, Star, ChevronRight, ChevronLeft, ChevronDown, Minus, Plus, Loader2, Package, ShieldCheck, Truck, RefreshCw, Play, Box } from 'lucide-react';
import Link from 'next/link';
import { useCurrency } from '@/context/CurrencyContext';

interface Product {
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    description: string;
    category: string;
    featuredImage: string;
    images: { id: string; url: string; alt: string; position: number }[];
    variants: { id: string; name: string; sku: string; price: number; stock: number; image?: string; key?: string }[];
    status: string;
    slug: string;
    currency?: string;
    videoUrl?: string;
    glbUrl?: string;
    prices?: { USD?: number; INR?: number };
    compareAtPrices?: { USD?: number; INR?: number };
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { addItem } = useCart();
    const { formatPrice, formatProductPrice } = useCurrency();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [imgIdx, setImgIdx] = useState(0);
    const [qty, setQty] = useState(1);
    const [liked, setLiked] = useState(false);
    const [open, setOpen] = useState({ description: true, shipping: false });
    const [selectedVariant, setSelectedVariant] = useState<any>(null);

    useEffect(() => {
        if (product && product.variants?.length > 0 && !selectedVariant) {
            setSelectedVariant(product.variants[0]);
        }
    }, [product]);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/products/${id}`);
                const data = await res.json();
                if (data.success) {
                    setProduct(data.data);
                    // Fetch related products
                    const category = data.data.category;
                    const res = await fetch(`/api/products?${category ? `category=${category}&` : ''}limit=8&status=active`);
                    const relData = await res.json();

                    if (relData.success) {
                        let filtered = relData.data.products.filter((p: any) => p.id !== data.data.id && p.isVisible !== false);

                        // Fallback if not enough category products - fetch all products
                        if (filtered.length < 4) {
                            const fallbackRes = await fetch(`/api/products?limit=20`);
                            const fallbackData = await fallbackRes.json();
                            if (fallbackData.success) {
                                const fallbackFiltered = fallbackData.data.products.filter((p: any) =>
                                    p.id !== data.data.id &&
                                    p.isVisible !== false &&
                                    (p.status === 'active' || !p.status) &&
                                    !filtered.find((fp: any) => fp.id === p.id)
                                );
                                filtered = [...filtered, ...fallbackFiltered];
                            }
                        }
                        setRelatedProducts(filtered.slice(0, 4));
                    }
                } else {
                    setError(data.error || 'Product not found');
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to load product');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Slider logic for description images
    useEffect(() => {
        if (!product || loading) return;

        const timer = setTimeout(() => {
            const container = document.querySelector('.product-description-content');
            if (!container) return;

            // Find all images that are siblings or nested in single-child paragraphs
            const images = Array.from(container.querySelectorAll('img'));
            if (images.length < 2) return;

            // Group images that are close to each other
            const sliderWrapper = document.createElement('div');
            sliderWrapper.className = 'desc-image-slider';

            // To be simple, we'll wrap ALL images in a slider if there are many
            images.forEach(img => {
                const item = document.createElement('div');
                item.className = 'slider-item';
                const clone = img.cloneNode(true) as HTMLImageElement;
                item.appendChild(clone);
                sliderWrapper.appendChild(item);
                // Hide original
                (img.parentElement?.tagName === 'P' && img.parentElement.children.length === 1)
                    ? img.parentElement.style.display = 'none'
                    : img.style.display = 'none';
            });

            // Insert slider before the first image's parent
            const firstImg = images[0];
            const target = (firstImg.parentElement?.tagName === 'P' && firstImg.parentElement.children.length === 1)
                ? firstImg.parentElement
                : firstImg;

            target.parentNode?.insertBefore(sliderWrapper, target);
        }, 500);

        return () => clearTimeout(timer);
    }, [product, loading]);

    const handleAdd = (buyNow = false) => {
        if (!product) return;
        setAdding(true);

        const cartItem = {
            id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
            productId: product.id,
            variantId: selectedVariant?.id,
            variantName: selectedVariant?.name || selectedVariant?.key,
            name: selectedVariant ? `${product.name} - ${selectedVariant.name || selectedVariant.key}` : product.name,
            price: selectedVariant ? selectedVariant.price : product.price,
            image: selectedVariant?.image || product.featuredImage || product.images?.[0]?.url,
            currency: product.currency || 'USD'
        };

        for (let i = 0; i < qty; i++) {
            addItem(cartItem);
        }

        setTimeout(() => {
            setAdding(false);
            if (buyNow) window.location.href = '/cart';
        }, 600);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#000' }} />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
                <Package size={64} style={{ color: '#ccc', marginBottom: '24px' }} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>{error || 'Product Not Found'}</h1>
                <p style={{ color: '#666', marginBottom: '24px' }}>The product you're looking for might have been removed or moved.</p>
                <Link href="/products" style={{ padding: '12px 32px', backgroundColor: '#000', color: '#fff', borderRadius: '50px', textDecoration: 'none', fontWeight: 600 }}>Browse Products</Link>
            </div>
        );
    }

    const allImages = product.images?.length > 0 ? product.images.map(img => img.url) : [product.featuredImage];
    const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;

    const mediaItems = [
        ...allImages.map(url => ({ type: 'image', url })),
        ...(product.videoUrl ? [{ type: 'video', url: product.videoUrl }] : []),
        ...(product.glbUrl ? [{ type: 'glb', url: product.glbUrl }] : [])
    ];

    return (
        <div style={{ background: '#fff', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
                <section style={{ paddingTop: '140px', paddingBottom: '80px' }}>
                    {/* Breadcrumbs */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontSize: '0.85rem', color: '#888' }}>
                        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
                        <ChevronRight size={14} />
                        <Link href="/products" style={{ color: '#888', textDecoration: 'none' }}>Products</Link>
                        <ChevronRight size={14} />
                        <span style={{ color: '#000' }}>{product.category}</span>
                    </div>

                    <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) 1fr', gap: '64px' }}>
                        {/* Gallery */}
                        <div style={{ display: 'flex', gap: '20px' }}>
                            {mediaItems.length > 1 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '80px' }}>
                                    {mediaItems.map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setImgIdx(i)}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                border: imgIdx === i ? '2px solid #000' : '1px solid #eee',
                                                padding: 0,
                                                cursor: 'pointer',
                                                backgroundColor: '#f5f5f7',
                                                position: 'relative'
                                            }}
                                        >
                                            {item.type === 'image' && <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                            {item.type === 'video' && (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
                                                    <Play size={20} color="#fff" fill="#fff" />
                                                </div>
                                            )}
                                            {item.type === 'glb' && (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
                                                    <Box size={20} color="#000" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className="main-image-container" style={{ flex: 1, position: 'relative', height: 'fit-content', minHeight: '500px', maxHeight: '700px', borderRadius: '24px', overflow: 'hidden', background: '#f5f5f7' }}>
                                {mediaItems[imgIdx]?.type === 'image' && (
                                    <img src={mediaItems[imgIdx].url} alt={product.name} style={{ width: '100%', height: '100%', maxHeight: '700px', objectFit: 'contain' }} />
                                )}
                                {mediaItems[imgIdx]?.type === 'video' && (
                                    <video
                                        src={mediaItems[imgIdx].url}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        controls
                                        style={{ width: '100%', height: '100%', maxHeight: '700px', objectFit: 'contain', backgroundColor: '#000' }}
                                    />
                                )}
                                {mediaItems[imgIdx]?.type === 'glb' && (
                                    <div style={{ width: '100%', height: '100%', minHeight: '500px', backgroundColor: '#f5f5f7' }}>
                                        {/* @ts-ignore */}
                                        <model-viewer
                                            src={mediaItems[imgIdx].url}
                                            camera-controls
                                            auto-rotate
                                            shadow-intensity="1"
                                            style={{ width: '100%', height: '100%', minHeight: '500px' }}
                                            ar
                                        /* @ts-ignore */
                                        ></model-viewer>
                                    </div>
                                )}
                                {discount > 0 && (
                                    <div style={{ position: 'absolute', top: '20px', left: '20px', padding: '6px 14px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, zIndex: 10 }}>
                                        {discount}% OFF
                                    </div>
                                )}
                                <button onClick={() => setLiked(!liked)} style={{ position: 'absolute', bottom: '20px', right: '20px', width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 }}>
                                    <Heart size={20} fill={liked ? '#f00' : 'none'} color={liked ? '#f00' : '#000'} />
                                </button>
                            </div>
                        </div>

                        {/* Info */}
                        <div>
                            <span style={{ fontSize: '0.9rem', color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.category}</span>
                            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, margin: '12px 0 16px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{product.name}</h1>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '32px' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 700 }}>{formatProductPrice(product)}</span>
                                {product.compareAtPrice && product.compareAtPrice > product.price && (
                                    <span style={{ fontSize: '1.25rem', color: '#888', textDecoration: 'line-through' }}>{formatProductPrice(product, 'compareAtPrice')}</span>
                                )}
                            </div>

                            <div style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', border: '1px solid #eee', borderRadius: '16px' }}>
                                    <ShieldCheck size={20} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Safe Payments</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', border: '1px solid #eee', borderRadius: '16px' }}>
                                    <Truck size={20} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Fast Shipping</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '16px', border: '1px solid #eee', borderRadius: '16px' }}>
                                    <RefreshCw size={20} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Easy Returns</span>
                                </div>
                            </div>

                            {/* Variants Selection */}
                            {(product.variants && product.variants.length > 0) && (
                                <div style={{ marginBottom: '32px' }}>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Select Option</span>
                                        {selectedVariant && <span style={{ color: '#666', fontWeight: 400 }}>{selectedVariant.name || selectedVariant.key}</span>}
                                    </h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {product.variants.map((v, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setSelectedVariant(v);
                                                    if (v.image) {
                                                        const imgIdx = allImages.findIndex(url => url === v.image);
                                                        if (imgIdx !== -1) setImgIdx(imgIdx);
                                                    }
                                                }}
                                                style={{
                                                    padding: '12px 20px',
                                                    borderRadius: '12px',
                                                    border: selectedVariant?.id === v.id ? '2px solid #000' : '1px solid #eee',
                                                    backgroundColor: selectedVariant?.id === v.id ? '#000' : '#fff',
                                                    color: selectedVariant?.id === v.id ? '#fff' : '#000',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                {v.image && <img src={v.image} style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} />}
                                                {v.name || v.key}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>Quantity</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '50px', padding: '4px' }}>
                                        <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={16} /></button>
                                        <span style={{ fontSize: '1rem', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>{qty}</span>
                                        <button onClick={() => setQty(qty + 1)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={16} /></button>
                                    </div>
                                    <span style={{ color: '#059669', fontSize: '0.9rem', fontWeight: 500 }}>In Stock (Delivery in 5-7 days)</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
                                <button
                                    onClick={() => handleAdd(true)}
                                    style={{ flex: 1.5, padding: '18px', background: '#000', color: '#fff', borderRadius: '50px', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                                >
                                    {adding ? 'Processing...' : 'Buy Now'}
                                </button>
                                <button
                                    onClick={() => handleAdd(false)}
                                    style={{ flex: 1, padding: '18px', background: '#fff', color: '#000', borderRadius: '50px', fontWeight: 600, border: '2px solid #000', cursor: 'pointer', fontSize: '1rem' }}
                                >
                                    Add to Cart
                                </button>
                            </div>

                            {/* Collapsibles */}
                            <div style={{ borderTop: '1px solid #f0f0f0' }}>
                                {Object.entries(open).map(([key, isOpen]) => (
                                    <div key={key}>
                                        <button
                                            onClick={() => setOpen({ ...open, [key]: !isOpen })}
                                            style={{ width: '100%', padding: '20px 0', display: 'flex', justifyContent: 'space-between', background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, textTransform: 'capitalize' }}
                                        >
                                            {key} <ChevronDown size={20} style={{ transform: isOpen ? 'rotate(180deg)' : '', transition: '0.3s' }} />
                                        </button>
                                        {isOpen && (
                                            <div style={{ padding: '20px 0', color: '#555', fontSize: '0.95rem', lineHeight: 1.7 }}>
                                                {key === 'description' ? (
                                                    <div className="product-description-content" dangerouslySetInnerHTML={{ __html: product.description }} />
                                                ) : (
                                                    <div style={{ whiteSpace: 'pre-line' }}>Standard delivery takes 5-7 business days. Express shipping available at checkout. 7-day hassle-free returns.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                {/* Related Products */}
                <section style={{ paddingBottom: '80px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>You May Also Like</h2>
                    {relatedProducts.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
                            {relatedProducts.slice(0, 4).map(item => (
                                <Link key={item.id} href={`/product/${item.slug || item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ aspectRatio: '1', background: '#f5f5f7', borderRadius: '16px', overflow: 'hidden', marginBottom: '16px' }}>
                                        <img src={item.featuredImage || item.images?.[0]?.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
                                    </div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</h3>
                                    <p style={{ fontWeight: 600 }}>{formatPrice(item.price, (item.currency as any) || 'USD')}</p>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <Link href="/products" style={{ textDecoration: 'none' }}>
                            <div style={{
                                padding: '48px 40px',
                                textAlign: 'center',
                                backgroundColor: '#f9fafb',
                                borderRadius: '16px',
                                color: '#666',
                                transition: 'all 0.2s',
                                border: '1px solid transparent'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f0f0f5';
                                    e.currentTarget.style.borderColor = '#e0e0e0';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                    e.currentTarget.style.borderColor = 'transparent';
                                }}
                            >
                                <p style={{ fontSize: '1rem', marginBottom: '8px' }}>Discover more products</p>
                                <span style={{ color: '#000', fontWeight: 600 }}>Browse All Products →</span>
                            </div>
                        </Link>
                    )}
                </section>
            </div>
            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @media (max-width: 1024px) {
                    .product-grid {
                        grid-template-columns: 1fr !important;
                        gap: 40px !important;
                    }
                    .main-image-container {
                        max-height: 550px !important;
                    }
                    .desc-image-slider {
                        margin: 40px -24px;
                        padding: 0 24px 20px;
                    }
                    .slider-item {
                        flex: 0 0 75%; /* Better peek for iPad */
                    }
                }

                /* iPad & Tablets (Portrait) */
                @media (min-width: 768px) and (max-width: 1024px) {
                    .product-grid {
                        padding: 0 40px;
                    }
                }

                /* Phones */
                @media (max-width: 640px) {
                    section {
                        padding-top: 100px !important;
                    }
                    .main-image-container {
                        max-height: 400px !important;
                        border-radius: 16px !important;
                    }
                    .slider-item {
                        flex: 0 0 88%; /* Larger view for phones */
                    }
                    h1 {
                        font-size: 1.8rem !important;
                    }
                }

                /* Desktop (Extra Large) */
                @media (min-width: 1440px) {
                    .desc-image-slider {
                        margin: 50px 0;
                    }
                    .slider-item {
                        flex: 0 0 45%; /* Show more on big screens */
                    }
                }

                /* Product Description Content Styling */
                .product-description-content {
                    color: #4b5563;
                    line-height: 1.8;
                }
                .product-description-content img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin: 32px auto;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                    transition: transform 0.3s ease;
                }
                
                /* Horizontal Slider for Description Images */
                .desc-image-slider {
                    display: flex;
                    gap: 16px;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    margin: 40px -24px;
                    padding: 0 24px 20px;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                }
                .desc-image-slider::-webkit-scrollbar {
                    display: none;
                }
                .slider-item {
                    flex: 0 0 85%;
                    scroll-snap-align: center;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    background: #f5f5f7;
                }
                .slider-item img {
                    width: 100%;
                    height: auto;
                    margin: 0 !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                }
                @media (min-width: 768px) {
                    .slider-item {
                        flex: 0 0 60%;
                    }
                    .desc-image-slider {
                        margin: 40px 0;
                        padding: 0 0 20px;
                    }
                }
                .product-description-content img:hover {
                    transform: translateY(-4px);
                }
                .product-description-content p {
                    margin-bottom: 1.5rem;
                }
                .product-description-content h1, 
                .product-description-content h2, 
                .product-description-content h3 {
                    color: #111827;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                    font-weight: 700;
                }
                .product-description-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 24px 0;
                    font-size: 0.9rem;
                }
                .product-description-content td {
                    padding: 12px;
                    border: 1px solid #eee;
                }
                .product-description-content iframe,
                .product-description-content video {
                    width: 100%;
                    aspect-ratio: 16/9;
                    border-radius: 16px;
                    margin: 24px 0;
                }
            `}</style>
        </div>
    );
}
