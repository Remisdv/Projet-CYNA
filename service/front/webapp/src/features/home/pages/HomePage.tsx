import HeroCarousel from '../components/HeroCarousel';
import AdvertisementBanner from '../components/AdvertisementBanner';
import CategoryGrid from '../components/CategoryGrid';
import FeaturedProducts from '../components/FeaturedProducts';

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
