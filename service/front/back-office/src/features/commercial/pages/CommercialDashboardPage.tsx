import { useState, useMemo } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Download } from 'lucide-react';
import { useCommercial } from '../hooks/useCommercial';
import type { CommercialSortField, CommercialSortDirection } from '../lib/commercialFormatters';
import { CommercialSummaryCards } from '../components/CommercialSummaryCards';
import { DailySalesChart, DailyRevenueChart, Top5ProductsChart } from '../components/CommercialCharts';
import { ProductsSalesTable } from '../components/ProductsSalesTable';

export default function CommercialDashboardPage() {
  const { productSales, dailySales } = useCommercial();

  const [sortField, setSortField] = useState<CommercialSortField>('revenue');
  const [sortDirection, setSortDirection] = useState<CommercialSortDirection>('desc');

  const summaryMetrics = useMemo(() => {
    const totalSales = productSales.reduce((sum, p) => sum + p.salesThisMonth, 0);
    const totalRevenue = productSales.reduce((sum, p) => sum + p.revenueThisMonth, 0);
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    return { totalSales, totalRevenue, avgTicket };
  }, [productSales]);

  const sortedProducts = useMemo(() => {
    const sorted = [...productSales];
    sorted.sort((a, b) => {
      const aValue = sortField === 'sales' ? a.salesThisMonth : a.revenueThisMonth;
      const bValue = sortField === 'sales' ? b.salesThisMonth : b.revenueThisMonth;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
    return sorted;
  }, [productSales, sortField, sortDirection]);

  const top5Products = useMemo(() => {
    return sortedProducts.slice(0, 5).map((p) => ({
      name: p.productName.length > 20 ? p.productName.substring(0, 20) + '...' : p.productName,
      ventes: p.salesThisMonth,
      revenue: p.revenueThisMonth,
    }));
  }, [sortedProducts]);

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [CommercialSortField, CommercialSortDirection];
    setSortField(field);
    setSortDirection(direction);
  };

  const handleExportCSV = () => {
    const headers = ['Produit', 'Ventes ce mois', 'Revenus ce mois', 'Croissance %'];
    const rows = sortedProducts.map((p) => [
      p.productName,
      p.salesThisMonth.toString(),
      p.revenueThisMonth.toString(),
      p.growthPercent.toFixed(1) + '%',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport-ventes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Commercial</h1>
          <p className="text-gray-600 mt-1">Statistiques et analyses des ventes</p>
        </div>
        <Button onClick={handleExportCSV} className="gap-2">
          <Download className="h-4 w-4" />
          TÃ©lÃ©charger rapport CSV
        </Button>
      </div>

      <CommercialSummaryCards
        totalSales={summaryMetrics.totalSales}
        totalRevenue={summaryMetrics.totalRevenue}
        avgTicket={summaryMetrics.avgTicket}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailySalesChart data={dailySales} />
        <DailyRevenueChart data={dailySales} />
      </div>

      <Top5ProductsChart data={top5Products} />

      <ProductsSalesTable
        products={sortedProducts}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
      />

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <div className="text-sm text-blue-800">
            <p className="font-medium">Mode Lecture Seule</p>
            <p className="text-blue-600 mt-1">
              Ce dashboard est en accÃ¨s lecture seule. Vous pouvez consulter les statistiques et exporter les rapports,
              mais ne pouvez pas modifier les donnÃ©es.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
