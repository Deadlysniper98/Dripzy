'use client';

import Link from 'next/link';
import { ShoppingCart, Search, Menu, ChevronDown } from 'lucide-react';
import { CATEGORIES, CATEGORY_HIERARCHY } from '@/lib/categories';

export const Navbar = () => {
    return (
        <header className="border-b bg-white sticky top-0 z-50" style={{ borderColor: 'var(--border-color)', height: 'var(--header-height)' }}>
            <div className="max-w-[1440px] mx-auto px-8 flex items-center justify-between h-full">
                <div className="flex items-center gap-4">
                    <button className="md:hidden">
                        <Menu size={24} />
                    </button>
                    <Link href="/" className="text-xl font-bold tracking-tight">
                        MINIMAL STORE
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary h-full">
                    <Link href="/" className="hover:text-primary transition-colors flex items-center h-full">Home</Link>

                    {CATEGORY_HIERARCHY.map((parent) => (
                        <div key={parent.name} className="relative group h-full flex items-center">
                            <Link
                                href={`/category/${parent.slug}`}
                                className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                            >
                                {parent.name} <ChevronDown size={14} />
                            </Link>

                            <div className="absolute top-[100%] left-0 pt-0 hidden group-hover:block w-48 transition-all duration-200 z-50">
                                <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 flex flex-col gap-1 mt-2">
                                    {parent.subcategories.map((sub) => (
                                        <Link
                                            key={sub}
                                            href={`/category/${sub}`}
                                            className="block px-4 py-2.5 hover:bg-gray-50 rounded-lg text-sm text-gray-600 hover:text-black transition-colors"
                                        >
                                            {sub}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                    <Link href="/products" className="hover:text-primary transition-colors flex items-center h-full">Shop All</Link>
                </nav>

                <div className="flex items-center gap-4">
                    <button className="hover:text-primary transition-colors">
                        <Search size={20} />
                    </button>
                    <Link href="/cart" className="relative hover:text-primary transition-colors">
                        <ShoppingCart size={20} />
                        {/* Badge for cart count could go here */}
                    </Link>
                </div>
            </div>
        </header>
    );
};
