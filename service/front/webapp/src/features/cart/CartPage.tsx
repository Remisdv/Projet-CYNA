import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/ui/Button';

export default function CartPage() {
  const { items, removeItem, updateQuantity, updatePeriodicity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <ShoppingBag size={64} className="mx-auto mb-4 text-gray-300" />
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Votre panier est vide</h1>
        <p className="mb-6 text-gray-500">
          Explorez notre catalogue pour trouver les solutions adaptées à vos besoins.
        </p>
        <Link to="/catalog">
          <Button size="lg">Parcourir le catalogue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mon panier</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-500 hover:text-red-600 hover:underline"
        >
          Vider le panier
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Items list */}
        <div className="space-y-4 lg:col-span-2">
          {items.map(item => {
            const isService = item.type === 'service';
            const unitPrice = isService
              ? (item.periodicity === 'mensuel' ? item.prix_mensuel : item.prix_annuel)
              : item.prix;
            const lineTotal = unitPrice != null ? unitPrice * item.quantity : null;

            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                {/* Thumbnail */}
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.nom}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                      <span className="text-lg font-bold text-blue-200">
                        {item.nom.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <Link
                      to={`/products/${item.id}`}
                      className="font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {item.nom}
                    </Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label="Supprimer"
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Periodicity for services */}
                  {isService && (
                    <div className="mb-2 flex gap-2">
                      {(['mensuel', 'annuel'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => updatePeriodicity(item.id, p)}
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition ${
                            item.periodicity === p
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-gray-300 text-gray-600 hover:border-blue-400'
                          }`}
                        >
                          {p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between">
                    {/* Quantity stepper */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-blue-600 hover:text-blue-600 disabled:opacity-40"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-blue-600 hover:text-blue-600"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Line total */}
                    <span className="font-bold text-blue-600">
                      {lineTotal != null ? (
                        <>
                          {lineTotal.toFixed(2)} €
                          {isService && (
                            <span className="ml-1 text-xs font-normal text-gray-400">
                              /{item.periodicity === 'mensuel' ? 'mois' : 'an'}
                            </span>
                          )}
                        </>
                      ) : (
                        'Prix sur devis'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Récapitulatif</h2>
          <div className="mb-4 space-y-2 text-sm text-gray-600">
            {items.map(item => {
              const unitPrice = item.type === 'service'
                ? (item.periodicity === 'mensuel' ? item.prix_mensuel : item.prix_annuel)
                : item.prix;
              return (
                <div key={item.id} className="flex justify-between">
                  <span className="line-clamp-1 flex-1 pr-2">{item.nom} × {item.quantity}</span>
                  <span className="shrink-0 font-medium">
                    {unitPrice != null ? `${(unitPrice * item.quantity).toFixed(2)} €` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mb-6 flex justify-between border-t border-gray-100 pt-4 text-base font-bold text-gray-900">
            <span>Total estimé</span>
            <span>{total.toFixed(2)} €</span>
          </div>
          <p className="mb-4 text-xs text-gray-400">
            * Les montants indiqués sont hors taxes. La facturation définitive est établie après validation de votre commande.
          </p>
          <Link to="/checkout">
            <Button className="w-full" size="lg">
              Commander <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
