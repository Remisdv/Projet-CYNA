import HeroCarousel from './HeroCarousel';
import AdvertisementBanner from './AdvertisementBanner';
import CategoryGrid from './CategoryGrid';
import FeaturedProducts from './FeaturedProducts';

export default function HomePage() {
  return (
    <div>
      <HeroCarousel />
      <AdvertisementBanner />
      <CategoryGrid />
      <FeaturedProducts />
    </div>
  );
}
