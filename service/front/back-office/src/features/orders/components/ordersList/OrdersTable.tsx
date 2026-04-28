import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/Table';
import {
  Eye, Printer, Check, X as XIcon, ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import type { Order } from '../../types/order.types';
import {
  getOrderStatusLabel, getOrderStatusBadgeVariant,
  type OrderSortField, type OrderSortDirection,
} from '../../lib/ordersListLabels';

interface OrdersTableProps {
  orders: Order[];
  sortField: OrderSortField;
  sortDirection: OrderSortDirection;
  onSort: (field: OrderSortField) => void;
  onView: (orderId: string) => void;
  onPrint: (order: Order) => void;
  onMarkPaid: (order: Order) => void;
  onCancel: (order: Order) => void;
}

function SortIcon({ field, sortField, sortDirection }: { field: OrderSortField; sortField: OrderSortField; sortDirection: OrderSortDirection }) {
  if (sortField !== field) {
    return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
  }
  return sortDirection === 'asc' ? (
    <ArrowUp className="h-4 w-4 ml-1 text-blue-600" />
  ) : (
    <ArrowDown className="h-4 w-4 ml-1 text-blue-600" />
  );
}

export function OrdersTable({
  orders, sortField, sortDirection, onSort,
  onView, onPrint, onMarkPaid, onCancel,
}: OrdersTableProps) {
  const headerCell = (field: OrderSortField, label: string) => (
    <TableHead className="cursor-pointer hover:bg-gray-100" onClick={() => onSort(field)}>
      <div className="flex items-center">
        {label}
        <SortIcon field={field} sortField={sortField} sortDirection={sortDirection} />
      </div>
    </TableHead>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headerCell('ref', 'Ref# Commande')}
          <TableHead>Client</TableHead>
          {headerCell('amount', 'Montant')}
          <TableHead>Items</TableHead>
          <TableHead>Statut</TableHead>
          {headerCell('createdAt', 'Date')}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
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
            <TableCell className="font-semibold">{order.amount.toFixed(2)} €</TableCell>
            <TableCell>
              <Badge variant="secondary">{order.itemsCount} item{order.itemsCount > 1 ? 's' : ''}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getOrderStatusBadgeVariant(order.status)}>
                {getOrderStatusLabel(order.status)}
              </Badge>
            </TableCell>
            <TableCell className="text-gray-500">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }) : '-'}
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => onView(order.id)} title="Voir détails">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onPrint(order)} title="Imprimer">
                  <Printer className="h-4 w-4 text-gray-600" />
                </Button>
                {order.paymentStatus === 'pending' && (
                  <Button variant="ghost" size="sm" onClick={() => onMarkPaid(order)} title="Marquer comme payée">
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                )}
                {order.status !== 'cancelled' && (
                  <Button variant="ghost" size="sm" onClick={() => onCancel(order)} title="Annuler">
                    <XIcon className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
