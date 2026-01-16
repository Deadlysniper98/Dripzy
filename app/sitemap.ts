import { MetadataRoute } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const SITE_URL = 'https://dripzy.store';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${SITE_URL}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/cart`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
        },
        {
            url: `${SITE_URL}/checkout`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
        },
    ];

    // Dynamic product pages
    let productPages: MetadataRoute.Sitemap = [];

    try {
        const q = query(collection(db, 'products'), where('status', '==', 'active'));
        const snapshot = await getDocs(q);

        productPages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                url: `${SITE_URL}/product/${data.slug || doc.id}`,
                lastModified: data.updatedAt?.toDate?.() || new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            };
        });
    } catch (error) {
        console.error('Error generating sitemap:', error);
    }

    return [...staticPages, ...productPages];
}
