'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Star, Check, ChevronLeft, ChevronRight, MessageSquarePlus } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import ReviewForm from './ReviewForm';

interface Review {
    id: string;
    title: string;
    content: string;
    author: string;
    rating: number;
    createdAt?: any;
    verified?: boolean;
}

export const CustomerReviews = ({ productId, productName }: { productId: string; productName?: string }) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [currentX, setCurrentX] = useState(0);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const dragOffset = useRef(0);

    const [reviews, setReviews] = useState<Review[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!productId) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, `products/${productId}/reviews`), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedReviews: Review[] = [];
            snapshot.forEach((doc) => {
                fetchedReviews.push({ id: doc.id, ...doc.data() } as Review);
            });
            setReviews(fetchedReviews);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [productId]);

    const updateSlider = (position: number, animate = true) => {
        if (!trackRef.current) return;
        const track = trackRef.current;
        const parent = track.parentElement;
        if (!parent) return;

        const maxScroll = Math.max(0, track.scrollWidth - parent.offsetWidth);

        // Bounds
        let newPos = position;
        if (newPos > 0) newPos = 0;
        if (newPos < -maxScroll) newPos = -maxScroll;

        setCurrentX(newPos);

        track.style.transition = animate ? 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)' : 'none';
        track.style.transform = `translateX(${newPos}px)`;
    };

    const slide = (direction: 'next' | 'prev') => {
        if (!trackRef.current) return;
        const cardWidth = 340 + 24; // Width + Gap
        const change = direction === 'next' ? -cardWidth : cardWidth;
        updateSlider(currentX + change);
    };

    // Pointer Events Logic
    const onPointerDown = (e: React.PointerEvent) => {
        isDragging.current = true;
        startX.current = e.clientX;
        dragOffset.current = currentX;
        if (trackRef.current) {
            trackRef.current.style.transition = 'none';
            trackRef.current.setPointerCapture(e.pointerId);
        }
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!isDragging.current) return;
        const delta = e.clientX - startX.current;

        if (Math.abs(delta) > 5) {
            if (trackRef.current) {
                trackRef.current.style.transform = `translateX(${dragOffset.current + delta}px)`;
            }
        }
    };

    const onPointerUp = (e: React.PointerEvent) => {
        if (!isDragging.current) return;
        isDragging.current = false;
        const delta = e.clientX - startX.current;
        const cardWidth = 340 + 24;

        // Snap logic
        let target = dragOffset.current;
        if (Math.abs(delta) > 50) {
            // Move at least one card
            const movedCards = Math.round(delta / cardWidth);
            // If movedCards is 0 but delta > 50, force move 1
            const direction = delta > 0 ? 1 : -1;
            const jump = movedCards === 0 ? direction : movedCards;
            target = dragOffset.current + (jump * cardWidth);
        }

        // Align to grid
        target = Math.round(target / cardWidth) * cardWidth;

        updateSlider(target);
        if (trackRef.current) trackRef.current.releasePointerCapture(e.pointerId);
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
        : '5.0';

    return (
        <div id="af-rev-root">
            <section className="af-rev-section" style={{ borderTop: '1px solid #eee', marginTop: '80px', paddingTop: '80px' }}>
                <div className="af-rev-catalog-header">
                    <div className="af-rev-catalog-title">
                        <h2>Real Voices</h2>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', color: '#999', letterSpacing: '0.1em' }}>CUSTOMER REVIEWS</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
                        <div className="af-rev-metrics">
                            <div className="af-rev-rating-big">{averageRating}</div>
                            <div className="af-rev-rating-sep"></div>
                            <div className="af-rev-review-count">{reviews.length > 0 ? `${reviews.length} reviews` : 'No reviews yet'}</div>
                        </div>

                        <button onClick={() => setShowForm(true)} className="btn-premium-outline" style={{ padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MessageSquarePlus size={18} />
                            Write a Review
                        </button>

                        <div className="af-rev-slider-nav">
                            <button className="af-rev-nav-btn" onClick={() => slide('prev')} aria-label="Previous">
                                <ChevronLeft size={18} strokeWidth={2.5} />
                            </button>
                            <button className="af-rev-nav-btn" onClick={() => slide('next')} aria-label="Next">
                                <ChevronRight size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div style={{ padding: '60px', textAlign: 'center', background: '#f9f9f9', borderRadius: '24px', margin: '20px 0' }}>
                        <h3 style={{ fontWeight: 600, marginBottom: '10px' }}>No reviews yet</h3>
                        <p style={{ color: '#666', marginBottom: '20px' }}>Be the first to share your thoughts!</p>
                        <button onClick={() => setShowForm(true)} className="btn-premium">Write First Review</button>
                    </div>
                ) : (
                    <div
                        className="af-rev-slider-viewport"
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerLeave={onPointerUp}
                    >
                        <div className="af-rev-reviews-track" ref={trackRef}>
                            {reviews.map((review) => (
                                <div key={review.id} className="af-rev-review-card">
                                    <div className="af-rev-verified-tag">
                                        <Check size={10} strokeWidth={4} /> {review.verified ? 'Verified Buyer' : 'Verified Customer'}
                                    </div>
                                    <div className="af-rev-stars">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill={i <= review.rating ? "currentColor" : "#eee"} stroke="none" />)}
                                    </div>
                                    <h4 className="af-rev-review-title">{review.title}</h4>
                                    <div className="af-rev-review-content">"{review.content}"</div>
                                    <div className="af-rev-reviewer-info">
                                        <span className="af-rev-reviewer-name">{review.author}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {showForm && (
                <ReviewForm
                    productId={productId}
                    productName={productName}
                    onClose={() => setShowForm(false)}
                    onReviewAdded={() => { /* Realtime update handles it */ }}
                />
            )}
        </div>
    );
};
