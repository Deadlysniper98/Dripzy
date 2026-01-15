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
    { name: 'Tech Accessories', link: '/products?category=Accessories', image: '/tech_accessories.png' },
    { name: 'Bags & Wallets', link: '/products?category=Bags', image: '/bags_wallets.png' },
    { name: 'Work Essentials', link: '/products?category=Work', image: '/work_essentials.png' },
];

export const CategoryGrid = ({ categories }: CategoryGridProps) => {
    const data = (categories && categories.length > 0) ? categories : DEFAULT_CATEGORIES;

    return (
        <section className="af-category-section">
            <div className="af-category-grid" style={{ '--cols': Math.min(data.length, 3) } as React.CSSProperties}>
                {data.map((cat, idx) => (
                    <Link
                        key={idx}
                        href={cat.link}
                        className="af-category-card"
                    >
                        <div className="af-category-image-wrapper">
                            <img
                                src={cat.image}
                                alt={cat.name}
                                className="af-category-image"
                            />
                            <div className="af-category-overlay"></div>
                        </div>
                        <div className="af-category-content">
                            <h3 className="af-category-title">{cat.name}</h3>
                            <span className="af-category-shop-now">Shop Now</span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};
