'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const SLIDES = [
    { id: 1, img: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2600&auto=format&fit=crop', alt: 'Next Gen Electronics' },
    { id: 2, img: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=2600&auto=format&fit=crop', alt: 'Premium Accessories' },
    { id: 3, img: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=2600&auto=format&fit=crop', alt: 'Apple Ecosystem' },
];

export const HeroSlider = () => {
    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);

    // Clone first slide for infinite loop illusion
    const extendedSlides = [...SLIDES, SLIDES[0]];

    useEffect(() => {
        const timer = setInterval(() => {
            handleNext();
        }, 5000);
        return () => clearInterval(timer);
    }, [current]);

    const handleTransitionEnd = () => {
        if (current === SLIDES.length) {
            setIsTransitioning(false);
            setCurrent(0);
        }
    };

    const handleNext = () => {
        if (!isTransitioning) setIsTransitioning(true);
        setCurrent((prev) => prev + 1);
    };

    const handlePrev = () => {
        if (current === 0) {
            setIsTransitioning(false);
            setCurrent(SLIDES.length);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsTransitioning(true);
                    setCurrent(SLIDES.length - 1);
                });
            });
        } else {
            if (!isTransitioning) setIsTransitioning(true);
            setCurrent((prev) => prev - 1);
        }
    };

    return (
        <div className="af-slider-system" id="af-bnr-root">
            <section className="af-bnr-hero-section">
                <div className="af-bnr-container">
                    <div
                        className="af-bnr-track"
                        style={{
                            transform: `translateX(-${current * 100}%)`,
                            transition: isTransitioning ? 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)' : 'none'
                        }}
                        onTransitionEnd={handleTransitionEnd}
                    >
                        {extendedSlides.map((slide, index) => (
                            <div key={`${slide.id}-${index}`} className={`af-bnr-slide ${index === current ? 'active' : ''}`}>
                                <img src={slide.img} alt={slide.alt} />
                                <div style={{
                                    position: 'absolute', bottom: '100px', left: '60px', color: 'white', zIndex: 10, maxWidth: '600px'
                                }}>
                                    <h2 style={{ fontSize: '3rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                                        {slide.alt}
                                    </h2>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="af-bnr-dots">
                        {SLIDES.map((_, i) => (
                            <div
                                key={i}
                                className={`af-bnr-dot ${i === (current % SLIDES.length) ? 'active' : ''}`}
                                onClick={() => {
                                    setIsTransitioning(true);
                                    setCurrent(i);
                                }}
                            />
                        ))}
                    </div>

                    <div className="af-bnr-nav">
                        <button className="af-bnr-nav-btn" onClick={handlePrev}><ArrowLeft size={20} /></button>
                        <button className="af-bnr-nav-btn" onClick={handleNext}><ArrowRight size={20} /></button>
                    </div>
                </div>
            </section>
        </div>
    );
};
