import { Button } from '@/shared/components/ui/Button';
import { useCart } from '@/shared/context/CartContext';
import type { InfoForm } from '../../types/checkout.types';

export function Step2Summary({
  info,
  onNext,
  onBack,
}: {
  info: InfoForm;
  onNext: () => void;
  onBack: () => void;
}) {
  const { items, total } = useCart();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Récapitulatif de commande</h2>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">Livraison / Contact</h3>
        <p className="text-sm text-gray-700">
          {info.prenom} {info.nom}
        </p>
        <p className="text-sm text-gray-500">{info.email}</p>
        <p className="text-sm text-gray-500">{info.adresse}, {info.codePostal} {info.ville}</p>
      </div>

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {items.map(item => {
          const unitPrice = item.type === 'service'
            ? (item.periodicity === 'mensuel' ? item.prix_mensuel : item.prix_annuel)
            : item.prix;
          const lineTotal = unitPrice != null ? unitPrice * item.quantity : null;
          return (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.nom}</p>
                <p className="text-xs text-gray-400">
                  × {item.quantity}
                  {item.type === 'service' && ` — ${item.periodicity}`}
                </p>
              </div>
              <span className="text-sm font-semibold text-blue-600">
                {lineTotal != null ? `${lineTotal.toFixed(2)} €` : '—'}
              </span>
            </div>
          );
        })}
        <div className="flex justify-between px-4 py-3 font-bold text-gray-900">
          <span>Total estimé</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">Retour</Button>
        <Button onClick={onNext} className="flex-1">Procéder au paiement</Button>
      </div>
    </div>
  );
}
