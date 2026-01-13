import { CartProvider } from '@/context/CartContext';
import { CartDrawer } from '@/components/store/CartDrawer';
import { Header } from '@/components/store/Header';
import { Footer } from '@/components/store/Footer';

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <CartProvider>
            <Header />
            <CartDrawer />
            <main style={{ minHeight: '100vh', paddingTop: '74px' /* header height */ }}>
                {children}
            </main>
            <Footer />
        </CartProvider>
    );
}
