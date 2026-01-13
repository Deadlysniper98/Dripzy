import { AdminSidebar } from '@/components/admin/Sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
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
                    justifyContent: 'flex-end',
                    padding: '0 32px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#000',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 600
                        }}>
                            A
                        </div>
                        <div>
                            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>Admin</div>
                            <div style={{ fontSize: '0.75rem', color: '#888' }}>admin@dripzy.in</div>
                        </div>
                    </div>
                </header>
                <div style={{ padding: '32px' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
