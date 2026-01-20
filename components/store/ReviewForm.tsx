'use client';
import { useState } from 'react';
import { Star, Loader2, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ReviewFormProps {
    productId: string;
    productName?: string;
    onClose: () => void;
    onReviewAdded: () => void;
}

export default function ReviewForm({ productId, productName, onClose, onReviewAdded }: ReviewFormProps) {
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, `products/${productId}/reviews`), {
                rating,
                title,
                content,
                author: author.trim() || 'Verified Customer',
                createdAt: serverTimestamp(),
                productId: productId,
                productName: productName || 'Unknown Product',
                likes: 0
            });
            onReviewAdded();
            onClose();
        } catch (err) {
            console.error(err);
            alert('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="animate-slide-up" style={{
                background: '#fff', borderRadius: '24px', padding: '32px',
                width: '100%', maxWidth: '500px', position: 'relative',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '20px', right: '20px',
                    background: 'none', border: 'none', cursor: 'pointer'
                }}>
                    <X size={24} />
                </button>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>Write a Review</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Rating</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        padding: 0, color: star <= rating ? '#fbbf24' : '#e5e7eb'
                                    }}
                                >
                                    <Star size={32} fill="currentColor" stroke="none" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold mb-2 block">Name</label>
                        <input
                            value={author}
                            onChange={e => setAuthor(e.target.value)}
                            placeholder="Your Name (Optional)"
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '12px',
                                border: '1px solid #e5e7eb', fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold mb-2 block">Title</label>
                        <input
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Summarize your experience"
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '12px',
                                border: '1px solid #e5e7eb', fontSize: '1rem'
                            }}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold mb-2 block">Review</label>
                        <textarea
                            required
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="What did you like or dislike?"
                            rows={4}
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '12px',
                                border: '1px solid #e5e7eb', fontSize: '1rem', resize: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-premium"
                        style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
                    >
                        {submitting ? <Loader2 className="af-spin" /> : 'Submit Review'}
                    </button>
                </form>
            </div>
        </div>
    );
}
