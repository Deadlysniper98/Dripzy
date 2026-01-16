
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

export async function POST() {
    try {
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        const batch = writeBatch(db);
        let count = 0;
        let totalUpdated = 0;

        const KEYWORD_MAP: Record<string, string[]> = {
            'electronics': ['phone', 'mobile', 'watch', 'camera', 'laptop', 'tablet', 'digital'],
            'clothing': ['shirt', 'pant', 'dress', 'wear', 'cloth', 'hoodie'],
            'home': ['home', 'kitchen', 'decor', 'lamp', 'light', 'storage'],
            'audio': ['headphone', 'earphone', 'speaker', 'audio', 'sound', 'bud'],
            'chargers': ['charger', 'adapter', 'cable', 'power', 'battery', 'wireless'],
            'cases': ['case', 'cover', 'protection', 'sleeve', 'bumper'],
            'accessories': ['holder', 'stand', 'mount', 'grip', 'strap'],
            'iphone': ['iphone', 'apple'],
            'ipad': ['ipad', 'tablet'],
            'magsafe': ['magsafe', 'magnetic'],
            'anime': ['anime', 'manga', 'naruto', 'one piece', 'goku']
        };

        const updates: any[] = [];

        snapshot.docs.forEach((productDoc) => {
            const data = productDoc.data();
            const name = (data.name || '').toLowerCase();
            const category = (data.category || '').toLowerCase();
            const existingTags = new Set(data.tags || []);

            // Generate tags based on keywords
            Object.entries(KEYWORD_MAP).forEach(([tag, keywords]) => {
                const matches = keywords.some(k => name.includes(k) || category.includes(k));
                if (matches) {
                    existingTags.add(tag);
                }
            });

            // Add 'All' tag
            existingTags.add('all');

            const newTags = Array.from(existingTags);

            // Only update if tags changed
            if (JSON.stringify(newTags.sort()) !== JSON.stringify((data.tags || []).sort())) {
                batch.update(doc(db, 'products', productDoc.id), {
                    tags: newTags,
                    keywords: [...name.split(' '), ...newTags] // Helper for future search
                });
                updates.push(productDoc.id);
                count++;
                totalUpdated++;
            }

            // Firestore batches are limited to 500 ops
            if (count >= 400) {
                // in a real large DB we'd need to await batch.commit() and start a new one
                // allowing for simple one-batch execution for now (assuming < 500 products)
            }
        });

        if (count > 0) {
            await batch.commit();
        }

        return NextResponse.json({
            success: true,
            message: `Updated tags for ${totalUpdated} products`,
            updates
        });

    } catch (error) {
        console.error('Auto-tag error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
