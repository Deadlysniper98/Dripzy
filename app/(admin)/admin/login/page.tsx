'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

// Google Icon SVG Component
const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
);

export default function AdminLoginPage() {
    const router = useRouter();
    const { signIn, signInWithGoogle, error: authError, loading: authLoading, clearError } = useAdminAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        clearError();

        const success = await signIn(email, password);

        if (success) {
            router.push('/admin/dashboard');
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        clearError();
        setIsGoogleLoading(true);

        const success = await signInWithGoogle();

        if (success) {
            router.push('/admin/dashboard');
        }

        setIsGoogleLoading(false);
    };

    const displayError = error || authError;

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f7',
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '380px'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#000',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>D</span>
                    </div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 600, margin: '0 0 4px', color: '#000' }}>
                        Admin Login
                    </h1>
                    <p style={{ color: '#888', fontSize: '0.85rem', margin: 0 }}>
                        Sign in to access the dashboard
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    border: '1px solid #eee',
                    padding: '28px'
                }}>
                    {/* Error Message */}
                    {displayError && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px 14px',
                            backgroundColor: '#fef2f2',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            color: '#dc2626',
                            fontSize: '0.85rem'
                        }}>
                            <AlertCircle size={16} />
                            <span style={{ flex: 1 }}>{displayError}</span>
                        </div>
                    )}

                    {/* Google Sign In Button */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={authLoading || isGoogleLoading}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: '#fff',
                            border: '1px solid #e5e5e5',
                            borderRadius: '10px',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            cursor: (authLoading || isGoogleLoading) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            marginBottom: '20px',
                            transition: 'all 0.2s',
                            opacity: (authLoading || isGoogleLoading) ? 0.6 : 1
                        }}
                    >
                        {isGoogleLoading ? (
                            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <GoogleIcon />
                        )}
                        {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
                    </button>

                    {/* Divider */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '20px'
                    }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
                        <span style={{ padding: '0 14px', color: '#999', fontSize: '0.8rem' }}>or</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: '#eee' }}></div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 500, color: '#555' }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@dripzy.in"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '11px 12px 11px 38px',
                                        border: '1px solid #e5e5e5',
                                        borderRadius: '10px',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 500, color: '#555' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '11px 40px 11px 38px',
                                        border: '1px solid #e5e5e5',
                                        borderRadius: '10px',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#999',
                                        padding: '4px'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={authLoading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: authLoading ? '#666' : '#000',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                cursor: authLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {authLoading && !isGoogleLoading ? (
                                <>
                                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '20px',
                    fontSize: '0.8rem',
                    color: '#999'
                }}>
                    Only authorized admins can access this portal
                </p>
            </div>

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
