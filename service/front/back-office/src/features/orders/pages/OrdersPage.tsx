import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { ShoppingCart } from 'lucide-react';
import { useOrders, useUpdateOrderStatus, useUpdatePaymentStatus } from '../hooks/useOrders';
import type { Order } from '../types/order.types';
import type { OrderStatusFilter, OrderSortField, OrderSortDirection } from '../lib/ordersListLabels';
import { OrdersFilters } from '../components/ordersList/OrdersFilters';
import { OrdersTable } from '../components/ordersList/OrdersTable';
import { OrdersPagination } from '../components/ordersList/OrdersPagination';

export default function OrdersPage() {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useOrders({ page: currentPage, status: statusFilter });
  const updateStatus = useUpdateOrderStatus();
  const updatePayment = useUpdatePaymentStatus();
  const orders = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;
  const totalCount = data?.total ?? 0;

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [sortField, setSortField] = useState<OrderSortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<OrderSortDirection>('desc');

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      result = result.filter((order) => new Date(order.createdAt) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((order) => new Date(order.createdAt) <= toDate);
    }
    if (amountMin) {
      result = result.filter((order) => order.amount >= parseFloat(amountMin));
    }
    if (amountMax) {
      result = result.filter((order) => order.amount <= parseFloat(amountMax));
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'ref':
          comparison = a.ref.localeCompare(b.ref);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [orders, dateFrom, dateTo, amountMin, amountMax, sortField, sortDirection]);

  const handleSort = (field: OrderSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleViewDetails = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handlePrint = (order: Order) => {
    navigate(`/orders/${order.id}`);
  };

  const handleMarkPaid = (order: Order) => {
    if (confirm(`Marquer la commande ${order.ref} comme payée ?`)) {
      updatePayment.mutate({ id: order.id, paymentStatus: 'paid' });
    }
  };

  const handleCancel = (order: Order) => {
    if (confirm(`êtes-vous sûr de vouloir annuler la commande ${order.ref} ?`)) {
      updateStatus.mutate({ id: order.id, status: 'cancelled' });
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
    setCurrentPage(1);
  };

  const hasActiveFilters = !!(statusFilter !== 'all' || dateFrom || dateTo || amountMin || amountMax);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-500 mt-1">
            {isLoading ? 'Chargement...' : `${totalCount} commandes au total`}
          </p>
        </div>
      </div>

      <OrdersFilters
        show={showFilters}
        onToggleShow={() => setShowFilters(!showFilters)}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
        statusFilter={statusFilter}
        onStatusChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}
        dateFrom={dateFrom}
        onDateFromChange={(v) => { setDateFrom(v); setCurrentPage(1); }}
        dateTo={dateTo}
        onDateToChange={(v) => { setDateTo(v); setCurrentPage(1); }}
        amountMin={amountMin}
        onAmountMinChange={(v) => { setAmountMin(v); setCurrentPage(1); }}
        amountMax={amountMax}
        onAmountMaxChange={(v) => { setAmountMax(v); setCurrentPage(1); }}
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">Chargement des commandes...</div>
          ) : filteredAndSortedOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune commande trouvée</p>
              {hasActiveFilters && (
                <Button className="mt-4" variant="outline" onClick={clearFilters}>
                  Effacer les filtres
                </Button>
              )}
            </div>
          ) : (
            <>
              <OrdersTable
                orders={filteredAndSortedOrders}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onView={handleViewDetails}
                onPrint={handlePrint}
                onMarkPaid={handleMarkPaid}
                onCancel={handleCancel}
              />

              <OrdersPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
