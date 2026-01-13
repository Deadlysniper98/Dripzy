'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Users, Settings, LogOut, Store } from 'lucide-react';

const MENU_ITEMS = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const AdminSidebar = () => {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('adminAuth');
        router.push('/admin/login');
    };

    return (
        <aside style={{
            width: '250px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            backgroundColor: '#fff',
            borderRight: '1px solid #eee',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Logo */}
            <div style={{
                height: '70px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0 24px',
                borderBottom: '1px solid #eee'
            }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#000',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Store size={20} color="#fff" />
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>Dripzy</div>
                    <div style={{ fontSize: '0.7rem', color: '#888' }}>Admin Panel</div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '20px 16px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 12px', marginBottom: '12px' }}>
                    Menu
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {MENU_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        color: isActive ? '#fff' : '#666',
                                        backgroundColor: isActive ? '#000' : 'transparent',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Icon size={20} />
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Store Link */}
            <div style={{ padding: '0 16px', marginBottom: '16px' }}>
                <Link
                    href="/"
                    target="_blank"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        backgroundColor: '#f5f5f7',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        color: '#333',
                        fontSize: '0.85rem',
                        fontWeight: 500
                    }}
                >
                    🌐 View Store
                </Link>
            </div>

            {/* Logout */}
            <div style={{ padding: '16px', borderTop: '1px solid #eee' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#ef4444',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        textAlign: 'left'
                    }}
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
};
