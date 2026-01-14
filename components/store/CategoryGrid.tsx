'use client';

import Link from 'next/link';

interface CategoryGridProps {
    categories?: {
        name: string;
        image: string;
        link: string;
    }[];
}

const DEFAULT_CATEGORIES = [
    { name: 'Chargers', link: '/products?category=Chargers', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0' },
    { name: 'Cases', link: '/products?category=Cases', image: 'https://images.unsplash.com/photo-1603539947673-c6eb2934808f' },
    { name: 'Audio', link: '/products?category=Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' },
];

export const CategoryGrid = ({ categories }: CategoryGridProps) => {
    const data = categories || DEFAULT_CATEGORIES;

    return (
        <section style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '40px 20px',
            boxSizing: 'border-box'
        }}>
            <div style={{
                display: 'grid',
                gap: '24px',
                gridTemplateColumns: `repeat(${Math.min(data.length, 3)}, 1fr)`
            }}>
                {data.map((cat, idx) => (
                    <Link
                        key={idx}
                        href={cat.link}
                        style={{
                            position: 'relative',
                            background: '#fff',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            textDecoration: 'none',
                            display: 'block',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
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
                                bottom: '24px',
                                left: '24px',
                                background: 'rgba(255, 255, 255, 0.95)',
                                padding: '10px 24px',
                                borderRadius: '16px',
                                fontSize: '1rem',
                                fontWeight: 700,
                                color: '#000',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                            }}
                        >
                            {cat.name}
                        </div>
                    </Link>
                ))}
            </div>

            <style jsx>{`
                .category-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
                }
                .category-card:hover .category-image {
                    transform: scale(1.08);
                }
                @media (max-width: 1024px) {
                    div { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 640px) {
                    div { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
};
