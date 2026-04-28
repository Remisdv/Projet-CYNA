import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Filter, X } from 'lucide-react';
import type { OrderStatusFilter } from '../../lib/ordersListLabels';

interface OrdersFiltersProps {
  show: boolean;
  onToggleShow: () => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  statusFilter: OrderStatusFilter;
  onStatusChange: (v: OrderStatusFilter) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
  amountMin: string;
  onAmountMinChange: (v: string) => void;
  amountMax: string;
  onAmountMaxChange: (v: string) => void;
}

export function OrdersFilters({
  show, onToggleShow, hasActiveFilters, onClear,
  statusFilter, onStatusChange,
  dateFrom, onDateFromChange,
  dateTo, onDateToChange,
  amountMin, onAmountMinChange,
  amountMax, onAmountMaxChange,
}: OrdersFiltersProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClear}>
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onToggleShow}>
              {show ? 'Masquer' : 'Afficher'}
            </Button>
          </div>
        </div>
      </CardHeader>
      {show && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select
              label="Statut"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value as OrderStatusFilter)}
              options={[
                { value: 'all', label: 'Tous les statuts' },
                { value: 'pending', label: 'En attente' },
                { value: 'confirmed', label: 'Confirmée' },
                { value: 'shipped', label: 'Expédiée' },
                { value: 'delivered', label: 'Livrée' },
                { value: 'cancelled', label: 'Annulée' },
              ]}
            />
            <Input label="Date début" type="date" value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)} />
            <Input label="Date fin" type="date" value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)} />
            <Input label="Montant min (€)" type="number" step="0.01" value={amountMin}
              onChange={(e) => onAmountMinChange(e.target.value)} placeholder="0" />
            <Input label="Montant max (€)" type="number" step="0.01" value={amountMax}
              onChange={(e) => onAmountMaxChange(e.target.value)} placeholder="1000" />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
