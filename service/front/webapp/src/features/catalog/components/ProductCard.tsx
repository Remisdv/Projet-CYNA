import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Monitor } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useCart } from '../../../context/CartContext';
import type { Product } from '../hooks/useProducts';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(product.id);

  const rawPrice = product.type === 'service'
    ? product.prix_mensuel
    : product.prix;

  const displayPrice = rawPrice != null ? Number(rawPrice) : null;

  const priceLabel = displayPrice != null && !isNaN(displayPrice)
    ? `${displayPrice.toFixed(2)} €${product.type === 'service' ? '/mois' : ''}`
    : '—';

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
      periodicity: 'mensuel',
    });
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-44 overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.nom}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <span className="text-3xl font-bold text-blue-200">
              {product.nom.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        {product.categorie && (
          <Badge variant="secondary" className="absolute left-2 top-2 text-xs">
            {product.categorie}
          </Badge>
        )}
        {product.type === 'service' && (
          <Badge className="absolute right-2 top-2 text-xs bg-purple-100 text-purple-700 border-purple-200">
            <Monitor size={10} className="mr-1" /> Service
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-1 line-clamp-2 font-semibold text-gray-900 group-hover:text-blue-600">
          {product.nom}
        </h3>
        <p className="mb-3 line-clamp-3 flex-1 text-sm text-gray-500">
          {product.description}
        </p>

        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-lg font-bold text-blue-600">{priceLabel}</span>
            {product.type === 'service' && product.prix_annuel != null && (
              <p className="text-xs text-gray-400">ou {Number(product.prix_annuel).toFixed(2)} €/an</p>
            )}
          </div>
          <Button
            size="sm"
            variant={inCart ? 'outline' : 'default'}
            onClick={handleAddToCart}
            className="shrink-0"
          >
            {inCart ? (
              <>
                <Check size={14} className="mr-1" /> Ajouté
              </>
            ) : (
              <>
                <ShoppingCart size={14} className="mr-1" /> Ajouter
              </>
            )}
          </Button>
        </div>
      </div>
    </Link>
  );
}
