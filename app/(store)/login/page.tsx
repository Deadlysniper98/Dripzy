'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { user, signInWithGoogle, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/account');
        }
    }, [user, loading, router]);

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', padding: '24px' }}>
            <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#fff', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Welcome Back</div>
                <p style={{ color: '#666', marginBottom: '32px' }}>Sign in to manage your orders</p>

                <button
                    onClick={handleGoogleSignIn}
                    style={{
                        width: '100%',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        backgroundColor: '#fff',
                        border: '1px solid #e5e5e5',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                >
                    <img
                        src="https://www.google.com/favicon.ico"
                        alt="Google"
                        style={{ width: '20px', height: '20px' }}
                    />
                    Continue with Google
                </button>
            </div>
            <div style={{ marginTop: '24px', color: '#888', fontSize: '0.85rem' }}>
                By continuing, you agree to our Terms of Service and Privacy Policy.
            </div>
        </div>
    );
}
