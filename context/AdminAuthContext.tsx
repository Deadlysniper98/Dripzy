'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AdminAuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<boolean>;
    signUp: (email: string, password: string) => Promise<boolean>;
    signInWithGoogle: () => Promise<boolean>;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
    clearError: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// List of allowed admin emails
const ADMIN_EMAILS = [
    'admin@dripzy.in',
    'dasmesh@dripzy.in',
    'splashtheclash@gmail.com',
    // Add more admin emails here
];

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && ADMIN_EMAILS.includes(user.email?.toLowerCase() || '')) {
                setUser(user);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const clearError = () => setError(null);

    const signIn = async (email: string, password: string): Promise<boolean> => {
        setError(null);
        setLoading(true);

        try {
            // Check if email is in admin list
            if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
                setError('This email is not authorized as an admin');
                setLoading(false);
                return false;
            }

            const result = await signInWithEmailAndPassword(auth, email, password);
            setUser(result.user);
            setLoading(false);
            return true;
        } catch (err: any) {
            console.error('Sign in error:', err);

            // Handle specific Firebase errors
            switch (err.code) {
                case 'auth/user-not-found':
                    setError('No account found with this email');
                    break;
                case 'auth/wrong-password':
                    setError('Incorrect password');
                    break;
                case 'auth/invalid-email':
                    setError('Invalid email address');
                    break;
                case 'auth/too-many-requests':
                    setError('Too many attempts. Please try again later');
                    break;
                case 'auth/invalid-credential':
                    setError('Invalid email or password');
                    break;
                default:
                    setError(err.message || 'Failed to sign in');
            }

            setLoading(false);
            return false;
        }
    };

    const signUp = async (email: string, password: string): Promise<boolean> => {
        setError(null);
        setLoading(true);

        try {
            // Check if email is in admin list
            if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
                setError('This email is not authorized as an admin');
                setLoading(false);
                return false;
            }

            const result = await createUserWithEmailAndPassword(auth, email, password);
            setUser(result.user);
            setLoading(false);
            return true;
        } catch (err: any) {
            console.error('Sign up error:', err);

            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError('An account with this email already exists');
                    break;
                case 'auth/weak-password':
                    setError('Password should be at least 6 characters');
                    break;
                default:
                    setError(err.message || 'Failed to create account');
            }

            setLoading(false);
            return false;
        }
    };

    const signInWithGoogle = async (): Promise<boolean> => {
        setError(null);
        setLoading(true);

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const userEmail = result.user.email?.toLowerCase() || '';

            // Check if email is in admin list
            if (!ADMIN_EMAILS.includes(userEmail)) {
                // Sign out the user since they're not authorized
                await firebaseSignOut(auth);
                setError(`${result.user.email} is not authorized as an admin`);
                setLoading(false);
                return false;
            }

            setUser(result.user);
            setLoading(false);
            return true;
        } catch (err: any) {
            console.error('Google sign in error:', err);

            switch (err.code) {
                case 'auth/popup-closed-by-user':
                    setError('Sign in was cancelled');
                    break;
                case 'auth/popup-blocked':
                    setError('Pop-up was blocked. Please allow pop-ups for this site');
                    break;
                case 'auth/cancelled-popup-request':
                    // User clicked multiple times, ignore
                    break;
                default:
                    setError(err.message || 'Failed to sign in with Google');
            }

            setLoading(false);
            return false;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
        } catch (err: any) {
            console.error('Sign out error:', err);
            setError('Failed to sign out');
        }
    };

    return (
        <AdminAuthContext.Provider
            value={{
                user,
                loading,
                error,
                signIn,
                signUp,
                signInWithGoogle,
                signOut,
                isAuthenticated: !!user,
                clearError,
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
}

// Export admin emails for reference
export const AUTHORIZED_ADMIN_EMAILS = ADMIN_EMAILS;
