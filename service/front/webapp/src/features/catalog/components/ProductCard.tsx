import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Monitor, Package, ArrowRight } from 'lucide-react';
import { useCart } from '@/shared/context/CartContext';
import type { Product } from '../hooks/useProducts';
import { useCategoryName } from '../hooks/useCategories';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(product.id);
  const categoryName = useCategoryName(product.categorie);

  const isService = product.type === 'service';
  const rawPrice = isService ? product.prix_mensuel : product.prix;
  const displayPrice = rawPrice != null ? Number(rawPrice) : null;
  const annualPrice = product.prix_annuel != null ? Number(product.prix_annuel) : null;
  const savingsPercent =
    isService && displayPrice && annualPrice && displayPrice > 0
      ? Math.round((1 - annualPrice / (displayPrice * 12)) * 100)
      : 0;
  const imageUrl = product.images?.[0];

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (inCart) return;
    addItem({
      id: product.id,
      nom: product.nom,
      prix_mensuel: product.prix_mensuel,
      prix_annuel: product.prix_annuel,
      prix: product.prix,
      type: product.type,
      image: imageUrl,
      periodicity: isService ? 'mensuel' : undefined,
    });
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl hover:border-blue-100"
    >
      {/* Image zone */}
      <div className="relative h-52 shrink-0 overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.nom}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <span className="text-4xl font-black text-blue-200">
              {product.nom.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Price badge */}
        <div className="absolute bottom-3 left-3">
          {displayPrice != null && !isNaN(displayPrice) ? (
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-white drop-shadow">
                {displayPrice.toFixed(2)} €
              </span>
              {isService && <span className="text-xs font-medium text-white/80">/mois</span>}
            </div>
          ) : (
            <span className="text-sm font-semibold text-white/80">Prix sur devis</span>
          )}
          {savingsPercent > 0 && (
            <span className="mt-0.5 block text-xs font-medium text-green-300">
              -{savingsPercent}% en annuel
            </span>
          )}
        </div>

        {/* Type badge top-right */}
        <div className="absolute top-2.5 right-2.5">
          {isService ? (
            <span className="flex items-center gap-1 rounded-full bg-purple-600/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <Monitor size={10} /> Service
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-blue-600/90 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <Package size={10} /> Produit
            </span>
          )}
        </div>

        {/* Category badge top-left */}
        {product.categorie && (
          <div className="absolute top-2.5 left-2.5">
            <span className="rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-medium text-gray-700 backdrop-blur-sm">
              {categoryName}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1.5 line-clamp-2 font-semibold text-gray-900 leading-snug transition-colors group-hover:text-blue-600">
          {product.nom}
        </h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-500 leading-relaxed">
          {product.description}
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-2 mt-auto">
          <span className="flex flex-1 items-center gap-1 text-sm font-medium text-blue-600">
            Découvrir <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </span>
          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${inCart
                ? 'border border-green-200 bg-green-50 text-green-700 cursor-default'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }`}
          >
            {inCart ? (
              <><Check size={12} /> Ajouté</>
            ) : (
              <><ShoppingCart size={12} /> Ajouter</>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
