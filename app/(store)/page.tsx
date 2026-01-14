'use client';

import { HeroSlider } from '@/components/store/HeroSlider';
import { CategoryGrid } from '@/components/store/CategoryGrid';
import { BestSellers } from '@/components/store/BestSellers';
import { TrustBadges } from '@/components/store/TrustBadges';
import { CustomerReviews } from '@/components/store/CustomerReviews';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [themeConfig, setThemeConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const themeDoc = await getDoc(doc(db, 'settings', 'theme'));
        if (themeDoc.exists()) {
          setThemeConfig(themeDoc.data());
        }
      } catch (error) {
        console.error('Error fetching theme:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTheme();
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      {themeConfig?.announcement?.enabled && (
        <div style={{
          backgroundColor: themeConfig.announcement.backgroundColor || '#000',
          color: '#fff',
          padding: '10px',
          textAlign: 'center',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          position: 'sticky',
          top: 0,
          zIndex: 2000
        }}>
          {themeConfig.announcement.text}
        </div>
      )}
      <HeroSlider config={themeConfig?.hero} />
      <CategoryGrid categories={themeConfig?.categories} />
      <BestSellers featuredIds={themeConfig?.featuredProducts} />
      <CustomerReviews />
      <TrustBadges />
    </div>
  );
}
