'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simple demo authentication - replace with Firebase Auth
        if (email === 'admin@dripzy.in' && password === 'admin123') {
            localStorage.setItem('adminAuth', 'true');
            router.push('/admin/dashboard');
        } else {
            setError('Invalid email or password');
        }
        setLoading(false);
    };

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
                maxWidth: '420px',
                backgroundColor: '#fff',
                borderRadius: '24px',
                padding: '48px 40px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: '#000',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px'
                    }}>
                        <Lock size={28} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px' }}>Admin Portal</h1>
                    <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>Sign in to Dripzy Admin Dashboard</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '14px 16px',
                        backgroundColor: '#fef2f2',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        color: '#dc2626',
                        fontSize: '0.9rem'
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>
                            Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@dripzy.in"
                                required
                                style={{
                                    width: '100%',
                                    padding: '14px 16px 14px 48px',
                                    border: '1px solid #e5e5e5',
                                    borderRadius: '12px',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: '100%',
                                    padding: '14px 48px 14px 48px',
                                    border: '1px solid #e5e5e5',
                                    borderRadius: '12px',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#888'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            backgroundColor: loading ? '#666' : '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Demo Credentials */}
                <div style={{
                    marginTop: '32px',
                    padding: '16px',
                    backgroundColor: '#f5f5f7',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    color: '#666',
                    textAlign: 'center'
                }}>
                    <strong>Demo Credentials:</strong><br />
                    Email: admin@dripzy.in<br />
                    Password: admin123
                </div>
            </div>
        </div>
    );
}
