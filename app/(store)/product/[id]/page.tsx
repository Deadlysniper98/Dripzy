'use client';

import { useCart } from '@/context/CartContext';
import { useState, useEffect, use } from 'react';
import { Heart, Star, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Minus, Plus, Loader2, Package, ShieldCheck, Truck, RefreshCw, Play, Box, Check, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCurrency } from '@/context/CurrencyContext';
import ProductDescriptionRenderer from '@/components/store/ProductDescriptionRenderer';
import { useRouter } from 'next/navigation';

interface Product {
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    description: string;
    category: string;
    featuredImage: string;
    images: { id: string; url: string; alt: string; position: number }[];
    variants: { id: string; name: string; sku: string; price: number; stock: number; image?: string; key?: string; prices?: { USD?: number; INR?: number }; compareAtPrices?: { USD?: number; INR?: number } }[];
    status: string;
    slug: string;
    currency?: string;
    videoUrl?: string;
    glbUrl?: string;
    prices?: { USD?: number; INR?: number };
    compareAtPrices?: { USD?: number; INR?: number };
    // Google Merchant fields
    availableCountries?: string[];
    brand?: string;
    gtin?: string;
    mpn?: string;
    condition?: 'new' | 'refurbished' | 'used';
    sku?: string;
    stock?: number;
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { addItem } = useCart();
    const { formatPrice, formatProductPrice, formatRawPrice, currency: globalCurrency, countryCode } = useCurrency();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [imgIdx, setImgIdx] = useState(0);
    const [qty, setQty] = useState(1);
    const [liked, setLiked] = useState(false);
    const [open, setOpen] = useState({ shipping: false });
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    // Check if product is available in user's country
    const isAvailableInCountry = !product?.availableCountries ||
        product.availableCountries.length === 0 ||
        !countryCode ||
        product.availableCountries.includes(countryCode);

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
                    const category = data.data.category;
                    const resRel = await fetch(`/api/products?${category ? `category=${category}&` : ''}limit=8&status=active`);
                    const relData = await resRel.json();
                    if (relData.success) {
                        let filtered = relData.data.products.filter((p: any) => p.id !== data.data.id && p.isVisible !== false);
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
            currency: product.currency || 'USD',
            prices: selectedVariant ? selectedVariant.prices : product.prices
        };
        for (let i = 0; i < qty; i++) {
            addItem(cartItem);
        }
        setTimeout(() => {
            setAdding(false);
            if (buyNow) router.push('/cart');
        }, 600);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={48} className="af-spin" style={{ color: '#000' }} />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
                <Package size={64} style={{ color: '#ccc', marginBottom: '24px' }} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>{error || 'Product Not Found'}</h1>
                <p style={{ color: '#666', marginBottom: '24px' }}>The product you're looking for might have been removed or moved.</p>
                <Link href="/products" className="btn-premium" style={{ textDecoration: 'none' }}>Browse Products</Link>
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

    // Google Merchant JSON-LD Structured Data
    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description?.replace(/<[^>]*>?/gm, '').slice(0, 5000) || product.name,
        "image": allImages,
        "brand": {
            "@type": "Brand",
            "name": product.brand || "Dripzy"
        },
        "sku": product.sku || product.id,
        "mpn": product.mpn || product.sku || product.id,
        "gtin": product.gtin || undefined,
        "category": product.category,
        "offers": {
            "@type": "Offer",
            "url": typeof window !== 'undefined' ? window.location.href : `https://dripzy.store/product/${product.slug || product.id}`,
            "priceCurrency": globalCurrency,
            "price": globalCurrency === 'INR' && product.prices?.INR ? product.prices.INR : product.price,
            "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "availability": (product.stock ?? 100) > 0 && isAvailableInCountry
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            "itemCondition": `https://schema.org/${product.condition === 'refurbished' ? 'RefurbishedCondition' : product.condition === 'used' ? 'UsedCondition' : 'NewCondition'}`,
            "shippingDetails": product.availableCountries?.map(country => ({
                "@type": "OfferShippingDetails",
                "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": country
                }
            }))
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "127"
        }
    };

    return (
        <div style={{ background: '#fff', minHeight: '100vh' }}>
            {/* Google Merchant JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
            />
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
                <section style={{ paddingTop: '110px', paddingBottom: '60px' }}>
                    {/* Breadcrumbs */}
                    <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '0.85rem', color: '#888' }}>
                        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>Home</Link>
                        <ChevronRight size={14} />
                        <Link href="/products" style={{ color: '#888', textDecoration: 'none' }}>Products</Link>
                        <ChevronRight size={14} />
                        <span style={{ color: '#000', fontWeight: 500 }}>{product.category}</span>
                    </div>

                    <div className="product-page-grid">
                        {/* Gallery Section */}
                        <div className="product-gallery-container animate-slide-up">
                            {mediaItems.length > 1 && (
                                <div className="thumbnail-column">
                                    {mediaItems.map((item, i) => (
                                        <button key={i} onClick={() => setImgIdx(i)} title={`View ${item.type} ${i + 1}`} aria-label={`View ${item.type} ${i + 1}`} className={`thumbnail-item ${imgIdx === i ? 'active' : ''}`}>
                                            {item.type === 'image' && <Image src={item.url} alt={`Thumb ${i}`} fill style={{ objectFit: 'cover' }} sizes="80px" />}
                                            {item.type === 'video' && <div className="thumbnail-media-icon"><Play size={20} fill="#fff" color="#fff" /></div>}
                                            {item.type === 'glb' && <div className="thumbnail-media-icon" style={{ background: '#f5f5f7' }}><Box size={20} /></div>}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="main-media-container">
                                <div className="main-media-wrapper">
                                    {mediaItems[imgIdx]?.type === 'image' && (
                                        <Image key={mediaItems[imgIdx].url} src={mediaItems[imgIdx].url} alt={product.name} fill priority className="animate-fade-in" style={{ objectFit: 'contain' }} sizes="(max-width: 1024px) 100vw, 800px" />
                                    )}
                                    {mediaItems[imgIdx]?.type === 'video' && (
                                        <video key={mediaItems[imgIdx].url} src={mediaItems[imgIdx].url} autoPlay loop muted playsInline controls className="animate-fade-in" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    )}
                                    {mediaItems[imgIdx]?.type === 'glb' && (
                                        <div style={{ width: '100%', height: '100%' }}>
                                            {/* @ts-ignore */}
                                            <model-viewer src={mediaItems[imgIdx].url} camera-controls auto-rotate shadow-intensity="1" style={{ width: '100%', height: '100%' }} ar></model-viewer>
                                        </div>
                                    )}
                                    {discount > 0 && (
                                        <div className="discount-badge">
                                            {discount}% OFF
                                        </div>
                                    )}
                                    <button onClick={() => setLiked(!liked)} title={liked ? "Remove from wishlist" : "Add to wishlist"} aria-label={liked ? "Remove from wishlist" : "Add to wishlist"} className="wishlist-btn">
                                        <Heart size={24} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#000'} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Product Info Section */}
                        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1, color: '#000' }}>{product.name}</h1>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: 700 }}>
                                    {(() => {
                                        if (selectedVariant) {
                                            if (selectedVariant.prices && selectedVariant.prices[globalCurrency] !== undefined) {
                                                return formatRawPrice(selectedVariant.prices[globalCurrency]);
                                            }
                                            const basePriceValue = parseFloat(formatProductPrice(product).replace(/[^0-9.]/g, ''));
                                            const ratio = product.price > 0 ? selectedVariant.price / product.price : 1;
                                            const calculatedPrice = basePriceValue * ratio;
                                            if (globalCurrency === 'INR') return `₹${Math.ceil(calculatedPrice).toLocaleString('en-IN')}`;
                                            return formatPrice(selectedVariant.price, (product.currency as any) || 'USD');
                                        }
                                        return formatProductPrice(product);
                                    })()}
                                </span>
                                {(() => {
                                    let compareAtToDisplay: string | null = null;
                                    let shouldDisplay = false;
                                    if (selectedVariant) {
                                        if (selectedVariant.compareAtPrices?.[globalCurrency] !== undefined) {
                                            compareAtToDisplay = formatRawPrice(selectedVariant.compareAtPrices[globalCurrency]);
                                            shouldDisplay = selectedVariant.compareAtPrices[globalCurrency] > (selectedVariant.prices?.[globalCurrency] ?? selectedVariant.price);
                                        } else if (selectedVariant.compareAtPrice) {
                                            if (globalCurrency === 'INR') {
                                                const ratio = product.price > 0 ? selectedVariant.price / product.price : 1;
                                                const baseCompareValue = parseFloat(formatProductPrice(product, 'compareAtPrice').replace(/[^0-9.]/g, ''));
                                                const calculatedCompare = baseCompareValue * ratio;
                                                compareAtToDisplay = `₹${Math.ceil(calculatedCompare).toLocaleString('en-IN')}`;
                                            } else {
                                                compareAtToDisplay = formatPrice(selectedVariant.compareAtPrice, (product.currency as any) || 'USD');
                                            }
                                            shouldDisplay = selectedVariant.compareAtPrice > selectedVariant.price;
                                        } else if (product.compareAtPrice) {
                                            const ratio = product.price > 0 ? selectedVariant.price / product.price : 1;
                                            const baseCompareValue = parseFloat(formatProductPrice(product, 'compareAtPrice').replace(/[^0-9.]/g, ''));
                                            const calculatedCompare = baseCompareValue * ratio;
                                            if (globalCurrency === 'INR') compareAtToDisplay = `₹${Math.ceil(calculatedCompare).toLocaleString('en-IN')}`;
                                            else compareAtToDisplay = formatPrice(product.compareAtPrice * ratio, (product.currency as any) || 'USD');
                                            shouldDisplay = true;
                                        }
                                    } else if (product.compareAtPrice) {
                                        compareAtToDisplay = formatProductPrice(product, 'compareAtPrice');
                                        shouldDisplay = true;
                                    }
                                    if (shouldDisplay && compareAtToDisplay) {
                                        return <span style={{ fontSize: '1.25rem', color: '#888', textDecoration: 'line-through' }}>{compareAtToDisplay}</span>;
                                    }
                                    return null;
                                })()}
                            </div>

                            {/* Trust Badges */}
                            <div style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', border: '1px solid #eee', borderRadius: '16px', alignItems: 'center', textAlign: 'center' }}>
                                    <ShieldCheck size={18} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Secure</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', border: '1px solid #eee', borderRadius: '16px', alignItems: 'center', textAlign: 'center' }}>
                                    <Truck size={18} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Fast</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', border: '1px solid #eee', borderRadius: '16px', alignItems: 'center', textAlign: 'center' }}>
                                    <RefreshCw size={18} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Refunds</span>
                                </div>
                            </div>

                            {/* Variants Selection */}
                            {(product.variants && product.variants.length > 0) && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Select Option</span>
                                        {selectedVariant && <span style={{ color: '#666', fontWeight: 400 }}>{(selectedVariant.name || selectedVariant.key || '').replace(product.name, '').replace(/^-/, '').trim() || selectedVariant.name || selectedVariant.key}</span>}
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                                        {product.variants.map((v, idx) => {
                                            const isSelected = selectedVariant?.id === v.id;
                                            const cleanName = (v.name || v.key || '').replace(product.name, '').replace(/^-/, '').trim() || v.name || v.key;
                                            return (
                                                <button key={idx} onClick={() => { setSelectedVariant(v); if (v.image) { const idx = allImages.findIndex(u => u === v.image); if (idx !== -1) setImgIdx(idx); } }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0', borderRadius: '10px', border: isSelected ? '2px solid #000' : '1px solid #eee', backgroundColor: '#fff', cursor: 'pointer', overflow: 'hidden' }}>
                                                    <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#f5f5f7', position: 'relative' }}>
                                                        <Image src={v.image || product.featuredImage || ''} alt={String(cleanName || 'Variant')} fill style={{ objectFit: 'cover', opacity: isSelected ? 1 : 0.9 }} sizes="80px" />
                                                        {isSelected && <div style={{ position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', backgroundColor: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={10} color="white" strokeWidth={3} /></div>}
                                                    </div>
                                                    <div style={{ padding: '6px', fontSize: '0.75rem', fontWeight: 600 }}>{cleanName}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Quantity</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f7', borderRadius: '50px', padding: '4px' }}>
                                        <button onClick={() => setQty(Math.max(1, qty - 1))} className="qty-btn" title="Decrease Quantity"><Minus size={16} /></button>
                                        <span style={{ fontSize: '1rem', fontWeight: 700, minWidth: '40px', textAlign: 'center', display: 'inline-block' }}>{qty}</span>
                                        <button onClick={() => setQty(qty + 1)} className="qty-btn" title="Increase Quantity"><Plus size={16} /></button>
                                    </div>
                                    {isAvailableInCountry ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 600, fontSize: '0.85rem' }}><Check size={16} /> In Stock</div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 600, fontSize: '0.85rem' }}>Not available in your region</div>
                                    )}
                                </div>
                            </div>

                            {/* Desktop Actions */}
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '48px' }} className="desktop-only">
                                <button
                                    onClick={() => isAvailableInCountry && handleAdd(true)}
                                    className={isAvailableInCountry ? "btn-premium" : "btn-premium-disabled"}
                                    style={{ flex: 1.5, padding: '20px', opacity: isAvailableInCountry ? 1 : 0.5, cursor: isAvailableInCountry ? 'pointer' : 'not-allowed' }}
                                    disabled={!isAvailableInCountry}
                                >
                                    {!isAvailableInCountry ? 'Not Available in Your Region' : adding ? <Loader2 className="af-spin" /> : 'Buy Now'}
                                </button>
                                <button
                                    onClick={() => isAvailableInCountry && handleAdd(false)}
                                    className={isAvailableInCountry ? "btn-premium-outline" : "btn-premium-outline"}
                                    style={{ flex: 1, padding: '20px', opacity: isAvailableInCountry ? 1 : 0.5, cursor: isAvailableInCountry ? 'pointer' : 'not-allowed' }}
                                    disabled={!isAvailableInCountry}
                                >
                                    Add to Cart
                                </button>
                            </div>

                            <div style={{ borderTop: '1px solid #f0f0f0' }}>
                                <button onClick={() => setOpen({ ...open, shipping: !open.shipping })} style={{ width: '100%', padding: '20px 0', display: 'flex', justifyContent: 'space-between', background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', fontWeight: 600 }}>Shipping & Returns <ChevronDown size={20} style={{ transform: open.shipping ? 'rotate(180deg)' : '', transition: '0.3s' }} /></button>
                                {open.shipping && <div style={{ padding: '20px 0', color: '#555', fontSize: '0.95rem', lineHeight: 1.7 }}>Standard delivery takes 5-7 business days. 7-day hassle-free returns.</div>}
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    {product.description && (
                        <div style={{ marginTop: '80px', paddingTop: '80px', borderTop: '1px solid #eee' }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '32px' }}>Product Details</h2>
                            <div style={{ position: 'relative', background: '#f9fafb', borderRadius: '32px', overflow: 'hidden' }}>
                                <div style={{ maxHeight: isDescriptionExpanded ? 'none' : '400px', overflow: 'hidden', padding: '40px', transition: 'all 0.5s var(--d-ease)' }}>
                                    <ProductDescriptionRenderer htmlContent={product.description} />
                                </div>
                                {!isDescriptionExpanded && (
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '150px', background: 'linear-gradient(to bottom, transparent, #f9fafb)', pointerEvents: 'none' }} />
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
                                <button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="btn-premium-outline" style={{ padding: '12px 32px' }}>
                                    {isDescriptionExpanded ? <><ChevronUp size={18} /> Show Less</> : <><ChevronDown size={18} /> View Full Details</>}
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Related Products */}
                <section style={{ paddingBottom: '100px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '40px' }}>You May Also Like</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
                        {relatedProducts.map(item => (
                            <Link key={item.id} href={`/product/${item.slug || item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ aspectRatio: '1', background: '#f5f5f7', borderRadius: '24px', overflow: 'hidden', position: 'relative', marginBottom: '20px' }}>
                                    <Image src={item.featuredImage} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="300px" />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{item.name}</h3>
                                <p style={{ fontWeight: 800, color: '#000' }}>{formatPrice(item.price, (item.currency as any) || 'USD')}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>

            {/* Sticky Mobile Bar */}
            <div className="sticky-mobile-bar glass-effect" style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', alignItems: 'center' }}>
                <div style={{ flex: 0.8 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900 }}>{formatProductPrice(product)}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px', flex: 1.5, justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => isAvailableInCountry && handleAdd(false)}
                        className="btn-mobile-add"
                        aria-label="Add to cart"
                        style={{ opacity: isAvailableInCountry ? 1 : 0.5 }}
                        disabled={!isAvailableInCountry}
                    >
                        {adding ? <Loader2 size={20} className="af-spin" /> : <ShoppingBag size={22} />}
                    </button>
                    <button
                        onClick={() => isAvailableInCountry && handleAdd(true)}
                        className="btn-mobile-buy"
                        style={{ opacity: isAvailableInCountry ? 1 : 0.5 }}
                        disabled={!isAvailableInCountry}
                    >
                        {!isAvailableInCountry ? 'Not Available' : adding ? <Loader2 size={20} className="af-spin" /> : 'Buy Now'}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .product-page-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 64px;
                    align-items: start;
                }
                .product-gallery-container {
                    display: grid;
                    grid-template-columns: 80px 1fr;
                    gap: 20px;
                }
                .thumbnail-column {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    max-height: 600px;
                    overflow-y: auto;
                    padding-right: 5px;
                    scrollbar-width: none; /* Hide scrollbar Firefox */
                    -ms-overflow-style: none;  /* Hide scrollbar IE/Edge */
                }
                .thumbnail-column::-webkit-scrollbar {
                    display: none; /* Hide scrollbar Webkit */
                }
                .thumbnail-item {
                    width: 76px;
                    height: 76px;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid #eee;
                    padding: 0;
                    cursor: pointer;
                    background-color: #fff;
                    position: relative;
                    flex-shrink: 0;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .thumbnail-item:hover {
                    border-color: #aaa;
                    transform: translateY(-2px);
                }
                .thumbnail-item.active {
                    border: 2px solid #000;
                    transform: scale(1.02);
                }
                .thumbnail-media-icon {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #000;
                }
                .main-media-container {
                    position: relative;
                }
                .main-media-wrapper {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 1;
                    border-radius: 32px;
                    overflow: hidden;
                    background: #fff;
                    border: 1px solid #f0f0f0;
                    box-shadow: 0 15px 45px rgba(0,0,0,0.03);
                }
                .discount-badge {
                    position: absolute;
                    top: 20px;
                    left: 20px;
                    background: #000;
                    color: #fff;
                    padding: 8px 16px;
                    border-radius: 50px;
                    font-size: 0.8rem;
                    font-weight: 800;
                    z-index: 10;
                }
                .wishlist-btn {
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    border: none;
                    background: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    z-index: 10;
                    transition: transform 0.2s;
                }
                .qty-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    border: none;
                    background: #fff;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    margin: 0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    transition: all 0.2s;
                    color: #000;
                    line-height: 0;
                }
                .qty-btn :global(svg) {
                    display: block;
                    margin: 0;
                }
                .qty-btn:hover {
                    background: #000;
                    color: #fff;
                    transform: scale(1.1);
                }
                .qty-btn:active {
                    transform: scale(0.95);
                }
                
                @media (max-width: 1024px) {
                    .product-page-grid { grid-template-columns: 1fr; gap: 40px; }
                    .product-gallery-container { grid-template-columns: 1fr; }
                    .thumbnail-column {
                        flex-direction: row;
                        order: 2;
                        overflow-x: auto;
                        padding-right: 0;
                        padding-bottom: 5px;
                        justify-content: center;
                    }
                    .main-media-container { order: 1; }
                }

                .btn-mobile-add {
                    width: 56px;
                    height: 56px;
                    border-radius: 18px;
                    border: 2px solid #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    color: #000;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    padding: 0;
                }
                .btn-mobile-add:active {
                    transform: scale(0.85);
                    background: rgba(0,0,0,0.05);
                }

                .btn-mobile-buy {
                    flex: 1;
                    height: 56px;
                    background: #000;
                    color: #fff;
                    border: none;
                    border-radius: 18px;
                    font-weight: 800;
                    font-size: 1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.02em;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .btn-mobile-buy:active {
                    transform: scale(0.95);
                    background: #333;
                }
            `}</style>
        </div>
    );
}
