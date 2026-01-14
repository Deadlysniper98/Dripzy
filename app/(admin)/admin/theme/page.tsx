'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Save,
    Image as ImageIcon,
    Layout,
    Box,
    ShoppingBag,
    Plus,
    X,
    Loader2,
    RefreshCw,
    Eye,
    Upload,
    GripVertical,
    Trash2,
    Link as LinkIcon
} from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface HeroSlide {
    image: string;
    mobileImage?: string;
    link: string;
    alt?: string;
}

interface ThemeConfig {
    hero: {
        slides: HeroSlide[];
    };
    categories: {
        name: string;
        image: string;
        link: string;
    }[];
    featuredProducts: string[]; // Array of product IDs
    announcement: {
        text: string;
        enabled: boolean;
        backgroundColor: string;
    };
}

const DEFAULT_CONFIG: ThemeConfig = {
    hero: {
        slides: [
            {
                image: 'https://cdn.shopify.com/s/files/1/0226/7407/9819/files/Desktop_Poster.png?v=1763107337',
                mobileImage: 'https://cdn.shopify.com/s/files/1/0226/7407/9819/files/Mobile_Poster.png?v=1763108538',
                link: '/products',
                alt: 'Elite Gaming Mouse'
            }
        ]
    },
    categories: [
        { name: 'Classic Cases', image: 'https://images.unsplash.com/photo-1603313011101-31c726a55018', link: '/products?category=Cases' },
        { name: 'Power Gear', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0', link: '/products?category=Chargers' },
        { name: 'Smart Audio', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b', link: '/products?category=Audio' }
    ],
    featuredProducts: [],
    announcement: {
        text: 'FREE SHIPPING ON ALL ORDERS OVER ₹999',
        enabled: true,
        backgroundColor: '#000000'
    }
};

export default function ThemePage() {
    const [config, setConfig] = useState<ThemeConfig>(DEFAULT_CONFIG);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<'hero' | 'categories' | 'products' | 'general'>('hero');
    const [draggedSlideIdx, setDraggedSlideIdx] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Theme Config
            const themeDoc = await getDoc(doc(db, 'settings', 'theme'));
            if (themeDoc.exists()) {
                const data = themeDoc.data();
                // Ensure hero slides match new structure
                const loadedConfig = { ...DEFAULT_CONFIG, ...data };
                if (data.hero?.slides) {
                    loadedConfig.hero.slides = data.hero.slides.map((s: any) => ({
                        image: s.image || '',
                        mobileImage: s.mobileImage || '',
                        link: s.link || s.buttonLink || '',
                        alt: s.alt || s.title || ''
                    }));
                }
                setConfig(loadedConfig);
            }

            // Fetch Products for selection
            const productSnap = await getDocs(collection(db, 'products'));
            const productList = productSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(productList);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'theme'), config);
            alert('Theme saved successfully!');
        } catch (error) {
            console.error('Error saving theme:', error);
            alert('Failed to save theme');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (index: number, type: 'image' | 'mobileImage', file: File) => {
        const sRef = ref(storage, `banners/slide_${index}_${type}_${Date.now()}`);
        try {
            await uploadBytes(sRef, file);
            const url = await getDownloadURL(sRef);
            const newSlides = [...config.hero.slides];
            newSlides[index] = { ...newSlides[index], [type]: url };
            setConfig({ ...config, hero: { slides: newSlides } });
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image.');
        }
    };

    const onSlideDragStart = (index: number) => setDraggedSlideIdx(index);
    const onSlideDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedSlideIdx === null || draggedSlideIdx === index) return;

        const newSlides = [...config.hero.slides];
        const item = newSlides[draggedSlideIdx];
        newSlides.splice(draggedSlideIdx, 1);
        newSlides.splice(index, 0, item);
        setConfig({ ...config, hero: { slides: newSlides } });
        setDraggedSlideIdx(index);
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={40} className="animate-spin" />
            </div>
        );
    }

    return (
        <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Theme Editor</h1>
                    <p style={{ color: '#666', marginTop: '4px' }}>Customize your store appearance and homepage content.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => window.open('/', '_blank')}
                        style={{ padding: '12px 24px', backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                    >
                        <Eye size={20} /> Preview Store
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: saving ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px' }}>
                {/* Editor Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                        onClick={() => setActiveSection('hero')}
                        style={{ padding: '16px', borderRadius: '12px', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', fontWeight: 600, backgroundColor: activeSection === 'hero' ? '#f5f5f7' : 'transparent', color: activeSection === 'hero' ? '#000' : '#666' }}>
                        <Layout size={20} /> Hero Slider
                    </button>
                    <button
                        onClick={() => setActiveSection('categories')}
                        style={{ padding: '16px', borderRadius: '12px', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', fontWeight: 600, backgroundColor: activeSection === 'categories' ? '#f5f5f7' : 'transparent', color: activeSection === 'categories' ? '#000' : '#666' }}>
                        <Box size={20} /> Categories Grid
                    </button>
                    <button
                        onClick={() => setActiveSection('products')}
                        style={{ padding: '16px', borderRadius: '12px', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', fontWeight: 600, backgroundColor: activeSection === 'products' ? '#f5f5f7' : 'transparent', color: activeSection === 'products' ? '#000' : '#666' }}>
                        <ShoppingBag size={20} /> Featured Products
                    </button>
                    <button
                        onClick={() => setActiveSection('general')}
                        style={{ padding: '16px', borderRadius: '12px', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', fontWeight: 600, backgroundColor: activeSection === 'general' ? '#f5f5f7' : 'transparent', color: activeSection === 'general' ? '#000' : '#666' }}>
                        <RefreshCw size={20} /> Global Settings
                    </button>
                </div>

                {/* Editor Content */}
                <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '24px', padding: '32px' }}>
                    {activeSection === 'hero' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Banner Slider Banners</h2>
                                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>Drag and drop to reorder. Upload separate images for Mobile.</p>
                                </div>
                                <button
                                    onClick={() => setConfig({ ...config, hero: { slides: [...config.hero.slides, { image: '', mobileImage: '', link: '', alt: '' }] } })}
                                    style={{ padding: '8px 16px', backgroundColor: '#f5f5f7', border: 'none', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Plus size={16} /> Add Slide
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {config.hero.slides.map((slide, idx) => (
                                    <div
                                        key={idx}
                                        draggable
                                        onDragStart={() => onSlideDragStart(idx)}
                                        onDragOver={(e) => onSlideDragOver(e, idx)}
                                        onDragEnd={() => setDraggedSlideIdx(null)}
                                        style={{
                                            padding: '24px',
                                            border: '1px solid #eee',
                                            borderRadius: '20px',
                                            display: 'flex',
                                            gap: '24px',
                                            opacity: draggedSlideIdx === idx ? 0.5 : 1,
                                            transition: 'all 0.2s',
                                            backgroundColor: '#fff'
                                        }}
                                    >
                                        <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: '#ccc' }}>
                                            <GripVertical size={20} />
                                        </div>

                                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
                                            {/* Previews */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>Desktop Banner (1908x1000)</label>
                                                    <div style={{
                                                        width: '100%',
                                                        aspectRatio: '1908/1000',
                                                        backgroundColor: '#f5f5f7',
                                                        borderRadius: '10px',
                                                        overflow: 'hidden',
                                                        border: '1px solid #eee',
                                                        position: 'relative',
                                                        cursor: 'pointer'
                                                    }} onClick={() => document.getElementById(`hero-file-desktop-${idx}`)?.click()}>
                                                        {slide.image ? (
                                                            <img src={slide.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                                                                <Upload size={24} />
                                                            </div>
                                                        )}
                                                        <input
                                                            id={`hero-file-desktop-${idx}`}
                                                            type="file"
                                                            hidden
                                                            accept="image/*"
                                                            onChange={(e) => e.target.files?.[0] && handleFileUpload(idx, 'image', e.target.files[0])}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: '8px' }}>Mobile Banner (1:1)</label>
                                                    <div style={{
                                                        width: '100px',
                                                        aspectRatio: '1',
                                                        backgroundColor: '#f5f5f7',
                                                        borderRadius: '10px',
                                                        overflow: 'hidden',
                                                        border: '1px solid #eee',
                                                        position: 'relative',
                                                        cursor: 'pointer'
                                                    }} onClick={() => document.getElementById(`hero-file-mobile-${idx}`)?.click()}>
                                                        {slide.mobileImage ? (
                                                            <img src={slide.mobileImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa' }}>
                                                                <Upload size={20} />
                                                            </div>
                                                        )}
                                                        <input
                                                            id={`hero-file-mobile-${idx}`}
                                                            type="file"
                                                            hidden
                                                            accept="image/*"
                                                            onChange={(e) => e.target.files?.[0] && handleFileUpload(idx, 'mobileImage', e.target.files[0])}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Details */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>Action Link</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <LinkIcon size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                                                        <input
                                                            type="text"
                                                            value={slide.link}
                                                            placeholder="/products/category-name"
                                                            onChange={(e) => {
                                                                const newSlides = [...config.hero.slides];
                                                                newSlides[idx].link = e.target.value;
                                                                setConfig({ ...config, hero: { slides: newSlides } });
                                                            }}
                                                            style={{ width: '100%', padding: '12px 12px 12px 40px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '0.9rem' }}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>Alt Text (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={slide.alt || ''}
                                                        placeholder="e.g. New Summer Collection"
                                                        onChange={(e) => {
                                                            const newSlides = [...config.hero.slides];
                                                            newSlides[idx].alt = e.target.value;
                                                            setConfig({ ...config, hero: { slides: newSlides } });
                                                        }}
                                                        style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '0.9rem' }}
                                                    />
                                                </div>
                                                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Remove this slide?')) {
                                                                const newSlides = config.hero.slides.filter((_, i) => i !== idx);
                                                                setConfig({ ...config, hero: { slides: newSlides } });
                                                            }
                                                        }}
                                                        style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}
                                                    >
                                                        <Trash2 size={16} /> Remove Slide
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'categories' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Categories Grid</h2>
                                <button
                                    onClick={() => setConfig({ ...config, categories: [...config.categories, { name: 'New Category', image: '', link: '#' }] })}
                                    style={{ padding: '8px 16px', backgroundColor: '#f5f5f7', border: 'none', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>+ Add Row</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {config.categories.map((cat, idx) => (
                                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '60px 1.5fr 2fr 1fr 40px', gap: '16px', alignItems: 'center', padding: '16px', border: '1px solid #eee', borderRadius: '16px' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f5f5f7', border: '1px solid #eee' }}>
                                            <img src={cat.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <input
                                            type="text"
                                            value={cat.name}
                                            onChange={(e) => {
                                                const newCats = [...config.categories];
                                                newCats[idx].name = e.target.value;
                                                setConfig({ ...config, categories: newCats });
                                            }}
                                            placeholder="Label (e.g. Cases)"
                                            style={{ padding: '10px', border: '1px solid #eee', borderRadius: '10px', fontSize: '0.9rem' }}
                                        />
                                        <input
                                            type="text"
                                            value={cat.image}
                                            onChange={(e) => {
                                                const newCats = [...config.categories];
                                                newCats[idx].image = e.target.value;
                                                setConfig({ ...config, categories: newCats });
                                            }}
                                            placeholder="Image URL"
                                            style={{ padding: '10px', border: '1px solid #eee', borderRadius: '10px', fontSize: '0.9rem' }}
                                        />
                                        <input
                                            type="text"
                                            value={cat.link}
                                            onChange={(e) => {
                                                const newCats = [...config.categories];
                                                newCats[idx].link = e.target.value;
                                                setConfig({ ...config, categories: newCats });
                                            }}
                                            placeholder="Link (/products?cat=...)"
                                            style={{ padding: '10px', border: '1px solid #eee', borderRadius: '10px', fontSize: '0.9rem' }}
                                        />
                                        <button
                                            onClick={() => {
                                                const newCats = config.categories.filter((_, i) => i !== idx);
                                                setConfig({ ...config, categories: newCats });
                                            }}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={20} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'products' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Featured on Homepage</h2>
                                <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '4px' }}>Select products to display in the "Best Sellers" row.</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                                {products.map((p) => {
                                    const isSelected = config.featuredProducts.includes(p.id);
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => {
                                                const newFeatured = isSelected
                                                    ? config.featuredProducts.filter(id => id !== p.id)
                                                    : [...config.featuredProducts, p.id];
                                                setConfig({ ...config, featuredProducts: newFeatured });
                                            }}
                                            style={{ padding: '12px', border: isSelected ? '2px solid #000' : '1px solid #eee', borderRadius: '16px', cursor: 'pointer', position: 'relative', backgroundColor: isSelected ? 'rgba(0,0,0,0.02)' : 'transparent', transition: 'all 0.2s' }}
                                        >
                                            <div style={{ aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                                                <img src={p.featuredImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                            {isSelected && <div style={{ position: 'absolute', top: '8px', right: '8px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}><Plus size={12} style={{ transform: 'rotate(45deg)' }} /></div>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeSection === 'general' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Global Settings</h2>
                            <div style={{ padding: '32px', backgroundColor: '#f9fafb', borderRadius: '24px', border: '1px solid #f0f0f1' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Announcement Bar</div>
                                        <p style={{ fontSize: '0.85rem', color: '#666', margin: '4px 0 0' }}>Sticky header message shown on every page.</p>
                                    </div>
                                    <button
                                        onClick={() => setConfig({ ...config, announcement: { ...config.announcement, enabled: !config.announcement.enabled } })}
                                        style={{ width: '56px', height: '30px', borderRadius: '50px', border: 'none', backgroundColor: config.announcement.enabled ? '#000' : '#ccc', padding: '4px', cursor: 'pointer', transition: '0.3s' }}>
                                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#fff', transform: config.announcement.enabled ? 'translateX(26px)' : 'translateX(0)', transition: '0.3s' }} />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>Bar Text</label>
                                        <input
                                            type="text"
                                            value={config.announcement.text}
                                            onChange={(e) => setConfig({ ...config, announcement: { ...config.announcement, text: e.target.value } })}
                                            style={{ width: '100%', padding: '14px', border: '1px solid #eee', borderRadius: '12px', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>Background Color</label>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <input
                                                type="color"
                                                value={config.announcement.backgroundColor}
                                                onChange={(e) => setConfig({ ...config, announcement: { ...config.announcement, backgroundColor: e.target.value } })}
                                                style={{ width: '48px', height: '48px', border: 'none', borderRadius: '12px', cursor: 'pointer', padding: 0, backgroundColor: 'transparent' }}
                                            />
                                            <span style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'monospace', color: '#444' }}>{config.announcement.backgroundColor.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx global>{`
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
