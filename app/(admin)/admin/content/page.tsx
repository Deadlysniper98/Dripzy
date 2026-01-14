'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Folder, Image as ImageIcon, Video, Box, ExternalLink, Loader2, X, Download } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ContentItem {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'video' | 'glb';
    size?: string;
    createdAt: any;
}

export default function ContentPage() {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'glb'>('all');
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', url: '', type: 'image' as any });
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'content'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const content = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ContentItem[];
            setItems(content);
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddContent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItem.name || (!newItem.url && !uploadFile)) return;

        setIsSaving(true);
        try {
            let finalUrl = newItem.url;

            if (uploadFile) {
                const storageRef = ref(storage, `content/${Date.now()}_${uploadFile.name}`);
                await uploadBytes(storageRef, uploadFile);
                finalUrl = await getDownloadURL(storageRef);
            }

            await addDoc(collection(db, 'content'), {
                ...newItem,
                url: finalUrl,
                createdAt: serverTimestamp()
            });
            setShowAddModal(false);
            setNewItem({ name: '', url: '', type: 'image' });
            setUploadFile(null);
            fetchContent();
        } catch (error) {
            console.error('Error adding content:', error);
            alert('Failed to add content');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this asset?')) return;
        try {
            await deleteDoc(doc(db, 'content', id));
            setItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting content:', error);
            alert('Failed to delete asset');
        }
    };

    const filteredItems = items.filter(item => {
        const matchesFilter = filter === 'all' || item.type === filter;
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Content Library</h1>
                    <p style={{ color: '#666', marginTop: '4px' }}>Manage images, videos, and 3D models for your store.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
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
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={20} /> Add Content
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px 12px 48px', border: '1px solid #eee', borderRadius: '12px', fontSize: '0.95rem', outline: 'none' }}
                    />
                </div>
                <div style={{ display: 'flex', backgroundColor: '#f5f5f7', padding: '4px', borderRadius: '12px', gap: '4px' }}>
                    {(['all', 'image', 'video', 'glb'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                backgroundColor: filter === t ? '#fff' : 'transparent',
                                boxShadow: filter === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                color: filter === t ? '#000' : '#666',
                                cursor: 'pointer'
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                    <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#000' }} />
                </div>
            ) : filteredItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px', backgroundColor: '#fafafa', borderRadius: '24px', border: '2px dashed #eee' }}>
                    <Folder size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
                    <h3 style={{ margin: 0, color: '#666' }}>No assets found</h3>
                    <p style={{ color: '#888', marginTop: '8px' }}>Start by adding images, videos or 3D models.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {filteredItems.map((item) => (
                        <div key={item.id} style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '20px', overflow: 'hidden', transition: 'transform 0.2s', cursor: 'default' }}>
                            <div style={{ aspectRatio: '16/10', backgroundColor: '#f9fafb', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {item.type === 'image' && <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                {item.type === 'video' && (
                                    <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted autoPlay loop />
                                )}
                                {item.type === 'glb' && (
                                    <div style={{ textAlign: 'center' }}>
                                        <Box size={40} color="#000" />
                                        <div style={{ fontSize: '0.8rem', marginTop: '8px', color: '#888' }}>3D Model</div>
                                    </div>
                                )}
                                <div style={{ position: 'absolute', top: '12px', left: '12px', padding: '4px 10px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                    {item.type}
                                </div>
                            </div>
                            <div style={{ padding: '16px' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => window.open(item.url, '_blank')}
                                        style={{ flex: 1, padding: '8px', border: '1px solid #eee', borderRadius: '10px', backgroundColor: '#fff', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}>
                                        <ExternalLink size={14} /> Open
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(item.url);
                                            alert('URL copied to clipboard!');
                                        }}
                                        style={{ flex: 1, padding: '8px', border: '1px solid #eee', borderRadius: '10px', backgroundColor: '#fff', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' }}>
                                        <Download size={14} /> Copy Link
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        style={{ padding: '8px', border: '1px solid #fee2e2', borderRadius: '10px', backgroundColor: '#fff', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '500px', borderRadius: '24px', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Add Content</h2>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleAddContent} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>Content Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #eee', borderRadius: '12px', fontSize: '0.95rem' }}
                                    placeholder="e.g., iPhone Case 3D Model"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>Content Type</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                    {(['image', 'video', 'glb'] as const).map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setNewItem({ ...newItem, type: t })}
                                            style={{
                                                padding: '12px',
                                                border: '1px solid',
                                                borderColor: newItem.type === t ? '#000' : '#eee',
                                                borderRadius: '12px',
                                                backgroundColor: newItem.type === t ? '#000' : '#fff',
                                                color: newItem.type === t ? '#fff' : '#000',
                                                fontSize: '0.85rem',
                                                fontWeight: 600,
                                                textTransform: 'capitalize',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>Asset File (Recommended)</label>
                                <div style={{ border: '2px dashed #eee', borderRadius: '12px', padding: '20px', textAlign: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('fileInput')?.click()}>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        hidden
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setUploadFile(file);
                                                if (!newItem.name) setNewItem({ ...newItem, name: file.name });
                                            }
                                        }}
                                    />
                                    {uploadFile ? (
                                        <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>{uploadFile.name} SELECTED</div>
                                    ) : (
                                        <div style={{ color: '#888' }}>
                                            <Plus size={24} style={{ marginBottom: '8px' }} />
                                            <div style={{ fontSize: '0.85rem' }}>Click to upload file</div>
                                        </div>
                                    )}
                                </div>
                                <div style={{ textAlign: 'center', margin: '12px 0', fontSize: '0.75rem', color: '#888' }}>— OR USE URL —</div>
                                <input
                                    type="url"
                                    value={newItem.url}
                                    onChange={(e) => {
                                        setNewItem({ ...newItem, url: e.target.value });
                                        if (e.target.value) setUploadFile(null);
                                    }}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #eee', borderRadius: '12px', fontSize: '0.95rem' }}
                                    placeholder="https://example.com/asset.xxx"
                                />
                                <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '6px' }}>Direct link to the file. For video use MP4, for 3D use GLB.</p>
                            </div>
                            <button
                                type="submit"
                                disabled={isSaving}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    backgroundColor: '#000',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    marginTop: '8px',
                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {isSaving ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Add to Library'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
