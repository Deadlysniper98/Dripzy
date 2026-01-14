'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Package, Image as ImageIcon, Download, ExternalLink, RefreshCw, X, Check, AlertCircle, Loader2, Upload, GripVertical, Sliders, Filter } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Types
interface StoreProduct {
    id: string;
    name: string;
    slug: string; // Added slug
    sku: string;
    category: string;
    price: number;
    compareAtPrice?: number;
    costPrice: number;
    stock: number;
    description: string;
    status: 'active' | 'draft' | 'archived';
    featuredImage: string;
    images: { id: string; url: string; alt: string; position: number }[];
    cjProductId?: string;
    currency?: string;
    prices?: { USD?: number; INR?: number };
    compareAtPrices?: { USD?: number; INR?: number };
    tags?: string[];
    seoTitle?: string;
    seoDescription?: string; // Added
    isVisible: boolean; // Added
    variants: any[]; // Added
    hasVariants: boolean; // Added
    videoUrl?: string; // Added
    glbUrl?: string; // Added
}

// Helper to convert USD string to INR number
const usdToInr = (usd: number | string) => {
    const rate = 83; // Fixed exchange rate for Dripzy
    const value = typeof usd === 'string' ? parseFloat(usd) : usd;
    return Math.ceil(value * rate);
};

interface CJProduct {
    id: string;
    nameEn: string;
    sku: string;
    bigImage: string;
    sellPrice: string;
    nowPrice?: string;
    threeCategoryName?: string;
    warehouseInventoryNum?: number;
    listedNum: number;
    shippingStatus?: 'loading' | 'available' | 'unavailable' | 'unknown';
}

type TabType = 'store' | 'cj-browse';

export default function ProductsPage() {
    // Tab state
    const [activeTab, setActiveTab] = useState<TabType>('store');

    // Store products state
    const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
    const [storeLoading, setStoreLoading] = useState(true);
    const [storeSearchQuery, setStoreSearchQuery] = useState('');
    const [storeStatusFilter, setStoreStatusFilter] = useState('all');

    // CJ products state
    const [cjProducts, setCjProducts] = useState<CJProduct[]>([]);
    const [cjLoading, setCjLoading] = useState(false);
    const [cjSearchQuery, setCjSearchQuery] = useState('');
    const [cjPage, setCjPage] = useState(1);
    const [cjTotalPages, setCjTotalPages] = useState(1);
    const [cjError, setCjError] = useState<string | null>(null);

    // CJ Filters state
    const [cjCategories, setCjCategories] = useState<{ id: string, name: string }[]>([]);
    const [cjFilterCategory, setCjFilterCategory] = useState('');
    const [cjFilterShipFrom, setCjFilterShipFrom] = useState('');
    const [cjFilterMinPrice, setCjFilterMinPrice] = useState('');
    const [cjFilterMaxPrice, setCjFilterMaxPrice] = useState('');
    const [cjFilterSort, setCjFilterSort] = useState('listedNumDesc');
    const [showCjFilters, setShowCjFilters] = useState(false);

    // Import Modal State
    const [importModalProduct, setImportModalProduct] = useState<any | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set());
    const [importMargin, setImportMargin] = useState(50);
    const [shippingLoading, setShippingLoading] = useState(false);
    const [indiaShippingInfo, setIndiaShippingInfo] = useState<any>(null);

    // Import state
    const [importingProducts, setImportingProducts] = useState<Set<string>>(new Set());
    const [importedProducts, setImportedProducts] = useState<Set<string>>(new Set());
    const [importError, setImportError] = useState<string | null>(null);

    // Edit/Delete state
    const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [descMode, setDescMode] = useState<'text' | 'html'>('text');
    const [newImageUrl, setNewImageUrl] = useState('');
    const [showImageAdd, setShowImageAdd] = useState(false);
    const [adminPriceCurrency, setAdminPriceCurrency] = useState<'USD' | 'INR'>('USD');

    // Selection state for bulk actions
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    // Toggle individual selection
    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    // Toggle all visible selection
    const toggleSelectAll = () => {
        if (selectedIds.size === storeProducts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(storeProducts.map(p => p.id)));
        }
    };

    // Bulk Delete
    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} products? This cannot be undone.`)) return;

        setIsBulkProcessing(true);
        try {
            const idsToDelete = Array.from(selectedIds);
            // Process in parallel with a small limit or just sequential for safety
            for (const id of idsToDelete) {
                await fetch(`/api/products/${id}`, { method: 'DELETE' });
            }
            setStoreProducts(prev => prev.filter(p => !selectedIds.has(p.id)));
            setSelectedIds(new Set());
        } catch (error) {
            console.error('Bulk delete error:', error);
            alert('Failed to delete some products.');
        } finally {
            setIsBulkProcessing(false);
        }
    };

    // Bulk Update Status
    const handleBulkUpdateStatus = async (status: 'active' | 'draft') => {
        if (selectedIds.size === 0) return;

        setIsBulkProcessing(true);
        try {
            const idsToUpdate = Array.from(selectedIds);
            for (const id of idsToUpdate) {
                await fetch(`/api/products/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status,
                        isVisible: status === 'active'
                    }),
                });
            }

            // Update local state
            setStoreProducts(prev => prev.map(p =>
                selectedIds.has(p.id) ? { ...p, status, isVisible: status === 'active' } : p
            ));
            setSelectedIds(new Set());
        } catch (error) {
            console.error('Bulk status update error:', error);
            alert('Failed to update some products.');
        } finally {
            setIsBulkProcessing(false);
        }
    };

    // Fetch store products
    const fetchStoreProducts = useCallback(async () => {
        setStoreLoading(true);
        try {
            const params = new URLSearchParams();
            if (storeSearchQuery) params.append('search', storeSearchQuery);
            if (storeStatusFilter !== 'all') params.append('status', storeStatusFilter);

            const res = await fetch(`/api/products?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setStoreProducts(data.data.products);
            }
        } catch (error) {
            console.error('Error fetching store products:', error);
        } finally {
            setStoreLoading(false);
        }
    }, [storeSearchQuery, storeStatusFilter]);

    // Delete product
    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        setIsDeleting(id);
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.success) {
                setStoreProducts(prev => prev.filter(p => p.id !== id));
            } else {
                alert(data.error || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsDeleting(null);
        }
    };

    // Bulk upload state
    const [isBulkUploading, setIsBulkUploading] = useState(false);

    // Update product
    const handleUpdateProduct = async (e: React.FormEvent) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!editingProduct) return;

        setIsUpdating(true);
        try {
            // Always sync featured image with the first image in the array for consistency
            let featuredImage = editingProduct.featuredImage;
            if (editingProduct.images && editingProduct.images.length > 0) {
                featuredImage = editingProduct.images[0].url;
            }

            // Update visibility based on status
            const updatedProduct = {
                ...editingProduct,
                featuredImage,
                isVisible: editingProduct.status === 'active',
                updatedAt: new Date()
            };

            const res = await fetch(`/api/products/${editingProduct.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProduct),
            });
            const data = await res.json();

            if (data.success) {
                setStoreProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
                setEditingProduct(null);
            } else {
                alert(data.error || 'Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    // Bulk Image Upload Handler
    const handleBulkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !editingProduct) return;

        setIsBulkUploading(true);
        try {
            const uploadedImages = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const sRef = ref(storage, `products/${editingProduct.id}/img_${Date.now()}_${i}`);
                await uploadBytes(sRef, file);
                const url = await getDownloadURL(sRef);
                uploadedImages.push({
                    id: `${Date.now()}_${i}`,
                    url,
                    alt: '',
                    position: (editingProduct.images || []).length + i
                });
            }

            const newImages = [...(editingProduct.images || []), ...uploadedImages];
            setEditingProduct({
                ...editingProduct,
                images: newImages,
                // If featured image is empty, set it to the first uploaded one
                featuredImage: editingProduct.featuredImage || uploadedImages[0].url
            });
        } catch (error) {
            console.error('Bulk upload error:', error);
            alert('Failed to upload some images. Please try again.');
        } finally {
            setIsBulkUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    // Drag and drop state
    const [draggedImgIdx, setDraggedImgIdx] = useState<number | null>(null);

    const handleImageDragStart = (e: React.DragEvent, index: number) => {
        setDraggedImgIdx(index);
    };

    const handleImageDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedImgIdx === null || draggedImgIdx === index || !editingProduct) return;

        const newImages = [...(editingProduct.images || [])];
        const draggedItem = newImages[draggedImgIdx];
        newImages.splice(draggedImgIdx, 1);
        newImages.splice(index, 0, draggedItem);

        // Update positions
        const repositionedImages = newImages.map((img, i) => ({ ...img, position: i }));

        // Auto-update featured image to the first one in the list
        const featuredImage = repositionedImages.length > 0 ? repositionedImages[0].url : '';

        setEditingProduct({ ...editingProduct, images: repositionedImages, featuredImage });
        setDraggedImgIdx(index);
    };

    // Fetch CJ categories
    const fetchCJCategories = useCallback(async () => {
        try {
            const res = await fetch('/api/cj/categories');
            const data = await res.json();
            if (data.success && data.data) {
                // Flatten CJ category structure if needed, or just take the top level
                const cats = data.data.map((c: any) => ({
                    id: c.categoryFirstList?.[0]?.categorySecondList?.[0]?.categoryId || '',
                    name: c.categoryFirstName
                })).filter((c: any) => c.id !== '');
                setCjCategories(cats);
            }
        } catch (error) {
            console.error('Error fetching CJ categories:', error);
        }
    }, []);

    // Fetch CJ products
    const fetchCJProducts = useCallback(async (searchTerm?: string, page: number = 1) => {
        setCjLoading(true);
        setCjError(null);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('size', '24');
            if (searchTerm || cjSearchQuery) params.append('keyword', searchTerm || cjSearchQuery);
            if (cjFilterCategory) params.append('categoryId', cjFilterCategory);
            if (cjFilterShipFrom) params.append('countryCode', cjFilterShipFrom);
            if (cjFilterMinPrice) params.append('minPrice', cjFilterMinPrice);
            if (cjFilterMaxPrice) params.append('maxPrice', cjFilterMaxPrice);
            if (cjFilterSort) params.append('sort', cjFilterSort);

            const res = await fetch(`/api/cj/products?${params.toString()}`);
            const data = await res.json();

            if (data.success && data.data?.content?.[0]?.productList) {
                setCjProducts(data.data.content[0].productList);
                setCjTotalPages(data.data.totalPages || 1);
                setCjPage(page);
            } else if (!data.success) {
                setCjError(data.error || 'Failed to fetch CJ products');
                setCjProducts([]);
            }
        } catch (error) {
            console.error('Error fetching CJ products:', error);
            setCjError('Failed to connect to CJ Dropshipping API');
            setCjProducts([]);
        } finally {
            setCjLoading(false);
        }
    }, [cjSearchQuery, cjFilterCategory, cjFilterShipFrom, cjFilterMinPrice, cjFilterMaxPrice, cjFilterSort]);

    // Open Import Modal and fetch details
    const handleOpenImportModal = async (cjProductId: string) => {
        setIsImportModalOpen(true);
        setImportModalProduct(null);
        setIndiaShippingInfo(null);
        setShippingLoading(true);

        try {
            const res = await fetch(`/api/cj/product/${cjProductId}?countryCode=IN`);
            const data = await res.json();
            if (data.success) {
                setImportModalProduct(data.data);
                setIndiaShippingInfo(data.data.shippingInfo);
                // Select all variants by default
                const vids = data.data.variants?.map((v: any) => v.vid) || [];
                setSelectedVariants(new Set(vids));
            } else {
                alert(data.error || 'Failed to fetch product details');
                setIsImportModalOpen(false);
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
            setIsImportModalOpen(false);
        } finally {
            setShippingLoading(false);
        }
    };

    // Finalize import from Modal
    const handleFinalImport = async () => {
        if (!importModalProduct || selectedVariants.size === 0) return;

        const cjProductId = importModalProduct.pid;
        setImportingProducts(prev => new Set(prev).add(cjProductId));
        setIsImportModalOpen(false);

        try {
            const res = await fetch('/api/cj/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cjProductId,
                    marginPercent: importMargin,
                    selectedVariants: Array.from(selectedVariants),
                    status: 'draft'
                }),
            });

            const data = await res.json();

            if (data.success) {
                setImportedProducts(prev => new Set(prev).add(cjProductId));
                // Refresh store products
                fetchStoreProducts();
            } else {
                alert(data.error || 'Failed to import product');
            }
        } catch (error) {
            console.error('Error importing product:', error);
            alert('Failed to connect to server');
        } finally {
            setImportingProducts(prev => {
                const newSet = new Set(prev);
                newSet.delete(cjProductId);
                return newSet;
            });
        }
    };

    const importProduct = (id: string) => handleOpenImportModal(id);

    // Quick shipping check for Browse tab
    const checkProductShipping = async (id: string) => {
        const productIndex = cjProducts.findIndex(p => p.id === id);
        if (productIndex === -1) return;

        const updatedProducts = [...cjProducts];
        updatedProducts[productIndex].shippingStatus = 'loading';
        setCjProducts(updatedProducts);

        try {
            const res = await fetch(`/api/cj/product/${id}?countryCode=IN`);
            const data = await res.json();

            const finalProducts = [...cjProducts]; // Re-fetch current state
            if (data.success && data.data.shippingInfo && data.data.shippingInfo.length > 0) {
                finalProducts[productIndex].shippingStatus = 'available';
            } else {
                finalProducts[productIndex].shippingStatus = 'unavailable';
            }
            setCjProducts(finalProducts);
        } catch (error) {
            const finalProducts = [...cjProducts];
            finalProducts[productIndex].shippingStatus = 'unknown';
            setCjProducts(finalProducts);
        }
    };

    // Load data on mount
    useEffect(() => {
        if (activeTab === 'store') {
            fetchStoreProducts();
        } else if (activeTab === 'cj-browse') {
            fetchCJCategories();
        }
    }, [activeTab, fetchStoreProducts, fetchCJCategories]);

    // Handle CJ search
    const handleCJSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        fetchCJProducts(cjSearchQuery, 1);
    };

    // Auto-fetch when filters change
    useEffect(() => {
        if (activeTab === 'cj-browse') {
            fetchCJProducts(cjSearchQuery, 1);
        }
    }, [cjFilterCategory, cjFilterShipFrom, cjFilterSort, activeTab]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return { bg: '#dcfce7', text: '#166534' };
            case 'draft': return { bg: '#fef9c3', text: '#854d0e' };
            case 'archived': return { bg: '#fee2e2', text: '#991b1b' };
            default: return { bg: '#f3f4f6', text: '#374151' };
        }
    };


    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: '0 0 8px' }}>Products</h1>
                    <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>
                        Manage your product catalog and import from CJ Dropshipping
                    </p>
                </div>
                <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    backgroundColor: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                }}>
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f5f5f7', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
                <button
                    onClick={() => setActiveTab('store')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        backgroundColor: activeTab === 'store' ? '#fff' : 'transparent',
                        color: activeTab === 'store' ? '#000' : '#666',
                        boxShadow: activeTab === 'store' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Package size={18} /> My Products
                </button>
                <button
                    onClick={() => setActiveTab('cj-browse')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        backgroundColor: activeTab === 'cj-browse' ? '#fff' : 'transparent',
                        color: activeTab === 'cj-browse' ? '#000' : '#666',
                        boxShadow: activeTab === 'cj-browse' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Download size={18} /> Browse CJ Products
                </button>
            </div>

            {/* Import Error Toast */}
            {importError && (
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#991b1b'
                }}>
                    <AlertCircle size={18} />
                    <span style={{ flex: 1 }}>{importError}</span>
                    <button
                        onClick={() => setImportError(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Store Products Tab */}
            {activeTab === 'store' && (
                <>
                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        {[
                            { label: 'Total Products', value: storeProducts.length.toString() },
                            { label: 'Active', value: storeProducts.filter(p => p.status === 'active').length.toString() },
                            { label: 'Draft', value: storeProducts.filter(p => p.status === 'draft').length.toString() },
                            { label: 'Archived', value: storeProducts.filter(p => p.status === 'archived').length.toString() },
                        ].map(stat => (
                            <div key={stat.label} style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
                                <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>{stat.label}</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Filters & Bulk Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={storeSearchQuery}
                                    onChange={(e) => setStoreSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px 12px 44px',
                                        border: '1px solid #e5e5e5',
                                        borderRadius: '10px',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f5f5f7', padding: '4px', borderRadius: '10px' }}>
                                {['all', 'active', 'draft', 'archived'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setStoreStatusFilter(status)}
                                        style={{
                                            padding: '8px 16px',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            backgroundColor: storeStatusFilter === status ? '#fff' : 'transparent',
                                            color: storeStatusFilter === status ? '#000' : '#666',
                                            boxShadow: storeStatusFilter === status ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                            transition: 'all 0.2s',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedIds.size > 0 && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 20px',
                                backgroundColor: '#000',
                                borderRadius: '12px',
                                color: '#fff',
                                animation: 'slideIn 0.3s ease'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedIds.size} items selected</span>
                                    <button
                                        onClick={() => setSelectedIds(new Set())}
                                        style={{ backgroundColor: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                                    >Deselect all</button>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => handleBulkUpdateStatus('active')}
                                        disabled={isBulkProcessing}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#166534',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        {isBulkProcessing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                                        Activate
                                    </button>
                                    <button
                                        onClick={() => handleBulkUpdateStatus('draft')}
                                        disabled={isBulkProcessing}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#444',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        {isBulkProcessing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Edit2 size={14} />}
                                        Set to Draft
                                    </button>
                                    <button
                                        onClick={handleBulkDelete}
                                        disabled={isBulkProcessing}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#ef4444',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        {isBulkProcessing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={14} />}
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Products Table */}
                    <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
                        {storeLoading ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
                                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                                <p>Loading products...</p>
                            </div>
                        ) : storeProducts.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
                                <Package size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                <h3 style={{ margin: '0 0 8px', fontWeight: 600, color: '#333' }}>No products yet</h3>
                                <p style={{ margin: 0 }}>
                                    Start by importing products from CJ Dropshipping
                                </p>
                                <button
                                    onClick={() => setActiveTab('cj-browse')}
                                    style={{
                                        marginTop: '20px',
                                        padding: '12px 24px',
                                        backgroundColor: '#000',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Download size={18} /> Browse CJ Products
                                </button>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                        <th style={{ padding: '16px 24px', width: '40px' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.size === storeProducts.length && storeProducts.length > 0}
                                                onChange={toggleSelectAll}
                                                style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                            />
                                        </th>
                                        <th style={{ padding: '16px 0', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Product</th>
                                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>SKU</th>
                                        <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Price</th>
                                        <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Cost</th>
                                        <th style={{ padding: '16px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Margin</th>
                                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {storeProducts.map((product) => (
                                        <tr key={product.id} style={{
                                            borderBottom: '1px solid #f5f5f5',
                                            backgroundColor: selectedIds.has(product.id) ? '#fafafa' : 'transparent'
                                        }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(product.id)}
                                                    onChange={() => toggleSelect(product.id)}
                                                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                                                />
                                            </td>
                                            <td style={{ padding: '16px 0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                                    <div style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        borderRadius: '10px',
                                                        overflow: 'hidden',
                                                        backgroundColor: '#f5f5f7',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {product.featuredImage ? (
                                                            <img src={product.featuredImage.startsWith('//') ? `https:${product.featuredImage}` : product.featuredImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <ImageIcon size={20} style={{ color: '#ccc' }} />
                                                        )}
                                                    </div>
                                                    <span style={{ fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {product.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: '0.85rem', fontFamily: 'monospace', color: '#666' }}>{product.sku}</td>
                                            <td style={{ padding: '16px', textAlign: 'right', fontSize: '0.9rem', fontWeight: 600 }}>
                                                {(product as any).currency === 'USD' ? '$' : '₹'}{product.price?.toLocaleString((product as any).currency === 'USD' ? 'en-US' : 'en-IN')}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right', fontSize: '0.85rem', color: '#888' }}>
                                                {(product as any).currency === 'USD' ? '$' : '₹'}{product.costPrice?.toLocaleString((product as any).currency === 'USD' ? 'en-US' : 'en-IN')}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                                <span style={{
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    color: (product.price - product.costPrice) > 0 ? '#166534' : '#991b1b'
                                                }}>
                                                    {product.price && product.costPrice ? Math.round(((product.price - product.costPrice) / product.price) * 100) : 0}%
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '50px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    backgroundColor: getStatusColor(product.status).bg,
                                                    color: getStatusColor(product.status).text,
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <a
                                                        href={`/product/${product.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            padding: '8px',
                                                            border: '1px solid #e5e5e5',
                                                            borderRadius: '8px',
                                                            backgroundColor: '#fff',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        title="View on website"
                                                    >
                                                        <ExternalLink size={16} style={{ color: '#666' }} />
                                                    </a>
                                                    {product.cjProductId && (
                                                        <a
                                                            href={`https://cjdropshipping.com/product-detail.html?id=${product.cjProductId}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                padding: '8px',
                                                                border: '1px solid #e5e5e5',
                                                                borderRadius: '8px',
                                                                backgroundColor: '#fff',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            title="View on CJ Dropshipping"
                                                        >
                                                            <Download size={16} style={{ color: '#ff6b00' }} />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => setEditingProduct(product)}
                                                        style={{
                                                            padding: '8px',
                                                            border: '1px solid #e5e5e5',
                                                            borderRadius: '8px',
                                                            backgroundColor: '#fff',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        title="Edit product"
                                                    >
                                                        <Edit2 size={16} style={{ color: '#666' }} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        disabled={isDeleting === product.id}
                                                        style={{
                                                            padding: '8px',
                                                            border: '1px solid #e5e5e5',
                                                            borderRadius: '8px',
                                                            backgroundColor: '#fff',
                                                            cursor: isDeleting === product.id ? 'not-allowed' : 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            opacity: isDeleting === product.id ? 0.5 : 1
                                                        }}
                                                        title="Delete product"
                                                    >
                                                        {isDeleting === product.id ? (
                                                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                                        ) : (
                                                            <Trash2 size={16} style={{ color: '#ef4444' }} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {/* CJ Browse Tab */}
            {activeTab === 'cj-browse' && (
                <>
                    {/* Search & Filters */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <form onSubmit={handleCJSearch} style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                                    <input
                                        type="text"
                                        placeholder="Search CJ Dropshipping catalogue..."
                                        value={cjSearchQuery}
                                        onChange={(e) => setCjSearchQuery(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '14px 16px 14px 44px',
                                            border: '1px solid #e5e5e5',
                                            borderRadius: '12px',
                                            fontSize: '0.95rem',
                                            outline: 'none',
                                            backgroundColor: '#fff'
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '14px 28px',
                                        backgroundColor: '#000',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    Search
                                </button>
                            </form>
                            <button
                                onClick={() => setShowCjFilters(!showCjFilters)}
                                style={{
                                    padding: '13px 20px',
                                    backgroundColor: showCjFilters ? '#f5f5f7' : '#fff',
                                    border: `1px solid ${showCjFilters ? '#000' : '#e5e5e5'}`,
                                    borderRadius: '12px',
                                    color: '#000',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Sliders size={18} /> Filters {(cjFilterCategory || cjFilterShipFrom || cjFilterMinPrice || cjFilterMaxPrice) ? '•' : ''}
                            </button>
                        </div>

                        {showCjFilters && (
                            <div style={{
                                padding: '24px',
                                backgroundColor: '#fff',
                                border: '1px solid #eee',
                                borderRadius: '16px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '20px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                            }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#666', marginBottom: '8px' }}>Category</label>
                                    <select
                                        value={cjFilterCategory}
                                        onChange={(e) => setCjFilterCategory(e.target.value)}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #eee', borderRadius: '8px', outline: 'none', fontSize: '0.9rem' }}
                                    >
                                        <option value="">All Categories</option>
                                        {cjCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#666', marginBottom: '8px' }}>Ship From</label>
                                    <select
                                        value={cjFilterShipFrom}
                                        onChange={(e) => setCjFilterShipFrom(e.target.value)}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #eee', borderRadius: '8px', outline: 'none', fontSize: '0.9rem' }}
                                    >
                                        <option value="">Any Warehouse</option>
                                        <option value="US">USA Warehouse</option>
                                        <option value="CN">China Warehouse</option>
                                        <option value="DE">Germany Warehouse</option>
                                        <option value="ID">International</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#666', marginBottom: '8px' }}>Price Range (USD)</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={cjFilterMinPrice}
                                            onChange={(e) => setCjFilterMinPrice(e.target.value)}
                                            style={{ width: '100%', padding: '10px', border: '1px solid #eee', borderRadius: '8px', outline: 'none', fontSize: '0.9rem' }}
                                        />
                                        <span>-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={cjFilterMaxPrice}
                                            onChange={(e) => setCjFilterMaxPrice(e.target.value)}
                                            style={{ width: '100%', padding: '10px', border: '1px solid #eee', borderRadius: '8px', outline: 'none', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#666', marginBottom: '8px' }}>Sort By</label>
                                    <select
                                        value={cjFilterSort}
                                        onChange={(e) => setCjFilterSort(e.target.value)}
                                        style={{ width: '100%', padding: '10px', border: '1px solid #eee', borderRadius: '8px', outline: 'none', fontSize: '0.9rem' }}
                                    >
                                        <option value="listedNumDesc">Most Popular</option>
                                        <option value="priceAsc">Price: Low to High</option>
                                        <option value="priceDesc">Price: High to Low</option>
                                        <option value="createAtDesc">Newest Arrivals</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <button
                                        onClick={() => {
                                            setCjFilterCategory('');
                                            setCjFilterShipFrom('');
                                            setCjFilterMinPrice('');
                                            setCjFilterMaxPrice('');
                                            setCjFilterSort('listedNumDesc');
                                            fetchCJProducts(cjSearchQuery, 1);
                                        }}
                                        style={{ width: '100%', padding: '10px', backgroundColor: '#f5f5f7', border: 'none', borderRadius: '8px', color: '#666', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Banner */}
                    <div style={{
                        padding: '16px 20px',
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        color: '#0369a1',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <Package size={20} />
                        <div>
                            <strong>CJ Dropshipping Integration</strong> — Search and import products directly from CJ Dropshipping.
                            Products are imported with a 50% margin. You can edit pricing after import.
                        </div>
                    </div>

                    {/* CJ Error */}
                    {cjError && (
                        <div style={{
                            padding: '20px',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '12px',
                            textAlign: 'center'
                        }}>
                            <AlertCircle size={24} style={{ color: '#dc2626', marginBottom: '8px' }} />
                            <p style={{ margin: '0 0 12px', color: '#991b1b', fontWeight: 500 }}>{cjError}</p>
                            <p style={{ margin: 0, color: '#7f1d1d', fontSize: '0.85rem' }}>
                                Make sure you have configured your CJ API credentials in the settings.
                            </p>
                        </div>
                    )}

                    {/* CJ Products Grid */}
                    {cjLoading ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>
                            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                            <p>Searching CJ Dropshipping...</p>
                        </div>
                    ) : cjProducts.length > 0 ? (
                        <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '20px'
                            }}>
                                {cjProducts.map((product) => {
                                    const isImporting = importingProducts.has(product.id);
                                    const isImported = importedProducts.has(product.id);

                                    return (
                                        <div
                                            key={product.id}
                                            style={{
                                                backgroundColor: '#fff',
                                                borderRadius: '16px',
                                                border: '1px solid #eee',
                                                overflow: 'hidden',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {/* Product Image */}
                                            <div style={{
                                                aspectRatio: '1',
                                                backgroundColor: '#f5f5f7',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                {product.bigImage ? (
                                                    <img
                                                        src={product.bigImage}
                                                        alt={product.nameEn}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <ImageIcon size={48} style={{ color: '#ccc' }} />
                                                    </div>
                                                )}

                                                {/* Shipping Info Tag */}
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!product.shippingStatus || product.shippingStatus === 'unknown') checkProductShipping(product.id);
                                                    }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '12px',
                                                        left: '12px',
                                                        padding: '6px 12px',
                                                        backgroundColor: product.shippingStatus === 'available' ? '#dcfce7' : product.shippingStatus === 'unavailable' ? '#fef2f2' : 'rgba(255,255,255,0.95)',
                                                        color: product.shippingStatus === 'available' ? '#166534' : product.shippingStatus === 'unavailable' ? '#991b1b' : '#333',
                                                        borderRadius: '50px',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 800,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                        cursor: product.shippingStatus && product.shippingStatus !== 'unknown' ? 'default' : 'pointer',
                                                        zIndex: 10,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.02em',
                                                        border: product.shippingStatus === 'available' ? '1px solid #bdf0d0' : product.shippingStatus === 'unavailable' ? '1px solid #fecaca' : '1px solid #eee'
                                                    }}>
                                                    {product.shippingStatus === 'loading' ? (
                                                        <Loader2 size={12} className="animate-spin" />
                                                    ) : product.shippingStatus === 'available' ? (
                                                        <Check size={12} strokeWidth={3} />
                                                    ) : product.shippingStatus === 'unavailable' ? (
                                                        <AlertCircle size={12} strokeWidth={3} />
                                                    ) : (
                                                        <RefreshCw size={12} strokeWidth={3} />
                                                    )}
                                                    {product.shippingStatus === 'available' ? 'SHIPS TO INDIA' : product.shippingStatus === 'unavailable' ? 'NO INDIA SHIPPING' : 'CHECK INDIA SHIPPING'}
                                                </div>

                                                {/* Listed Count Badge */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    right: '12px',
                                                    padding: '4px 10px',
                                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                                    color: '#fff',
                                                    borderRadius: '50px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500
                                                }}>
                                                    {product.listedNum} listed
                                                </div>
                                            </div>

                                            {/* Product Info */}
                                            <div style={{ padding: '16px' }}>
                                                <h3 style={{
                                                    margin: '0 0 8px',
                                                    fontSize: '0.95rem',
                                                    fontWeight: 500,
                                                    lineHeight: 1.4,
                                                    height: '2.8em',
                                                    overflow: 'hidden',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {product.nameEn}
                                                </h3>

                                                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '12px' }}>
                                                    {product.threeCategoryName || 'General'}
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>CJ Price</div>
                                                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#666' }}>
                                                            ${product.sellPrice}
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>Sell Price (50% margin)</div>
                                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#000' }}>
                                                            <div style={{ color: '#000', fontWeight: 600 }}>
                                                                ${(parseFloat(product.sellPrice) * 1.5).toFixed(2)}
                                                                <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: '4px' }}>(₹{usdToInr(parseFloat(product.sellPrice) * 1.5).toLocaleString('en-IN')})</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => importProduct(product.id)}
                                                        disabled={isImporting || isImported}
                                                        style={{
                                                            flex: 1,
                                                            padding: '12px',
                                                            backgroundColor: isImported ? '#dcfce7' : '#000',
                                                            color: isImported ? '#166534' : '#fff',
                                                            border: 'none',
                                                            borderRadius: '10px',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 500,
                                                            cursor: isImporting || isImported ? 'default' : 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '8px',
                                                            opacity: isImporting ? 0.7 : 1
                                                        }}
                                                    >
                                                        {isImporting ? (
                                                            <>
                                                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                                                Importing...
                                                            </>
                                                        ) : isImported ? (
                                                            <>
                                                                <Check size={16} />
                                                                Imported
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Download size={16} />
                                                                Import
                                                            </>
                                                        )}
                                                    </button>
                                                    <a
                                                        href={`https://cjdropshipping.com/product/${product.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            padding: '12px',
                                                            border: '1px solid #e5e5e5',
                                                            borderRadius: '10px',
                                                            backgroundColor: '#fff',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            textDecoration: 'none'
                                                        }}
                                                    >
                                                        <ExternalLink size={16} style={{ color: '#666' }} />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '16px',
                                padding: '20px'
                            }}>
                                <button
                                    onClick={() => fetchCJProducts(cjSearchQuery, cjPage - 1)}
                                    disabled={cjPage <= 1}
                                    style={{
                                        padding: '10px 20px',
                                        border: '1px solid #e5e5e5',
                                        borderRadius: '8px',
                                        backgroundColor: '#fff',
                                        cursor: cjPage <= 1 ? 'not-allowed' : 'pointer',
                                        opacity: cjPage <= 1 ? 0.5 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>
                                <span style={{ color: '#666', fontSize: '0.9rem' }}>
                                    Page {cjPage} of {cjTotalPages}
                                </span>
                                <button
                                    onClick={() => fetchCJProducts(cjSearchQuery, cjPage + 1)}
                                    disabled={cjPage >= cjTotalPages}
                                    style={{
                                        padding: '10px 20px',
                                        border: '1px solid #e5e5e5',
                                        borderRadius: '8px',
                                        backgroundColor: '#fff',
                                        cursor: cjPage >= cjTotalPages ? 'not-allowed' : 'pointer',
                                        opacity: cjPage >= cjTotalPages ? 0.5 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        </>
                    ) : !cjError && (
                        <div style={{
                            padding: '80px',
                            textAlign: 'center',
                            backgroundColor: '#fff',
                            borderRadius: '16px',
                            border: '1px solid #eee'
                        }}>
                            <Download size={48} style={{ marginBottom: '16px', color: '#ccc' }} />
                            <h3 style={{ margin: '0 0 8px', fontWeight: 600, color: '#333' }}>
                                Search CJ Dropshipping
                            </h3>
                            <p style={{ margin: 0, color: '#888', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                                Enter a search term above to browse millions of products from CJ Dropshipping.
                                Try searching for "phone case", "hoodie", "earbuds", or any product you want to sell.
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* CJ Import Modal */}
            {isImportModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: '24px'
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        borderRadius: '24px',
                        width: '100%',
                        maxWidth: '900px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '24px 32px',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Import Selection</h2>
                            <button
                                onClick={() => setIsImportModalOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                            {shippingLoading ? (
                                <div style={{ textAlign: 'center', padding: '60px' }}>
                                    <Loader2 size={40} className="animate-spin" style={{ color: '#000', margin: '0 auto' }} />
                                    <p style={{ marginTop: '16px', color: '#666' }}>Fetching product details and India shipping availability...</p>
                                </div>
                            ) : importModalProduct ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
                                    {/* Left: General Info */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #eee' }}>
                                            <img src={importModalProduct.productImage} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                                        </div>

                                        <div style={{
                                            padding: '16px',
                                            borderRadius: '16px',
                                            backgroundColor: indiaShippingInfo ? '#f0fdf4' : '#fef2f2',
                                            border: `1px solid ${indiaShippingInfo ? '#dcfce7' : '#fee2e2'}`
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: indiaShippingInfo ? '#166534' : '#991b1b', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                                                {indiaShippingInfo ? <Check size={18} /> : <AlertCircle size={18} />}
                                                {indiaShippingInfo ? 'Ships to India' : 'Cannot Ship to India'}
                                            </div>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: indiaShippingInfo ? '#166534' : '#991b1b', opacity: 0.8 }}>
                                                {indiaShippingInfo
                                                    ? `Estimated shipping: $${indiaShippingInfo[0]?.amount || '0.00'}`
                                                    : 'This product has no available shipping methods for India.'}
                                            </p>
                                        </div>

                                        <div style={{ padding: '16px', backgroundColor: '#f9f9fb', borderRadius: '16px', border: '1px solid #f0f0f1' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '12px' }}>Pricing Strategy</label>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#444', marginBottom: '6px' }}>Margin Percent (%)</label>
                                                    <input
                                                        type="number"
                                                        value={importMargin}
                                                        onChange={(e) => setImportMargin(parseInt(e.target.value) || 0)}
                                                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.9rem' }}
                                                    />
                                                </div>
                                                <div style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#888' }}>
                                                        <span>Example Unit Sell:</span>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                            <span style={{ color: '#000', fontWeight: 600 }}>${(importModalProduct.sellPrice * (1 + importMargin / 100)).toFixed(2)}</span>
                                                            <span style={{ fontSize: '0.75rem', color: '#888' }}>₹{usdToInr(importModalProduct.sellPrice * (1 + importMargin / 100)).toLocaleString('en-IN')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Variants Selection */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Select Variants ({selectedVariants.size}/{importModalProduct.variants?.length})</h3>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => setSelectedVariants(new Set(importModalProduct.variants.map((v: any) => v.vid)))}
                                                    style={{ background: 'none', border: 'none', color: '#000', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>Select All</button>
                                                <span style={{ color: '#eee' }}>|</span>
                                                <button
                                                    onClick={() => setSelectedVariants(new Set())}
                                                    style={{ background: 'none', border: 'none', color: '#666', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>Deselect All</button>
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px',
                                            maxHeight: '400px',
                                            overflowY: 'auto',
                                            paddingRight: '8px'
                                        }}>
                                            {importModalProduct.variants?.map((v: any) => (
                                                <div
                                                    key={v.vid}
                                                    onClick={() => {
                                                        const newSelected = new Set(selectedVariants);
                                                        if (newSelected.has(v.vid)) newSelected.delete(v.vid);
                                                        else newSelected.add(v.vid);
                                                        setSelectedVariants(newSelected);
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '16px',
                                                        padding: '12px 16px',
                                                        borderRadius: '12px',
                                                        border: `1px solid ${selectedVariants.has(v.vid) ? '#000' : '#eee'}`,
                                                        backgroundColor: selectedVariants.has(v.vid) ? '#f9f9fb' : '#fff',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '20px',
                                                        height: '20px',
                                                        borderRadius: '4px',
                                                        border: `2px solid ${selectedVariants.has(v.vid) ? '#000' : '#ccc'}`,
                                                        backgroundColor: selectedVariants.has(v.vid) ? '#000' : 'transparent',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        {selectedVariants.has(v.vid) && <Check size={14} color="#fff" />}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{v.variantNameEn}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#888' }}>SKU: {v.variantSku}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>${(v.variantSellPrice * (1 + importMargin / 100)).toFixed(2)}</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#888' }}>₹{usdToInr(v.variantSellPrice * (1 + importMargin / 100)).toLocaleString('en-IN')}</div>
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: '#888' }}>Cost: ${v.variantSellPrice}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '24px 32px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '16px', backgroundColor: '#fafafa' }}>
                            <button
                                onClick={() => setIsImportModalOpen(false)}
                                style={{ padding: '12px 24px', backgroundColor: 'transparent', border: '1px solid #ddd', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            <button
                                onClick={handleFinalImport}
                                disabled={!importModalProduct || selectedVariants.size === 0}
                                style={{
                                    padding: '12px 32px',
                                    backgroundColor: (!importModalProduct || selectedVariants.size === 0) ? '#ccc' : '#000',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    cursor: (!importModalProduct || selectedVariants.size === 0) ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                <Download size={20} />
                                Import Selected {selectedVariants.size > 0 ? `(${selectedVariants.size})` : ''}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Product Editor Modal */}
            {editingProduct && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#f5f5f7',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1000,
                    overflow: 'hidden'
                }}>
                    {/* Editor Header */}
                    <div style={{
                        height: '70px',
                        backgroundColor: '#fff',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 32px',
                        flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button
                                onClick={() => setEditingProduct(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#666',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontWeight: 500
                                }}
                            >
                                <X size={20} /> Close
                            </button>
                            <div style={{ width: '1px', height: '24px', backgroundColor: '#eee' }}></div>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{editingProduct.name || 'Edit Product'}</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <a
                                href={`/product/${editingProduct.slug || editingProduct.id}`}
                                target="_blank"
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    backgroundColor: '#fff',
                                    color: '#333',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <ExternalLink size={16} /> View on Store
                            </a>
                            <button
                                onClick={handleUpdateProduct}
                                disabled={isUpdating}
                                style={{
                                    padding: '10px 32px',
                                    backgroundColor: '#000',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {isUpdating ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={18} />}
                                {isUpdating ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    </div>

                    {/* Editor Content */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '40px',
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr',
                        gap: '32px',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        width: '100%'
                    }}>
                        {/* Main Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* General Card */}
                            <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>General Information</h3>
                                    <div style={{ display: 'flex', backgroundColor: '#f5f5f7', padding: '4px', borderRadius: '8px', gap: '4px' }}>
                                        <button
                                            onClick={() => setDescMode('text')}
                                            style={{
                                                padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                                                backgroundColor: descMode === 'text' ? '#fff' : 'transparent',
                                                boxShadow: descMode === 'text' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                cursor: 'pointer'
                                            }}>Visual</button>
                                        <button
                                            onClick={() => setDescMode('html')}
                                            style={{
                                                padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                                                backgroundColor: descMode === 'html' ? '#fff' : 'transparent',
                                                boxShadow: descMode === 'html' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                cursor: 'pointer'
                                            }}>HTML</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>Product Title</label>
                                        <input
                                            type="text"
                                            value={editingProduct.name}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>Description</label>
                                        {descMode === 'text' ? (
                                            <textarea
                                                value={editingProduct.description}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '10px', minHeight: '200px', fontSize: '0.95rem', lineHeight: 1.6 }}
                                                placeholder="Enter product description..."
                                            />
                                        ) : (
                                            <textarea
                                                value={editingProduct.description}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '10px', minHeight: '200px', fontSize: '0.9rem', lineHeight: 1.5, fontFamily: 'monospace', backgroundColor: '#1e1e1e', color: '#fff' }}
                                                placeholder="<p>Enter HTML here...</p>"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Images Card */}
                            <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', padding: '24px' }}>
                                <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 600 }}>Media</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px' }}>
                                    {(editingProduct.images || []).map((img, idx) => (
                                        <div
                                            key={img.id || idx}
                                            draggable
                                            onDragStart={(e) => handleImageDragStart(e, idx)}
                                            onDragOver={(e) => handleImageDragOver(e, idx)}
                                            onDragEnd={() => setDraggedImgIdx(null)}
                                            style={{
                                                position: 'relative',
                                                aspectRatio: '1',
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                border: draggedImgIdx === idx ? '2px solid #000' : '1px solid #eee',
                                                opacity: draggedImgIdx === idx ? 0.5 : 1,
                                                cursor: 'grab',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        >
                                            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                                            <div style={{ position: 'absolute', top: '4px', left: '4px', background: 'rgba(255,255,255,0.8)', borderRadius: '4px', padding: '2px', display: 'flex' }}>
                                                <GripVertical size={12} color="#666" />
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const newImages = (editingProduct.images || []).filter((_, i) => i !== idx);
                                                    setEditingProduct({ ...editingProduct, images: newImages });
                                                }}
                                                style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', display: 'flex' }}>
                                                <X size={14} color="#ef4444" />
                                            </button>
                                            {idx === 0 && (
                                                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.6rem', padding: '4px', textAlign: 'center', fontWeight: 600 }}>Main Image</div>
                                            )}
                                        </div>
                                    ))}

                                    <div
                                        onClick={() => document.getElementById('bulkImgUpload')?.click()}
                                        style={{
                                            aspectRatio: '1',
                                            borderRadius: '12px',
                                            border: '2px dashed #ddd',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: isBulkUploading ? 'not-allowed' : 'pointer',
                                            color: '#888',
                                            gap: '8px',
                                            backgroundColor: '#fafafa'
                                        }}>
                                        {isBulkUploading ? (
                                            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                                        ) : (
                                            <>
                                                <Plus size={24} />
                                                <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Add Images</span>
                                            </>
                                        )}
                                        <input
                                            id="bulkImgUpload"
                                            type="file"
                                            hidden
                                            multiple
                                            accept="image/*"
                                            onChange={handleBulkImageUpload}
                                            disabled={isBulkUploading}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>Video (Direct Upload preferred)</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                value={editingProduct.videoUrl || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, videoUrl: e.target.value })}
                                                placeholder="Video URL"
                                                style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '0.85rem' }}
                                            />
                                            <button
                                                onClick={() => document.getElementById('videoUpload')?.click()}
                                                style={{ padding: '10px', backgroundColor: '#f5f5f7', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer' }}
                                            >
                                                <Upload size={18} />
                                            </button>
                                            <input
                                                id="videoUpload"
                                                type="file"
                                                hidden
                                                accept="video/mp4"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    const sRef = ref(storage, `products/${editingProduct.id}/video_${Date.now()}`);
                                                    await uploadBytes(sRef, file);
                                                    const url = await getDownloadURL(sRef);
                                                    setEditingProduct({ ...editingProduct, videoUrl: url });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>3D Model (GLB)</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                value={editingProduct.glbUrl || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, glbUrl: e.target.value })}
                                                placeholder="3D Model URL"
                                                style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '0.85rem' }}
                                            />
                                            <button
                                                onClick={() => document.getElementById('glbUpload')?.click()}
                                                style={{ padding: '10px', backgroundColor: '#f5f5f7', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer' }}
                                            >
                                                <Upload size={18} />
                                            </button>
                                            <input
                                                id="glbUpload"
                                                type="file"
                                                hidden
                                                accept=".glb"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    const sRef = ref(storage, `products/${editingProduct.id}/model_${Date.now()}`);
                                                    await uploadBytes(sRef, file);
                                                    const url = await getDownloadURL(sRef);
                                                    setEditingProduct({ ...editingProduct, glbUrl: url });
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Variants Card */}
                            {(editingProduct.variants && editingProduct.variants.length > 0) && (
                                <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Variants</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#666' }}>{editingProduct.variants.length} Variants</span>
                                            <div style={{ display: 'flex', backgroundColor: '#f5f5f7', padding: '3px', borderRadius: '6px', gap: '2px' }}>
                                                <button
                                                    onClick={() => setAdminPriceCurrency('USD')}
                                                    style={{
                                                        padding: '4px 10px', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                                        backgroundColor: adminPriceCurrency === 'USD' ? '#fff' : 'transparent',
                                                        boxShadow: adminPriceCurrency === 'USD' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                                        cursor: 'pointer'
                                                    }}>USD</button>
                                                <button
                                                    onClick={() => setAdminPriceCurrency('INR')}
                                                    style={{
                                                        padding: '4px 10px', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                                        backgroundColor: adminPriceCurrency === 'INR' ? '#fff' : 'transparent',
                                                        boxShadow: adminPriceCurrency === 'INR' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                                        cursor: 'pointer'
                                                    }}>INR</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {editingProduct.variants.map((v, idx) => (
                                            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '16px', alignItems: 'center', padding: '12px', border: '1px solid #f0f0f1', borderRadius: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {v.image && <img src={v.image} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />}
                                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{v.name || v.key}</span>
                                                </div>
                                                <div style={{ position: 'relative' }}>
                                                    <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#888' }}>
                                                        {adminPriceCurrency === 'USD' ? '$' : '₹'}
                                                    </span>
                                                    <input
                                                        type="number"
                                                        value={adminPriceCurrency === 'USD'
                                                            ? (v.prices?.USD ?? v.price)
                                                            : (v.prices?.INR ?? usdToInr(v.price))}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value) || 0;
                                                            const newVariants = [...editingProduct.variants];
                                                            const existingPrices = v.prices || {};
                                                            const newPrices = { ...existingPrices, [adminPriceCurrency]: val };
                                                            newVariants[idx] = {
                                                                ...v,
                                                                prices: newPrices,
                                                                price: adminPriceCurrency === (editingProduct.currency || 'USD') ? val : v.price
                                                            };
                                                            setEditingProduct({ ...editingProduct, variants: newVariants });
                                                        }}
                                                        style={{ width: '100%', padding: '6px 6px 6px 20px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem' }}
                                                    />
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#666' }}>{v.stock} in stock</div>
                                                <button
                                                    onClick={() => {
                                                        const newVariants = editingProduct.variants.filter((_, i) => i !== idx);
                                                        setEditingProduct({ ...editingProduct, variants: newVariants, hasVariants: newVariants.length > 1 });
                                                    }}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pricing Card */}
                            <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Pricing</h3>
                                        {editingProduct.variants && editingProduct.variants.length > 0 && (
                                            <span style={{ fontSize: '0.75rem', color: '#888' }}>Showing first variant price</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', backgroundColor: '#f5f5f7', padding: '4px', borderRadius: '8px', gap: '4px' }}>
                                        <button
                                            onClick={() => setAdminPriceCurrency('USD')}
                                            style={{
                                                padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                                                backgroundColor: adminPriceCurrency === 'USD' ? '#fff' : 'transparent',
                                                boxShadow: adminPriceCurrency === 'USD' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                cursor: 'pointer'
                                            }}>USD</button>
                                        <button
                                            onClick={() => setAdminPriceCurrency('INR')}
                                            style={{
                                                padding: '6px 12px', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                                                backgroundColor: adminPriceCurrency === 'INR' ? '#fff' : 'transparent',
                                                boxShadow: adminPriceCurrency === 'INR' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                cursor: 'pointer'
                                            }}>INR</button>
                                    </div>
                                </div>

                                {(() => {
                                    // Use first variant pricing if variants exist
                                    const hasVariants = editingProduct.variants && editingProduct.variants.length > 0;
                                    const priceSource = hasVariants ? editingProduct.variants[0] : editingProduct;
                                    const basePrice = priceSource.price || 0;
                                    const baseCompareAtPrice = hasVariants ? 0 : (editingProduct.compareAtPrice || 0);
                                    const baseCostPrice = hasVariants ? (priceSource.costPrice || editingProduct.costPrice) : editingProduct.costPrice;
                                    const pricesObj = priceSource.prices || {};
                                    const compareAtPricesObj = hasVariants ? {} : (editingProduct.compareAtPrices || {});

                                    return (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>
                                                    Store Price ({adminPriceCurrency})
                                                </label>
                                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                    <span style={{ position: 'absolute', left: '12px', color: '#888', fontWeight: 500 }}>
                                                        {adminPriceCurrency === 'USD' ? '$' : '₹'}
                                                    </span>
                                                    <input
                                                        type="number"
                                                        value={adminPriceCurrency === 'USD'
                                                            ? (pricesObj.USD ?? basePrice)
                                                            : (pricesObj.INR ?? usdToInr(basePrice))}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value) || 0;
                                                            if (hasVariants) {
                                                                const newVariants = [...editingProduct.variants];
                                                                const existingPrices = newVariants[0].prices || {};
                                                                newVariants[0] = {
                                                                    ...newVariants[0],
                                                                    prices: { ...existingPrices, [adminPriceCurrency]: val },
                                                                    price: adminPriceCurrency === (editingProduct.currency || 'USD') ? val : newVariants[0].price
                                                                };
                                                                setEditingProduct({
                                                                    ...editingProduct,
                                                                    variants: newVariants,
                                                                    price: newVariants[0].price
                                                                });
                                                            } else {
                                                                const newPrices = { ...editingProduct.prices, [adminPriceCurrency]: val };
                                                                const updates: any = { prices: newPrices };
                                                                if (adminPriceCurrency === (editingProduct.currency || 'USD')) {
                                                                    updates.price = val;
                                                                }
                                                                setEditingProduct({ ...editingProduct, ...updates });
                                                            }
                                                        }}
                                                        style={{ width: '100%', padding: '12px 12px 12px 30px', border: '1px solid #ddd', borderRadius: '10px', height: '46px', fontSize: '0.95rem' }}
                                                    />
                                                </div>
                                                {adminPriceCurrency === 'USD' && !pricesObj.INR && (
                                                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                                                        Auto-converted INR: ₹{usdToInr(basePrice).toLocaleString('en-IN')}
                                                    </div>
                                                )}
                                                {adminPriceCurrency === 'INR' && !pricesObj.USD && (
                                                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                                                        Auto-converted USD: ${basePrice.toFixed(2)}
                                                    </div>
                                                )}
                                            </div>

                                            {!hasVariants && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>
                                                        Compare at Price ({adminPriceCurrency})
                                                    </label>
                                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                        <span style={{ position: 'absolute', left: '12px', color: '#888', fontWeight: 500 }}>
                                                            {adminPriceCurrency === 'USD' ? '$' : '₹'}
                                                        </span>
                                                        <input
                                                            type="number"
                                                            value={adminPriceCurrency === 'USD'
                                                                ? (compareAtPricesObj.USD ?? baseCompareAtPrice)
                                                                : (compareAtPricesObj.INR ?? usdToInr(baseCompareAtPrice))}
                                                            onChange={(e) => {
                                                                const val = parseFloat(e.target.value) || 0;
                                                                const newPrices = { ...editingProduct.compareAtPrices, [adminPriceCurrency]: val };
                                                                const updates: any = { compareAtPrices: newPrices };
                                                                if (adminPriceCurrency === (editingProduct.currency || 'USD')) {
                                                                    updates.compareAtPrice = val;
                                                                }
                                                                setEditingProduct({ ...editingProduct, ...updates });
                                                            }}
                                                            style={{ width: '100%', padding: '12px 12px 12px 30px', border: '1px solid #ddd', borderRadius: '10px', height: '46px', fontSize: '0.95rem' }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ gridColumn: hasVariants ? 'span 2' : 'span 2', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #f0f0f1' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CJ Cost Price</span>
                                                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>
                                                            ${(baseCostPrice || 0).toLocaleString()}
                                                            <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 400 }}> (₹{Math.round((baseCostPrice || 0) * 83).toLocaleString('en-IN')})</span>
                                                        </span>
                                                    </div>
                                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Profit Margin</span>
                                                        <span style={{ color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>
                                                            {basePrice && baseCostPrice ? Math.round(((basePrice - baseCostPrice) / basePrice) * 100) : 0}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Sidebar Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Status Card */}
                            <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', padding: '24px' }}>
                                <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 600 }}>Organization</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>Product Status</label>
                                        <select
                                            value={editingProduct.status}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: editingProduct.status === 'active' ? '#f0fdf4' : '#f9fafb' }}
                                        >
                                            <option value="active">Active (Visible On Store)</option>
                                            <option value="draft">Draft (Hidden)</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>Category</label>
                                        <input
                                            type="text"
                                            value={editingProduct.category}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '10px' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>Tags</label>
                                        <input
                                            type="text"
                                            placeholder="Add tags separated by comma"
                                            value={editingProduct.tags?.join(', ')}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, tags: e.target.value.split(',').map(t => t.trim()) })}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '10px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Inventory Card */}
                            <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', padding: '24px' }}>
                                <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 600 }}>Inventory</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>SKU (Stock Keeping Unit)</label>
                                        <input
                                            type="text"
                                            value={editingProduct.sku}
                                            disabled
                                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '10px', backgroundColor: '#f9fafb', color: '#888' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#444', marginBottom: '8px' }}>Quantity Available</label>
                                        <input
                                            type="number"
                                            value={editingProduct.stock}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '10px' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SEO Card */}
                            <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee', padding: '24px' }}>
                                <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 600 }}>Search Engine Listing</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#444' }}>URL Slug</label>
                                        <input
                                            type="text"
                                            value={editingProduct.slug}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                                            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '10px', height: '46px' }}
                                        />
                                    </div>
                                    <div style={{ padding: '20px', backgroundColor: '#f9f9fb', borderRadius: '12px', border: '1px solid #eee' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ color: '#1a0dab', fontSize: '1.1rem', fontWeight: 400, textDecoration: 'none', cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                                {editingProduct.name}
                                            </div>
                                            <div style={{ color: '#006621', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span>dripzy.in › product › {editingProduct.slug}</span>
                                            </div>
                                            <div style={{ color: '#4d5156', fontSize: '0.875rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginTop: '4px' }}>
                                                {editingProduct.description?.replace(/<[^>]*>/g, '').substring(0, 160)}...
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS for animations */}
            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes slideIn {
                    from { transform: translateY(-10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
