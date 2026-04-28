import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProducts } from '@/features/catalog/hooks/useProducts';
import ProductCard from '@/features/catalog/components/ProductCard';

export default function FeaturedProducts() {
  const { data: products, isLoading } = useProducts();
  const featured = products?.slice(0, 6) ?? [];

  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Nos solutions phares</h2>
            <p className="mt-1 text-gray-500">
              Découvrez notre sélection de services et produits de cybersécurité.
            </p>
          </div>
          <Link
            to="/catalog"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Voir tout <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <p className="text-center text-gray-400">Aucun produit disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
