import { Badge } from '@/shared/components/ui/Badge';
import { useSubscriptions } from '../hooks/useSubscriptions';

export function SubscriptionsTab() {
  const { data: subscriptions, isLoading } = useSubscriptions();

  if (isLoading) return <div className="text-center py-8 text-gray-500">Chargement...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Mes abonnements</h2>
      {!subscriptions || subscriptions.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun abonnement actif.</p>
      ) : (
        subscriptions.map(sub => (
          <div
            key={sub.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-1 flex items-center justify-between">
              <p className="font-semibold text-gray-900">{sub.productName}</p>
              <Badge variant={sub.status === 'active' ? 'success' : sub.status === 'cancelled' ? 'destructive' : 'secondary'}>
                {sub.status}
              </Badge>
            </div>
            <p className="text-xs text-gray-400">
              {sub.planType} — {Number(sub.price).toFixed(2)} €/{sub.planType === 'mensuel' ? 'mois' : 'an'}
            </p>
            {sub.renewalDate && (
              <p className="mt-1 text-xs text-gray-500">
                Prochain renouvellement : {new Date(sub.renewalDate).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
