export function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'En attente';
    case 'confirmed': return 'Confirmée';
    case 'shipped': return 'Expédiée';
    case 'delivered': return 'Livrée';
    case 'cancelled': return 'Annulée';
    default: return status;
  }
}

export function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'pending': return 'warning' as const;
    case 'confirmed': return 'default' as const;
    case 'shipped': return 'secondary' as const;
    case 'delivered': return 'success' as const;
    case 'cancelled': return 'destructive' as const;
    default: return 'secondary' as const;
  }
}

export function getPaymentStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'En attente';
    case 'paid': return 'Payé';
    case 'refunded': return 'Remboursé';
    default: return status;
  }
}

export function getPaymentStatusBadgeVariant(status: string) {
  switch (status) {
    case 'pending': return 'warning' as const;
    case 'paid': return 'success' as const;
    case 'refunded': return 'secondary' as const;
    default: return 'secondary' as const;
  }
}
