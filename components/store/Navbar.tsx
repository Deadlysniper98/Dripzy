import Link from 'next/link';
import { ShoppingCart, Search, Menu } from 'lucide-react';

export const Navbar = () => {
    return (
        <header className="border-b" style={{ borderColor: 'var(--border-color)', height: 'var(--header-height)' }}>
            <div className="container flex items-center justify-between h-full">
                <div className="flex items-center gap-4">
                    <button className="md:hidden">
                        <Menu size={24} />
                    </button>
                    <Link href="/" className="text-xl font-bold tracking-tight">
                        MINIMAL STORE
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <Link href="/products" className="hover:text-primary transition-colors">Shop</Link>
                    <Link href="/about" className="hover:text-primary transition-colors">About</Link>
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
