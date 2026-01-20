'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collectionGroup, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { Loader2, Trash2, Star, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Review {
    id: string;
    productId?: string;
    productName?: string;
    rating: number;
    title: string;
    content: string;
    author: string;
    createdAt?: Timestamp;
    path: string; // To know the exact path for deletion
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            // Note: complex queries with collectionGroup might require an index. 
            // If this fails initially, we might need to click the link in console to create index.
            // For now, let's try a simple fetch and sort client-side if needed, 
            // or rely on the fact that we might not have many reviews yet.

            // Using a simple query first to avoid index issues immediately if possible
            const reviewsQuery = query(collectionGroup(db, 'reviews'));

            const snapshot = await getDocs(reviewsQuery);
            const fetchedReviews: Review[] = [];

            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                // Determine productId from parent path if not stored
                // path: products/{productId}/reviews/{reviewId}
                const pathSegments = docSnap.ref.path.split('/');
                const derivedProductId = pathSegments.length >= 3 ? pathSegments[1] : undefined;

                fetchedReviews.push({
                    id: docSnap.id,
                    path: docSnap.ref.path,
                    productId: data.productId || derivedProductId,
                    productName: data.productName,
                    rating: data.rating,
                    title: data.title,
                    content: data.content,
                    author: data.author,
                    createdAt: data.createdAt,
                });
            });

            // Client-side sort by createdAt desc
            fetchedReviews.sort((a, b) => {
                const timeA = a.createdAt?.toMillis() || 0;
                const timeB = b.createdAt?.toMillis() || 0;
                return timeB - timeA;
            });

            setReviews(fetchedReviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            alert('Failed to load reviews. Check console for details (may need index).');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (review: Review) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        setDeletingId(review.id);
        try {
            await deleteDoc(doc(db, review.path));
            setReviews(prev => prev.filter(r => r.id !== review.id));
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
                <Loader2 size={40} className="af-spin" style={{ color: '#000' }} />
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Reviews</h1>
                    <p style={{ color: '#666' }}>Manage customer reviews across all products</p>
                </div>
                <div style={{ background: '#fff', padding: '10px 20px', borderRadius: '12px', border: '1px solid #eee', fontWeight: 600 }}>
                    {reviews.length} Total Reviews
                </div>
            </div>

            {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px', background: '#fff', borderRadius: '24px', border: '1px solid #eee' }}>
                    <MessageSquare size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>No reviews found</h3>
                    <p style={{ color: '#888' }}>When customers submit reviews, they will appear here.</p>
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #eee', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #eee', background: '#f9fafb' }}>
                                <th style={{ textAlign: 'left', padding: '20px', fontSize: '0.85rem', color: '#666', fontWeight: 600 }}>Date</th>
                                <th style={{ textAlign: 'left', padding: '20px', fontSize: '0.85rem', color: '#666', fontWeight: 600 }}>Product</th>
                                <th style={{ textAlign: 'left', padding: '20px', fontSize: '0.85rem', color: '#666', fontWeight: 600 }}>Rating</th>
                                <th style={{ textAlign: 'left', padding: '20px', fontSize: '0.85rem', color: '#666', fontWeight: 600 }}>Review</th>
                                <th style={{ textAlign: 'left', padding: '20px', fontSize: '0.85rem', color: '#666', fontWeight: 600 }}>Author</th>
                                <th style={{ textAlign: 'right', padding: '20px', fontSize: '0.85rem', color: '#666', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((review) => (
                                <tr key={review.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '20px', fontSize: '0.9rem', color: '#666', whiteSpace: 'nowrap' }}>
                                        {review.createdAt ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>
                                            {review.productName || 'Unknown Product'}
                                        </div>
                                        <Link href={`/product/${review.productId}`} target="_blank" style={{ fontSize: '0.8rem', color: '#667eea', textDecoration: 'none' }}>
                                            View Product
                                        </Link>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', gap: '2px' }}>
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} size={14} fill={s <= review.rating ? '#fbbf24' : '#e5e7eb'} stroke="none" />
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px', maxWidth: '400px' }}>
                                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{review.title}</div>
                                        <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5 }}>
                                            {review.content.length > 100 ? `${review.content.substring(0, 100)}...` : review.content}
                                        </div>
                                    </td>
                                    <td style={{ padding: '20px', fontSize: '0.9rem' }}>
                                        {review.author}
                                    </td>
                                    <td style={{ padding: '20px', textAlign: 'right' }}>
                                        <button
                                            onClick={() => handleDelete(review)}
                                            disabled={deletingId === review.id}
                                            style={{
                                                background: '#fee2e2',
                                                color: '#ef4444',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            title="Delete Review"
                                        >
                                            {deletingId === review.id ? <Loader2 size={18} className="af-spin" /> : <Trash2 size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
