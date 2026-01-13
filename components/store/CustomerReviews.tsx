'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Star, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const REVIEWS = [
    {
        id: 1,
        title: "Best Charger Ever",
        content: "Solid connection, fast charging. This MagSafe charger is definitely the best one I've used so far. The magnet is super strong.",
        author: "Rahul M.",
        product: "MagSafe Wireless Charger"
    },
    {
        id: 2,
        title: "Crystal Clear",
        content: "The clear case is actually non-yellowing. 3 months in and it still looks brand new. Shows off my iPhone color perfectly.",
        author: "Sarah J.",
        product: "Crystal Clear Case"
    },
    {
        id: 3,
        title: "Super Durable",
        content: "Love the braided cable, feels super durable like it will last for years. Fast charging works exactly as advertised.",
        author: "Mike T.",
        product: "USB-C Fast Cable"
    },
    {
        id: 4,
        title: "Unmatched Sound",
        content: "Sound quality on these headphones is unmatched for the price. The noise cancellation is surprisingly good for commuting.",
        author: "Ananya S.",
        product: "Dripzy Pro Headphones"
    },
    {
        id: 5,
        title: "Sleek Protection",
        content: "Perfect fit for my MacBook Air. The sleeve is sleek and water resistant. Fits in my backpack without adding bulk.",
        author: "David L.",
        product: "MacBook Air Sleeve"
    },
    {
        id: 6,
        title: "Game Changer",
        content: "The iPad stand completely changed my workflow. Very sturdy aluminum build. Highly recommend for artists.",
        author: "Priya K.",
        product: "Aluminum Tablet Stand"
    }
];

export const CustomerReviews = () => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [currentX, setCurrentX] = useState(0);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const dragOffset = useRef(0);

    const updateSlider = (position: number, animate = true) => {
        if (!trackRef.current) return;
        const track = trackRef.current;
        const parent = track.parentElement;
        if (!parent) return;

        const maxScroll = track.scrollWidth - parent.offsetWidth;

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

    return (
        <div id="af-rev-root">
            <section className="af-rev-section">
                <div className="af-rev-catalog-header">
                    <div className="af-rev-catalog-title">
                        <h2>Real Voices</h2>
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', color: '#999', letterSpacing: '0.1em' }}>CUSTOMER REVIEWS</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <div className="af-rev-metrics">
                            <div className="af-rev-rating-big">4.8</div>
                            <div className="af-rev-rating-sep"></div>
                            <div className="af-rev-review-count">12k+ reviews</div>
                        </div>

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

                <div
                    className="af-rev-slider-viewport"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                >
                    <div className="af-rev-reviews-track" ref={trackRef}>
                        {REVIEWS.map((review) => (
                            <div key={review.id} className="af-rev-review-card">
                                <div className="af-rev-verified-tag">
                                    <Check size={10} strokeWidth={4} /> Verified Buyer
                                </div>
                                <div className="af-rev-stars">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" stroke="none" />)}
                                </div>
                                <h4 className="af-rev-review-title">{review.title}</h4>
                                <div className="af-rev-review-content">"{review.content}"</div>
                                <div className="af-rev-reviewer-info">
                                    <span className="af-rev-reviewer-name">{review.author}</span>
                                    <span className="af-rev-product-tag">{review.product}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
