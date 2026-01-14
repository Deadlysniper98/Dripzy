import { CartProvider } from '@/context/CartContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { CartDrawer } from '@/components/store/CartDrawer';
import { Header } from '@/components/store/Header';
import { Footer } from '@/components/store/Footer';

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <CurrencyProvider>
            <CartProvider>
                <Header />
                <CartDrawer />
                <main style={{ minHeight: '100vh' }}>
                    {children}
                </main>
                <Footer />
            </CartProvider>
        </CurrencyProvider>
    );
}
