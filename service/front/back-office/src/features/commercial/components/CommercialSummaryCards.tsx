import { Card } from '@/shared/components/ui/Card';
import { Euro, ShoppingCart, TrendingUp } from 'lucide-react';
import { formatCurrencyEur } from '@/features/commercial/lib/commercialFormatters';

interface SummaryProps {
  totalSales: number;
  totalRevenue: number;
  avgTicket: number;
}

export function CommercialSummaryCards({ totalSales, totalRevenue, avgTicket }: SummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Ventes</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalSales}</p>
            <p className="text-xs text-gray-500 mt-1">Ce mois</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatCurrencyEur(totalRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Ce mois</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <Euro className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Ticket Moyen</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatCurrencyEur(avgTicket)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Par vente</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}
