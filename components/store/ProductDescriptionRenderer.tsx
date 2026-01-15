'use client';

import { useEffect, useState, useRef } from 'react';

interface ProductDescriptionRendererProps {
    htmlContent: string;
}

export default function ProductDescriptionRenderer({ htmlContent }: ProductDescriptionRendererProps) {
    const [chunks, setChunks] = useState<any[]>([]);

    useEffect(() => {
        if (!htmlContent) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const body = doc.body;
        const newChunks: any[] = [];
        let currentImageGroup: string[] = [];

        // Helper to check if a node is "just an image" container
        const isImageNode = (node: Node): string | null => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                // Direct image
                if (el.tagName === 'IMG') return (el as HTMLImageElement).src;

                // Div or P containing only an image
                if (['DIV', 'P', 'FIGURE'].includes(el.tagName)) {
                    const imgs = el.getElementsByTagName('img');
                    // Check if it has exactly one image and no significant text
                    if (imgs.length === 1 && el.textContent?.trim() === '') {
                        return imgs[0].src;
                    }
                }
            }
            return null;
        };

        Array.from(body.childNodes).forEach((node) => {
            const imgSrc = isImageNode(node);

            if (imgSrc) {
                currentImageGroup.push(imgSrc);
            } else {
                // If we have a group of images waiting, push them as a carousel chunk
                if (currentImageGroup.length > 0) {
                    newChunks.push({ type: 'carousel', images: [...currentImageGroup] });
                    currentImageGroup = [];
                }

                // Push the non-image node as standard HTML
                if (node.nodeType === Node.ELEMENT_NODE) {
                    newChunks.push({ type: 'html', content: (node as HTMLElement).outerHTML });
                } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
                    newChunks.push({ type: 'html', content: `<p>${node.textContent}</p>` });
                }
            }
        });

        // Flush any remaining images
        if (currentImageGroup.length > 0) {
            newChunks.push({ type: 'carousel', images: [...currentImageGroup] });
        }

        setChunks(newChunks);

    }, [htmlContent]);

    return (
        <div className="description-renderer">
            {chunks.map((chunk, idx) => {
                if (chunk.type === 'carousel') {
                    // Don't render single images as a carousel, just normal full width
                    if (chunk.images.length === 1) {
                        return (
                            <div key={idx} style={{ margin: '24px 0', borderRadius: '12px', overflow: 'hidden' }}>
                                <img src={chunk.images[0]} alt="Product detail" style={{ width: '100%', display: 'block' }} />
                            </div>
                        );
                    }

                    return (
                        <div key={idx} style={{
                            margin: '32px -24px', // Negative margin to break out of container padding if needed, or just normal margin
                            display: 'flex',
                            overflowX: 'auto',
                            gap: '16px',
                            padding: '0 24px',
                            scrollSnapType: 'x mandatory',
                            scrollbarWidth: 'none', // Firefox
                            msOverflowStyle: 'none' // IE/Edge
                        }} className="hide-scrollbar">
                            <style jsx>{`
                                .hide-scrollbar::-webkit-scrollbar {
                                    display: none;
                                }
                            `}</style>
                            {chunk.images.map((src: string, imgIdx: number) => (
                                <div key={imgIdx} style={{
                                    flex: '0 0 85%', // Show mostly one image but peek the next
                                    scrollSnapAlign: 'center',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    aspectRatio: '1', // Or allow natural height? Let's try natural but capped
                                    backgroundColor: '#fff'
                                }}>
                                    <img
                                        src={src}
                                        alt={`Detail ${imgIdx + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    );
                } else {
                    return (
                        <div
                            key={idx}
                            dangerouslySetInnerHTML={{ __html: chunk.content }}
                            style={{ marginBottom: '16px', lineHeight: '1.6', color: '#333' }}
                        />
                    );
                }
            })}
        </div>
    );
}
