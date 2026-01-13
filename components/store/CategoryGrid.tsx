'use client';

import Link from 'next/link';

const CATEGORIES = [
    { name: 'Chargers', href: '/products?cat=chargers', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800&auto=format&fit=crop' },
    { name: 'Cases', href: '/products?cat=cases', image: 'https://images.unsplash.com/photo-1603539947673-c6eb2934808f?q=80&w=800&auto=format&fit=crop' },
    { name: 'Audio', href: '/products?cat=audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop' },
    { name: 'Cables', href: '/products?cat=cables', image: 'https://images.unsplash.com/photo-1572569028738-411a561109dc?q=80&w=800&auto=format&fit=crop' },
    { name: 'Power Banks', href: '/products?cat=power', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=800&auto=format&fit=crop' },
    { name: 'Accessories', href: '/products?cat=accessories', image: 'https://images.unsplash.com/photo-1625591340248-6d2894ebd784?q=80&w=800&auto=format&fit=crop' },
];

export const CategoryGrid = () => {
    return (
        <section style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '20px 20px 40px',
            boxSizing: 'border-box'
        }}>
            <div style={{
                display: 'grid',
                gap: '16px',
                gridTemplateColumns: 'repeat(3, 1fr)'
            }}>
                {CATEGORIES.map((cat) => (
                    <Link
                        key={cat.name}
                        href={cat.href}
                        style={{
                            position: 'relative',
                            background: '#fff',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            textDecoration: 'none',
                            display: 'block',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        className="category-card"
                    >
                        <div style={{ width: '100%', overflow: 'hidden' }}>
                            <img
                                src={cat.image}
                                alt={cat.name}
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    aspectRatio: '4/3',
                                    objectFit: 'cover',
                                    display: 'block',
                                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                                className="category-image"
                            />
                        </div>
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '20px',
                                background: 'rgba(255, 255, 255, 0.95)',
                                padding: '8px 18px',
                                borderRadius: '12px',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                color: '#1a1a1a',
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                            }}
                            className="category-label"
                        >
                            {cat.name}
                        </div>
                    </Link>
                ))}
            </div>

            <style>{`
                .category-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08);
                    z-index: 10;
                }
                .category-card:hover .category-image {
                    transform: scale(1.04);
                }
                @media (max-width: 768px) {
                    section > div {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 12px !important;
                    }
                }
            `}</style>
        </section>
    );
};
