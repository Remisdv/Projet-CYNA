import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, Check, ArrowLeft } from 'lucide-react';
import { useProductDetail } from '../catalog/hooks/useProducts';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useCart } from '../../context/CartContext';

function ImageGallery({ images, nom }: { images: string[]; nom: string }) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100">
        <span className="text-6xl font-bold text-blue-200">{nom.slice(0, 2).toUpperCase()}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative h-80 overflow-hidden rounded-2xl bg-gray-100">
        <img
          src={images[current]}
          alt={`${nom} — image ${current + 1}`}
          className="h-full w-full object-contain"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent(i => (i - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white hover:bg-black/50"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrent(i => (i + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white hover:bg-black/50"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === current ? 'border-blue-600' : 'border-transparent'
              }`}
            >
              <img src={src} alt={`Miniature ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError } = useProductDetail(id);
  const { addItem, isInCart, updatePeriodicity, items } = useCart();

  const inCart = product ? isInCart(product.id) : false;
  const cartItem = product ? items.find(i => i.id === product.id) : undefined;
  const [selectedPeriodicity, setSelectedPeriodicity] = useState<'mensuel' | 'annuel'>('mensuel');

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-2xl bg-gray-200" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="h-24 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <p className="text-lg text-gray-500">Produit introuvable.</p>
        <Link to="/catalog" className="mt-4 inline-block text-blue-600 hover:underline">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const isService = product.type === 'service';
  const price = isService
    ? (selectedPeriodicity === 'mensuel' ? product.prix_mensuel : product.prix_annuel)
    : product.prix;

  function handleAddToCart() {
    if (inCart) {
      if (isService && cartItem) {
        updatePeriodicity(product!.id, selectedPeriodicity);
      }
      return;
    }
    addItem({
      id: product!.id,
      nom: product!.nom,
      prix_mensuel: product!.prix_mensuel,
      prix_annuel: product!.prix_annuel,
      prix: product!.prix,
      type: product!.type,
      image: product!.images?.[0],
      periodicity: selectedPeriodicity,
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        to="/catalog"
        className="mb-8 flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
      >
        <ArrowLeft size={16} /> Retour au catalogue
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <ImageGallery images={product.images ?? []} nom={product.nom} />

        {/* Info */}
        <div className="flex flex-col">
          {product.categorie && (
            <Badge variant="secondary" className="mb-3 w-fit">
              {product.categorie}
            </Badge>
          )}
          <h1 className="mb-3 text-3xl font-bold text-gray-900">{product.nom}</h1>

          {/* Periodicity selector for services */}
          {isService && (
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setSelectedPeriodicity('mensuel')}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  selectedPeriodicity === 'mensuel'
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                }`}
              >
                Mensuel
                {product.prix_mensuel != null && (
                  <span className="ml-1 text-xs opacity-80">{product.prix_mensuel.toFixed(2)} €</span>
                )}
              </button>
              <button
                onClick={() => setSelectedPeriodicity('annuel')}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  selectedPeriodicity === 'annuel'
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400'
                }`}
              >
                Annuel
                {product.prix_annuel != null && (
                  <span className="ml-1 text-xs opacity-80">{product.prix_annuel.toFixed(2)} €</span>
                )}
              </button>
            </div>
          )}

          <div className="mb-6 text-4xl font-extrabold text-blue-600">
            {price != null ? (
              <>
                {price.toFixed(2)} €
                {isService && (
                  <span className="ml-1 text-lg font-normal text-gray-500">
                    /{selectedPeriodicity === 'mensuel' ? 'mois' : 'an'}
                  </span>
                )}
              </>
            ) : (
              <span className="text-gray-400">Prix sur devis</span>
            )}
          </div>

          <p className="mb-6 leading-relaxed text-gray-600">{product.description}</p>

          {/* Characteristics */}
          {product.caracteristiques && Object.keys(product.caracteristiques).length > 0 && (
            <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">
                Caractéristiques
              </h2>
              <dl className="grid grid-cols-1 gap-y-2 sm:grid-cols-2">
                {Object.entries(product.caracteristiques).map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-gray-400">{k}</dt>
                    <dd className="text-sm font-medium text-gray-800">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <Button
            size="lg"
            className="mt-auto w-full"
            variant={inCart ? 'outline' : 'default'}
            onClick={handleAddToCart}
          >
            {inCart ? (
              <>
                <Check size={18} className="mr-2" />
                {isService ? 'Mettre à jour la périodicité' : 'Déjà dans le panier'}
              </>
            ) : (
              <>
                <ShoppingCart size={18} className="mr-2" />
                Ajouter au panier
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
