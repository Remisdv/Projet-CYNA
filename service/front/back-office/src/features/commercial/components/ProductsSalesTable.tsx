import { Card } from '@/shared/components/ui/Card';
import { Select } from '@/shared/components/ui/Select';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { formatCurrencyEur, type CommercialSortField, type CommercialSortDirection } from '@/features/commercial/lib/commercialFormatters';

interface ProductRow {
  productId: string | number;
  productName: string;
  salesThisMonth: number;
  salesLastMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  growthPercent: number;
}

interface ProductsSalesTableProps {
  products: ProductRow[];
  sortField: CommercialSortField;
  sortDirection: CommercialSortDirection;
  onSortChange: (value: string) => void;
}

export function ProductsSalesTable({ products, sortField, sortDirection, onSortChange }: ProductsSalesTableProps) {
  return (
    <Card>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Ventes par Produit
          </h2>
          <Select
            label=""
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => onSortChange(e.target.value)}
            options={[
              { value: 'sales-desc', label: 'Par ventes (DESC)' },
              { value: 'sales-asc', label: 'Par ventes (ASC)' },
              { value: 'revenue-desc', label: 'Par revenus (DESC)' },
              { value: 'revenue-asc', label: 'Par revenus (ASC)' },
            ]}
            className="w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ventes ce mois</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenus ce mois</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Croissance %</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.productId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-900">{product.salesThisMonth}</div>
                  <div className="text-xs text-gray-500">vs {product.salesLastMonth} mois dernier</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrencyEur(product.revenueThisMonth)}
                  </div>
                  <div className="text-xs text-gray-500">
                    vs {formatCurrencyEur(product.revenueLastMonth)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div
                    className={`inline-flex items-center gap-1 text-sm font-medium ${product.growthPercent > 0
                        ? 'text-green-600'
                        : product.growthPercent < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                  >
                    {product.growthPercent > 0 ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : product.growthPercent < 0 ? (
                      <ArrowDown className="h-4 w-4" />
                    ) : (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                    {Math.abs(product.growthPercent).toFixed(1)}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
