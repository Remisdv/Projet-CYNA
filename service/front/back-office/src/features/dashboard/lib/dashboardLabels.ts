export const formatEur = (value: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

export function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'completed':
    case 'active':
      return 'success' as const;
    case 'pending':
    case 'processing':
      return 'warning' as const;
    case 'cancelled':
    case 'inactive':
      return 'destructive' as const;
    default:
      return 'secondary' as const;
  }
}

export function getStatusLabel(status: string) {
  switch (status) {
    case 'completed': return 'Complété';
    case 'pending': return 'En attente';
    case 'confirmed': return 'Confirmée';
    case 'shipped': return 'Expédiée';
    case 'delivered': return 'Livrée';
    case 'processing': return 'En cours';
    case 'cancelled': return 'Annulé';
    case 'active': return 'Actif';
    case 'inactive': return 'Inactif';
    default: return status;
  }
}
