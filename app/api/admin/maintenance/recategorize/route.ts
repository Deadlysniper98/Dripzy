
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { autoCategorize } from '@/lib/categories';

export async function POST(request: NextRequest) {
    try {
        const snapshot = await getDocs(collection(db, 'products'));
        const batch = writeBatch(db);
        let count = 0;
        let total = 0;

        // Firestore batches are limited to 500 ops.
        // For simplicity in this "tool", we'll just process the first 500 or implementation chunking if needed.
        // But let's just do one batch for now or warn if > 500.

        // Better: Process completely but if > 500, we need multiple batches. 
        // Let's implement simple chunking.

        const updates: { id: string, data: any }[] = [];

        snapshot.docs.forEach(productDoc => {
            const data = productDoc.data();
            const name = data.name || '';
            const description = data.description || '';
            const currentCat = data.category || ''; // existing legacy category

            const newCategories = autoCategorize(name, description, currentCat);

            // Generate tags
            const lowerCategories = newCategories.map(c => c.toLowerCase());
            const newTags = [...new Set([...(data.tags || []), ...lowerCategories, 'all'])];

            // Check if update is needed
            // Compare stringified arrays for simplicity
            const currentCategoriesJSON = JSON.stringify((data.categories || []).sort());
            const newCategoriesJSON = JSON.stringify(newCategories.sort());

            // Also check tags
            const currentTagsJSON = JSON.stringify((data.tags || []).sort());
            const newTagsJSON = JSON.stringify(newTags.sort());

            if (currentCategoriesJSON !== newCategoriesJSON || currentTagsJSON !== newTagsJSON) {
                updates.push({
                    id: productDoc.id,
                    data: {
                        categories: newCategories,
                        tags: newTags
                    }
                });
            }
            total++;
        });

        // Commit in chunks of 400 to be safe
        const chunkSize = 400;
        for (let i = 0; i < updates.length; i += chunkSize) {
            const chunk = updates.slice(i, i + chunkSize);
            const batch = writeBatch(db);
            chunk.forEach(update => {
                batch.update(doc(db, 'products', update.id), update.data);
            });
            await batch.commit();
            count += chunk.length;
        }

        return NextResponse.json({
            success: true,
            message: `Scanned ${total} products. Updated ${count} products with new categories.`,
            updates: count
        });

    } catch (error) {
        console.error('Error re-categorizing:', error);
        return NextResponse.json({ success: false, error: 'Failed to re-categorize' }, { status: 500 });
    }
}
