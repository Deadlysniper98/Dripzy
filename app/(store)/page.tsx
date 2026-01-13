import { HeroSlider } from '@/components/store/HeroSlider';
import { CategoryGrid } from '@/components/store/CategoryGrid';
import { BestSellers } from '@/components/store/BestSellers';
import { TrustBadges } from '@/components/store/TrustBadges';
import { CustomerReviews } from '@/components/store/CustomerReviews';

export default function Home() {
  return (
    <div>
      <HeroSlider />
      <CategoryGrid />
      <BestSellers />
      <CustomerReviews />
      <TrustBadges />
    </div>
  )
}
