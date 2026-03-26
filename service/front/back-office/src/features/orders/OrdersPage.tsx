import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';
import {
  Eye,
  Printer,
  Check,
  X as XIcon,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  X,
} from 'lucide-react';
import { useOrders, MockOrder } from './hooks/useOrders';

type SortField = 'date' | 'amount' | 'ref';
type SortDirection = 'asc' | 'desc';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { data: orders } = useOrders();

  // Filters
  const [statusFilters, setStatusFilters] = useState<{
    pending: boolean;
    confirmed: boolean;
    delivered: boolean;
    cancelled: boolean;
  }>({
    pending: true,
    confirmed: true,
    delivered: true,
    cancelled: true,
  });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Apply status filters
    result = result.filter((order) => statusFilters[order.status]);

    // Apply date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      result = result.filter((order) => new Date(order.date) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((order) => new Date(order.date) <= toDate);
    }

    // Apply amount range filter
    if (amountMin) {
      result = result.filter((order) => order.amount >= parseFloat(amountMin));
    }
    if (amountMax) {
      result = result.filter((order) => order.amount <= parseFloat(amountMax));
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
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
  }, [orders, statusFilters, dateFrom, dateTo, amountMin, amountMax, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);
  const paginatedOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1 text-blue-600" />
    );
  };

  const toggleStatusFilter = (status: keyof typeof statusFilters) => {
    setStatusFilters((prev) => ({ ...prev, [status]: !prev[status] }));
    setCurrentPage(1);
  };

  const handleViewDetails = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handlePrint = (order: MockOrder) => {
    console.log('Printing order:', order.ref);
    alert(`Impression de la commande ${order.ref} (mock)`);
  };

  const handleMarkPaid = (order: MockOrder) => {
    if (confirm(`Marquer la commande ${order.ref} comme payée ?`)) {
      console.log('Marking order as paid:', order.ref);
      alert('Commande marquée comme payée (mock)');
    }
  };

  const handleCancel = (order: MockOrder) => {
    if (confirm(`Êtes-vous sûr de vouloir annuler la commande ${order.ref} ?`)) {
      console.log('Cancelling order:', order.ref);
      alert('Commande annulée (mock)');
    }
  };

  const clearFilters = () => {
    setStatusFilters({
      pending: true,
      confirmed: true,
      delivered: true,
      cancelled: true,
    });
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    !statusFilters.pending ||
    !statusFilters.confirmed ||
    !statusFilters.delivered ||
    !statusFilters.cancelled ||
    dateFrom ||
    dateTo ||
    amountMin ||
    amountMax;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'default';
      case 'delivered': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-500 mt-1">
            Gérez vos {filteredAndSortedOrders.length} commandes
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Effacer
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Masquer' : 'Afficher'}
              </Button>
            </div>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="space-y-4">
              {/* Status checkboxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(statusFilters).map(([status, checked]) => (
                    <label
                      key={status}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStatusFilter(status as keyof typeof statusFilters)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {getStatusLabel(status)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date and Amount filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  label="Date début"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                />

                <Input
                  label="Date fin"
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                />

                <Input
                  label="Montant min (€)"
                  type="number"
                  step="0.01"
                  value={amountMin}
                  onChange={(e) => {
                    setAmountMin(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="0"
                />

                <Input
                  label="Montant max (€)"
                  type="number"
                  step="0.01"
                  value={amountMax}
                  onChange={(e) => {
                    setAmountMax(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="1000"
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedOrders.length === 0 ? (
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('ref')}
                    >
                      <div className="flex items-center">
                        Ref# Commande
                        {getSortIcon('ref')}
                      </div>
                    </TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center">
                        Montant
                        {getSortIcon('amount')}
                      </div>
                    </TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        Date
                        {getSortIcon('date')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium font-mono text-sm">
                        {order.ref}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{order.clientName}</p>
                          <p className="text-sm text-gray-500">{order.clientEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {order.amount.toFixed(2)} €
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{order.itemsCount} item{order.itemsCount > 1 ? 's' : ''}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-500">
                        {new Date(order.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(order.id)}
                            title="Voir détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrint(order)}
                            title="Imprimer"
                          >
                            <Printer className="h-4 w-4 text-gray-600" />
                          </Button>
                          {order.paymentStatus === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkPaid(order)}
                              title="Marquer comme payée"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          {order.status !== 'cancelled' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancel(order)}
                              title="Annuler"
                            >
                              <XIcon className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-gray-500">
                  Affichage {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredAndSortedOrders.length)} sur {filteredAndSortedOrders.length} résultats
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
