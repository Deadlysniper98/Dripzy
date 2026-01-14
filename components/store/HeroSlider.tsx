'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface HeroSlide {
    image: string;
    mobileImage?: string;
    link: string;
    alt?: string;
}

interface HeroSliderProps {
    config?: {
        slides: HeroSlide[];
    };
}

const DEFAULT_SLIDES: HeroSlide[] = [
    {
        image: 'https://cdn.shopify.com/s/files/1/0226/7407/9819/files/Desktop_Poster.png?v=1763107337',
        mobileImage: 'https://cdn.shopify.com/s/files/1/0226/7407/9819/files/Mobile_Poster.png?v=1763108538',
        link: '/products',
        alt: 'Elite Gaming Mouse'
    },
    {
        image: 'https://cdn.shopify.com/s/files/1/0226/7407/9819/files/1.1_Tracker_One_Website_Banner_75349e34-62aa-4147-abbf-5dacb81e37fa.png?v=1758799266',
        mobileImage: 'https://cdn.shopify.com/s/files/1/0226/7407/9819/files/Mobile_Banner_2.png?v=1758205024',
        link: '/products',
        alt: 'Tracker One'
    }
];

export const HeroSlider = ({ config }: HeroSliderProps) => {
    // Robust check for slides array
    const slides = Array.isArray(config?.slides) && config.slides.length > 0
        ? config.slides
        : DEFAULT_SLIDES;

    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateSlider = useCallback((index: number) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrent(index);
        setTimeout(() => setIsTransitioning(false), 800);
    }, [isTransitioning]);

    const handleNext = useCallback(() => {
        const nextIndex = (current + 1) % slides.length;
        updateSlider(nextIndex);
        resetAutoplay();
    }, [current, slides.length, updateSlider]);

    const handlePrev = useCallback(() => {
        const prevIndex = (current - 1 + slides.length) % slides.length;
        updateSlider(prevIndex);
        resetAutoplay();
    }, [current, slides.length, updateSlider]);

    const startAutoplay = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            if (!isTransitioning) {
                setCurrent(prev => (prev + 1) % (slides.length || 1));
            }
        }, 5000);
    }, [isTransitioning, slides.length]);

    const resetAutoplay = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = setTimeout(() => {
            startAutoplay();
        }, 7000);
    }, [startAutoplay]);

    useEffect(() => {
        startAutoplay();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        };
    }, [startAutoplay]);

    // Touch Swipe Logic
    const touchStartX = useRef(0);
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? handleNext() : handlePrev();
        } else {
            resetAutoplay();
        }
    };

    // Ensure current is always within bounds if slides change
    useEffect(() => {
        if (current >= slides.length) {
            setCurrent(0);
        }
    }, [slides.length, current]);

    return (
        <section className="af-bnr-hero-section">
            <style dangerouslySetInnerHTML={{
                __html: `
                .af-bnr-hero-section {
                    padding: 110px 24px 40px 24px; 
                    max-width: 1440px;
                    margin: 0 auto;
                    box-sizing: border-box;
                }

                .af-bnr-container {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 1908 / 1000; 
                    border-radius: 40px;
                    overflow: hidden;
                    background: #000;
                    box-shadow: 0 30px 70px rgba(0,0,0,0.1);
                }

                .af-bnr-track {
                    display: flex;
                    height: 100%;
                    transition: transform 0.8s cubic-bezier(0.65, 0, 0.35, 1);
                }

                .af-bnr-slide {
                    min-width: 100%;
                    height: 100%;
                    position: relative;
                    overflow: hidden;
                    display: block; 
                    text-decoration: none;
                }

                .af-bnr-slide picture, .af-bnr-slide img {
                    width: 100%;
                    height: 100%;
                    display: block;
                }

                .af-bnr-slide img {
                    object-fit: cover; 
                    object-position: center;
                    transition: transform 10s linear;
                }

                .af-bnr-slide.active img {
                    transform: scale(1.08);
                }

                .af-bnr-slide::after {
                    content: '';
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    height: 25%;
                    background: linear-gradient(to top, rgba(0,0,0,0.3), transparent);
                    pointer-events: none;
                }

                .af-bnr-nav {
                    position: absolute;
                    top: 50%; left: 0; right: 0;
                    transform: translateY(-50%);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 40px;
                    pointer-events: none;
                    z-index: 20;
                    opacity: 0;
                    transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .af-bnr-container:hover .af-bnr-nav { opacity: 1; }

                .af-bnr-nav-btn {
                    width: 56px; height: 56px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: auto;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: #fff;
                }

                .af-bnr-nav-btn:hover {
                    background: rgba(255, 255, 255, 0.95);
                    color: #000;
                    transform: scale(1.05);
                }

                .af-bnr-nav-btn svg {
                    width: 24px;
                    height: 24px;
                }

                .af-bnr-dots {
                    position: absolute;
                    bottom: 40px; left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 12px;
                    z-index: 10;
                    padding: 10px 20px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    border-radius: 40px;
                }

                .af-bnr-dot {
                    width: 8px; height: 8px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    cursor: pointer;
                    transition: all 0.4s;
                }

                .af-bnr-dot.active {
                    background: #fff;
                    width: 32px;
                    border-radius: 10px;
                }

                @media (max-width: 768px) {
                    .af-bnr-hero-section { padding: 90px 15px 20px 15px; }
                    .af-bnr-container { aspect-ratio: 1 / 1; border-radius: 30px; }
                    .af-bnr-nav { display: none; }
                    .af-bnr-dots { bottom: 25px; }
                }
            ` }} />

            <div
                className="af-bnr-container"
                onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current); }}
                onMouseLeave={() => { if (!resumeTimeoutRef.current) startAutoplay(); }}
            >
                <div
                    className="af-bnr-track"
                    style={{ transform: `translateX(-${current * 100 || 0}%)` }}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {slides.map((slide, i) => (
                        <Link
                            key={i}
                            href={slide.link || '/'}
                            className={`af-bnr-slide ${current === i ? 'active' : ''}`}
                        >
                            <picture>
                                {slide.mobileImage && (
                                    <source media="(max-width: 768px)" srcSet={slide.mobileImage} />
                                )}
                                <img src={slide.image || '/placeholder-banner.jpg'} alt={slide.alt || ''} />
                            </picture>
                        </Link>
                    ))}
                </div>

                {slides.length > 1 && (
                    <>
                        <div className="af-bnr-dots">
                            {slides.map((_, i) => (
                                <div
                                    key={i}
                                    className={`af-bnr-dot ${current === i ? 'active' : ''}`}
                                    onClick={() => updateSlider(i)}
                                />
                            ))}
                        </div>

                        <div className="af-bnr-nav">
                            <button className="af-bnr-nav-btn" onClick={(e) => { e.preventDefault(); handlePrev(); }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                            <button className="af-bnr-nav-btn" onClick={(e) => { e.preventDefault(); handleNext(); }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};
