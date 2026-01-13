'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const Header = () => {
    const { cartCount, toggleDrawer: toggleCart } = useCart();
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const [promoImage, setPromoImage] = useState('https://images.unsplash.com/photo-1592833159057-65a284572b25?q=80&w=2600&auto=format&fit=crop');
    const [promoTitle, setPromoTitle] = useState('Explore Electronics');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
        document.body.classList.toggle('af-drawer-active', !mobileMenuOpen);
    };

    const handleMegaHover = (img: string, title: string) => {
        setPromoImage(img);
        setPromoTitle(title);
    };

    return (
        <div className="af-header-system">
            <div className={`af-navbar-wrap ${scrolled ? 'scrolled' : ''}`}>
                <nav className="af-navbar">
                    <div className="af-nav-left">
                        <button className="af-menu-btn" onClick={toggleMobileMenu}>
                            <div className="af-hamburger"><span></span><span></span></div>
                            <span className="af-menu-text">Shop</span>
                        </button>
                        {/* Mega Menu */}
                        <div className="af-mega-overlay">
                            <div className="af-mega-col">
                                <h4>Apple Gear</h4>
                                <ul className="af-mega-list">
                                    <li><Link href="/products?cat=iphone" onMouseEnter={() => handleMegaHover('https://images.unsplash.com/photo-1603539947673-c6eb2934808f?q=80&w=2600&auto=format&fit=crop', 'iPhone Cases')}>iPhone Cases</Link></li>
                                    <li><Link href="/products?cat=ipad" onMouseEnter={() => handleMegaHover('https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2600&auto=format&fit=crop', 'iPad Protection')}>iPad Cases</Link></li>
                                    <li><Link href="/products?cat=magsafe" onMouseEnter={() => handleMegaHover('https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=2600&auto=format&fit=crop', 'MagSafe Ready')}>MagSafe</Link></li>
                                </ul>
                            </div>
                            <div className="af-mega-col">
                                <h4>Power & Sound</h4>
                                <ul className="af-mega-list">
                                    <li className="af-sub-group">Essentials</li>
                                    <li><Link href="/products?cat=chargers" onMouseEnter={() => handleMegaHover('https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=2600&auto=format&fit=crop', 'Fast Charging')}>Adapters & Hubs</Link></li>
                                    <li><Link href="/products?cat=audio" onMouseEnter={() => handleMegaHover('https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=2600&auto=format&fit=crop', 'Immersive Audio')}>Headphones</Link></li>
                                </ul>
                            </div>
                            <div className="af-mega-col">
                                <h4>Featured</h4>
                                <ul className="af-mega-list">
                                    <li><Link href="#" style={{ color: '#d0021b', fontWeight: 700 }}>NEW ARRIVALS</Link></li>
                                    <li><Link href="#">Best Sellers</Link></li>
                                    <li><Link href="#">Clearance</Link></li>
                                </ul>
                            </div>
                            <div className="af-mega-col">
                                <div className="af-menu-promo">
                                    <div className="af-promo-img-wrap">
                                        <img src={promoImage} alt="Featured" className="active" style={{ opacity: 1 }} />
                                    </div>
                                    <div className="af-promo-content"><div className="af-promo-title">{promoTitle}</div></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="af-logo">
                        <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', textDecoration: 'none', color: '#000' }}>DRIPZY.IN</Link>
                    </div>

                    <div className="af-nav-right">
                        <button className="af-action-link" onClick={() => setSearchOpen(true)} aria-label="Search">
                            <Search size={20} strokeWidth={1.8} />
                        </button>
                        <Link href="/account" className="af-action-link" aria-label="Account">
                            <User size={20} strokeWidth={1.8} />
                        </Link>
                        <button className="af-action-link" onClick={toggleCart} aria-label="Cart">
                            <ShoppingBag size={20} strokeWidth={1.8} />
                            {cartCount > 0 && <span className="af-cart-count">{cartCount}</span>}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Drawer */}
            <div className={`af-mobile-drawer ${mobileMenuOpen ? 'active' : ''}`}>
                <div className="af-mobile-nav">
                    <div className="af-mobile-acc-item active">
                        <button className="af-mobile-acc-trigger" onClick={() => { }}>Shop Electronics <span>+</span></button>
                        <div className="af-mobile-acc-content" style={{ maxHeight: '800px' }}>
                            <ul className="af-mobile-sub-list">
                                <li><Link href="/products">All Products</Link></li>
                                <li><Link href="/products?cat=chargers">Chargers & Cables</Link></li>
                                <li><Link href="/products?cat=cases">Cases & Protections</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="af-mobile-footer">
                        <Link href="/account">My Account</Link>
                        <Link href="#">Track Order</Link>
                    </div>
                </div>
            </div>

            {/* Search Overlay */}
            <div className={`af-search-overlay ${searchOpen ? 'active' : ''}`}>
                <div className="af-search-container">
                    <button className="af-search-close-top" onClick={() => setSearchOpen(false)}>Close <X size={14} /></button>
                    <div className="af-search-input-wrap">
                        <input type="text" className="af-search-input" placeholder="Search products..." autoFocus={searchOpen} />
                    </div>
                    <div className="af-search-suggestions">
                        <div>
                            <span className="af-search-col-title">Trending</span>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <Link href="#" className="af-search-tag">Wireless Charger</Link>
                                <Link href="#" className="af-search-tag">iPhone 15 Case</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
