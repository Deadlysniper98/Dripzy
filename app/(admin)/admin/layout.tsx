'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/Sidebar';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { Loader2, LogOut } from 'lucide-react';

// Admin content wrapper that handles auth checking
function AdminContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading, signOut, isAuthenticated } = useAdminAuth();

    useEffect(() => {
        // Don't redirect if we're on the login page
        if (pathname === '/admin/login') return;

        // If not loading and not authenticated, redirect to login
        if (!loading && !isAuthenticated) {
            router.push('/admin/login');
        }
    }, [loading, isAuthenticated, router, pathname]);

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f5f5f7',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <Loader2 size={40} style={{ color: '#667eea', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Loading admin panel...</p>
                <style jsx global>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    // If on login page, render without sidebar
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // If not authenticated and not on login page, show nothing (will redirect)
    if (!isAuthenticated) {
        return null;
    }

    // Render authenticated admin layout
    return (
        <div style={{ paddingLeft: '250px', minHeight: '100vh', backgroundColor: '#f5f5f7' }}>
            <AdminSidebar />
            <main>
                <header style={{
                    height: '70px',
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 32px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    <div style={{ fontSize: '0.85rem', color: '#888' }}>
                        Welcome back, Admin 👋
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}>
                                {user?.email?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div>
                                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Admin</div>
                                <div style={{ fontSize: '0.75rem', color: '#888' }}>{user?.email || 'admin@dripzy.in'}</div>
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                await signOut();
                                router.push('/admin/login');
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                backgroundColor: '#f5f5f7',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                color: '#666',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </div>
                </header>
                <div style={{ padding: '32px' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AdminAuthProvider>
            <AdminContent>{children}</AdminContent>
        </AdminAuthProvider>
    );
}
