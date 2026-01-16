'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X, Loader2, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { CATEGORY_HIERARCHY } from '@/lib/categories';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

export const Header = () => {
    const pathname = usePathname();
    const { cartCount, toggleDrawer: toggleCart } = useCart();
    const { currency, setCurrency, formatPrice, countryCode } = useCurrency();
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [themeConfig, setThemeConfig] = useState<any>(null);

    const [promoImage, setPromoImage] = useState('https://images.unsplash.com/photo-1592833159057-65a284572b25?q=80&w=2600&auto=format&fit=crop');
    const [promoTitle, setPromoTitle] = useState('Explore Electronics');

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const fetchTheme = async () => {
            try {
                const themeDoc = await getDoc(doc(db, 'settings', 'theme'));
                if (themeDoc.exists()) {
                    setThemeConfig(themeDoc.data());
                }
            } catch (error) {
                console.error('Error fetching theme in header:', error);
            }
        };
        fetchTheme();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }
            setSearching(true);
            try {
                const q = query(
                    collection(db, 'products'),
                    where('status', '==', 'active'),
                    limit(20)
                );
                const snapshot = await getDocs(q);
                const results = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
                setSearchResults(results.slice(0, 5));
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setSearching(false);
            }
        };

        const timer = setTimeout(performSearch, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const toggleMobileMenu = () => {
        // Only toggle mobile menu on mobile devices
        if (!isMobile) return;
        setMobileMenuOpen(!mobileMenuOpen);
        document.body.classList.toggle('af-drawer-active', !mobileMenuOpen);
    };

    const handleMegaHover = (img: string, title: string) => {
        setPromoImage(img);
        setPromoTitle(title);
    };

    const hasAnnouncement = themeConfig?.announcement?.enabled;

    if (pathname === '/checkout') return null;

    return (
        <div className={`af-header-system ${hasAnnouncement ? 'has-announcement' : ''}`}>
            {hasAnnouncement && (
                <div className="af-announcement-bar" style={{
                    backgroundColor: themeConfig.announcement.backgroundColor || '#000',
                    color: '#fff',
                    padding: '10px',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    position: 'relative',
                    zIndex: 1100
                }}>
                    {themeConfig.announcement.text}
                </div>
            )}
            <div className={`af-navbar-wrap ${scrolled ? 'scrolled' : ''}`} style={{ top: scrolled ? '0' : (hasAnnouncement ? '36px' : '0') }}>
                <nav className="af-navbar">
                    <div className="af-nav-left">
                        <button className="af-menu-btn" onClick={toggleMobileMenu}>
                            <div className="af-hamburger"><span></span><span></span></div>
                            <span className="af-menu-text">Shop</span>
                        </button>
                        {/* Mega Menu */}
                        <div className="af-mega-overlay" style={{ gridTemplateColumns: '1fr 1fr 1fr 1.5fr' }}>
                            {/* Column 1: Electronics */}
                            <div className="af-mega-col">
                                {CATEGORY_HIERARCHY.filter(c => c.name === 'Electronics').map(group => (
                                    <div key={group.name}>
                                        <h4>
                                            <Link href={`/category/${group.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                {group.name}
                                            </Link>
                                        </h4>
                                        <ul className="af-mega-list">
                                            {group.subcategories.map((sub) => {
                                                const customImg = themeConfig?.megaMenuImages?.[sub];
                                                const fallbackImg = 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2600&auto=format&fit=crop';
                                                return (
                                                    <li key={sub}>
                                                        <Link
                                                            href={`/category/${sub}`}
                                                            style={{ textTransform: 'capitalize' }}
                                                            onMouseEnter={() => handleMegaHover(customImg || fallbackImg, sub)}
                                                        >
                                                            {sub}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Column 2: Fashion & Accessories */}
                            <div className="af-mega-col">
                                {CATEGORY_HIERARCHY.filter(c => c.name === 'Fashion' || c.name === 'Accessories').map(group => (
                                    <div key={group.name} style={{ marginBottom: '32px' }}>
                                        <h4>
                                            <Link href={`/category/${group.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                {group.name}
                                            </Link>
                                        </h4>
                                        <ul className="af-mega-list">
                                            {group.subcategories.map((sub) => {
                                                const customImg = themeConfig?.megaMenuImages?.[sub];
                                                const fallbackImg = group.name === 'Fashion'
                                                    ? 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2600&auto=format&fit=crop'
                                                    : 'https://images.unsplash.com/photo-1620799140408-ed5341cd2431?q=80&w=2600&auto=format&fit=crop';
                                                return (
                                                    <li key={sub}>
                                                        <Link
                                                            href={`/category/${sub}`}
                                                            style={{ textTransform: 'capitalize' }}
                                                            onMouseEnter={() => handleMegaHover(customImg || fallbackImg, sub)}
                                                        >
                                                            {sub}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Column 3: Lifestyle */}
                            <div className="af-mega-col">
                                {CATEGORY_HIERARCHY.filter(c => c.name === 'Lifestyle').map(group => (
                                    <div key={group.name} style={{ marginBottom: '32px' }}>
                                        <h4>
                                            <Link href={`/category/${group.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                                {group.name}
                                            </Link>
                                        </h4>
                                        <ul className="af-mega-list">
                                            {group.subcategories.map((sub) => {
                                                const customImg = themeConfig?.megaMenuImages?.[sub];
                                                const fallbackImg = 'https://images.unsplash.com/photo-1583847668182-518aeb33206c?q=80&w=2600&auto=format&fit=crop';
                                                return (
                                                    <li key={sub}>
                                                        <Link
                                                            href={`/category/${sub}`}
                                                            style={{ textTransform: 'capitalize' }}
                                                            onMouseEnter={() => handleMegaHover(customImg || fallbackImg, sub)}
                                                        >
                                                            {sub}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                                <div>
                                    <h4>Featured</h4>
                                    <ul className="af-mega-list">
                                        <li><Link href="/products" style={{ color: '#000', fontWeight: 600 }}>Shop All Products</Link></li>
                                    </ul>
                                </div>
                            </div>

                            {/* Column 4: Promo Image */}
                            <div className="af-mega-col">
                                <div className="af-menu-promo">
                                    <div className="af-promo-img-wrap">
                                        <img
                                            src={promoImage}
                                            alt="Featured"
                                            className="active"
                                            style={{ opacity: 1, objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div className="af-promo-content">
                                        <div className="af-promo-title">{promoTitle}</div>
                                        <p style={{ fontSize: '12px', margin: '4px 0 0', opacity: 0.9 }}>Featured Collection</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="af-logo">
                        <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', textDecoration: 'none', color: '#000' }}>DRIPZY.IN</Link>
                    </div>

                    <div className="af-nav-right">
                        {/* Hide currency switcher on mobile or if user is detected in India */}
                        {countryCode !== 'IN' && !isMobile && (
                            <div style={{ marginRight: '16px', borderRight: '1px solid #eee', paddingRight: '16px', display: 'flex', alignItems: 'center' }}>
                                <button
                                    onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
                                    style={{
                                        background: '#f5f5f7',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '50px',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    {currency} <ChevronDown size={14} />
                                </button>
                            </div>
                        )}
                        <button className="af-action-link af-action-search" onClick={() => setSearchOpen(true)} aria-label="Search">
                            <Search size={20} strokeWidth={1.8} />
                        </button>
                        <Link href="/account" className="af-action-link af-action-account" aria-label="Account">
                            <User size={20} strokeWidth={1.8} />
                        </Link>
                        <button className="af-action-link af-action-cart" onClick={toggleCart} aria-label="Cart">
                            <ShoppingBag size={20} strokeWidth={1.8} />
                            {cartCount > 0 && <span className="af-cart-count">{cartCount}</span>}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Drawer */}
            <div className={`af-mobile-drawer ${mobileMenuOpen ? 'active' : ''}`}>
                <div className="af-drawer-header">
                    <span className="af-drawer-logo">DRIPZY</span>
                    <button className="af-drawer-close" onClick={toggleMobileMenu} aria-label="Close menu">
                        <X size={24} />
                    </button>
                </div>
                <div className="af-mobile-nav">
                    {CATEGORY_HIERARCHY.map((group) => (
                        <div className="af-mobile-acc-item active" key={group.name} style={{ marginBottom: '24px' }}>
                            <div style={{
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                marginBottom: '12px',
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}>
                                <Link href={`/category/${group.slug}`} onClick={toggleMobileMenu} style={{ color: 'inherit', textDecoration: 'none' }}>
                                    {group.name}
                                </Link>
                            </div>
                            <ul className="af-mobile-sub-list" style={{ paddingLeft: '0', listStyle: 'none' }}>
                                {group.subcategories.map((sub) => (
                                    <li key={sub} style={{ marginBottom: '12px' }}>
                                        <Link
                                            href={`/category/${sub}`}
                                            onClick={toggleMobileMenu}
                                            style={{ color: '#666', textDecoration: 'none', fontSize: '0.95rem' }}
                                        >
                                            {sub}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <div className="af-mobile-footer" style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '24px' }}>
                        <Link href="/account" style={{ display: 'block', marginBottom: '16px', fontWeight: 600 }}>My Account</Link>
                        <Link href="/products" style={{ display: 'block', fontWeight: 600 }}>Shop All</Link>
                    </div>
                </div>
            </div>

            {/* Search Overlay */}
            <div className={`af-search-overlay ${searchOpen ? 'active' : ''}`}>
                <button className="af-search-close-fixed" onClick={() => setSearchOpen(false)} aria-label="Close search">
                    <X size={28} />
                </button>
                <div className="af-search-container">
                    <div className="af-search-input-wrap">
                        <input
                            type="text"
                            className="af-search-input"
                            placeholder="Search products..."
                            autoFocus={searchOpen}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searching && <Loader2 className="af-search-loading" size={20} style={{ animation: 'af-spin 1s linear infinite' }} />}
                    </div>

                    <div className="af-search-results-container">
                        {searchResults.length > 0 ? (
                            <div className="af-search-results-list">
                                <span className="af-search-col-title">Top Matches</span>
                                {searchResults.map((p) => (
                                    <Link
                                        key={p.id}
                                        href={`/product/${p.slug || p.id}`}
                                        className="af-search-result-item"
                                        onClick={() => setSearchOpen(false)}
                                    >
                                        <div className="af-search-result-img">
                                            <img src={p.featuredImage} alt="" />
                                        </div>
                                        <div className="af-search-result-info">
                                            <span className="af-search-result-name">{p.name}</span>
                                            <span className="af-search-result-price">{formatPrice(p.price, (p.currency as any) || 'USD')}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : searchQuery.trim() && !searching ? (
                            <div className="af-search-empty">No products found for "{searchQuery}"</div>
                        ) : (
                            <div className="af-search-suggestions">
                                <span className="af-search-col-title">Trending</span>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <button onClick={() => setSearchQuery('Charger')} className="af-search-tag">Wireless Charger</button>
                                    <button onClick={() => setSearchQuery('Case')} className="af-search-tag">iPhone 15 Case</button>
                                    <button onClick={() => setSearchQuery('Audio')} className="af-search-tag">Headphones</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
