import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { useOrders, downloadInvoice } from '../hooks/useOrders';

export function OrdersTab() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { data, isLoading } = useOrders(page);

  if (isLoading) return <div className="text-center py-8 text-gray-500">Chargement...</div>;

  const orders = data?.data || [];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Mes commandes</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">Aucune commande pour le moment.</p>
      ) : (
        orders.map(order => (
          <div
            key={order.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-gray-700">{order.ref}</span>
              <Badge variant={order.status === 'paid' ? 'success' : order.status === 'pending' ? 'warning' : 'secondary'}>
                {order.status}
              </Badge>
            </div>
            <p className="mb-1 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
            <p className="mb-2 text-sm text-gray-600">
              {order.items.map((i: any) => i.productName).join(', ')}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-blue-600">{Number(order.amount).toFixed(2)} €</p>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <Eye size={14} className="mr-1" /> Suivre
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadInvoice(order.id)}
                >
                  <Download size={14} className="mr-1" /> Facture
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
      {data && data.total > data.limit && (
        <div className="flex justify-center gap-2 pt-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            Précédent
          </Button>
          <span className="text-sm text-gray-500 flex items-center">Page {page}</span>
          <Button size="sm" variant="outline" disabled={page * data.limit >= data.total} onClick={() => setPage(p => p + 1)}>
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
