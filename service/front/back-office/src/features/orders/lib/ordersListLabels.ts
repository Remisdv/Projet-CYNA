export type OrderStatusFilter = 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type OrderSortField = 'createdAt' | 'amount' | 'ref';
export type OrderSortDirection = 'asc' | 'desc';

export function getOrderStatusLabel(status: string) {
  switch (status) {
    case 'pending': return 'En attente';
    case 'confirmed': return 'Confirmée';
    case 'shipped': return 'Expédiée';
    case 'delivered': return 'Livrée';
    case 'cancelled': return 'Annulée';
    default: return status;
  }
}

export function getOrderStatusBadgeVariant(status: string) {
  switch (status) {
    case 'pending': return 'warning' as const;
    case 'confirmed': return 'default' as const;
    case 'shipped': return 'secondary' as const;
    case 'delivered': return 'success' as const;
    case 'cancelled': return 'destructive' as const;
    default: return 'secondary' as const;
  }
}
