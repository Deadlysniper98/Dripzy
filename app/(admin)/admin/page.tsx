'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to dashboard
        router.replace('/admin/dashboard');
    }, [router]);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh'
        }}>
            <p style={{ color: '#888' }}>Redirecting to dashboard...</p>
        </div>
    );
}
