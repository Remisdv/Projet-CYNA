import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useProducts } from './hooks/useProducts';
import { usePublicCategories, getCategoryName } from './hooks/useCategories';
import ProductCard from './components/ProductCard';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const PAGE_SIZE = 12;

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const categorieParam = searchParams.get('categorie') ?? '';
  const typeParam = searchParams.get('type') ?? '';
  const qParam = searchParams.get('q') ?? '';
  const pageParam = parseInt(searchParams.get('page') ?? '1', 10);

  const [searchInput, setSearchInput] = useState(qParam);

  const { data: products, isLoading } = useProducts({
    categorie: categorieParam || undefined,
    type: typeParam || undefined,
    q: qParam || undefined,
  });
  const { data: categories } = usePublicCategories();

  const totalPages = Math.max(1, Math.ceil((products?.length ?? 0) / PAGE_SIZE));
  const page = Math.min(pageParam, totalPages);
  const paged = (products ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setFilter('q', searchInput);
  }

  function clearFilters() {
    setSearchParams({});
    setSearchInput('');
  }

  const hasActiveFilters = !!(categorieParam || typeParam || qParam);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catalogue</h1>
          {products && (
            <p className="mt-1 text-sm text-gray-500">{products.length} solution(s) disponible(s)</p>
          )}
        </div>

        <div className="flex gap-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Rechercher..."
              className="w-52"
            />
            <Button type="submit" size="sm" variant="outline">
              <Search size={16} />
            </Button>
          </form>
          <Button
            size="sm"
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(v => !v)}
          >
            <SlidersHorizontal size={16} className="mr-1" />
            Filtres
          </Button>
          {hasActiveFilters && (
            <Button size="sm" variant="ghost" onClick={clearFilters}>
              <X size={16} className="mr-1" />
              Effacer
            </Button>
          )}
        </div>
      </div>

      {/* Inline filter bar */}
      {showFilters && (
        <div className="mb-6 flex flex-wrap gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Catégorie</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('categorie', '')}
                className={`rounded-full border px-3 py-1 text-sm transition ${!categorieParam
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                  }`}
              >
                Toutes
              </button>
              {categories?.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilter('categorie', cat.slug)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${categorieParam === cat.slug
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                    }`}
                >
                  {getCategoryName(cat)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-gray-500">Type</p>
            <div className="flex gap-2">
              {(['', 'produit', 'service'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilter('type', t)}
                  className={`rounded-full border px-3 py-1 text-sm capitalize transition ${typeParam === t
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                    }`}
                >
                  {t === '' ? 'Tous' : t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          <p className="text-lg">Aucun résultat pour ces critères.</p>
          <button onClick={clearFilters} className="mt-2 text-sm text-blue-600 hover:underline">
            Effacer les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paged.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setFilter('page', String(page - 1))}
          >
            Précédent
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setFilter('page', String(page + 1))}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
