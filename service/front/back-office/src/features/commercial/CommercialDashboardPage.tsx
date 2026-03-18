import { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Download,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useCommercial } from './hooks/useCommercial';

type SortField = 'sales' | 'revenue';
type SortDirection = 'asc' | 'desc';

export default function CommercialDashboardPage() {
  const { productSales, dailySales } = useCommercial();

  // Sorting
  const [sortField, setSortField] = useState<SortField>('revenue');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalSales = productSales.reduce((sum, p) => sum + p.salesThisMonth, 0);
    const totalRevenue = productSales.reduce((sum, p) => sum + p.revenueThisMonth, 0);
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    return { totalSales, totalRevenue, avgTicket };
  }, [productSales]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...productSales];
    sorted.sort((a, b) => {
      const aValue = sortField === 'sales' ? a.salesThisMonth : a.revenueThisMonth;
      const bValue = sortField === 'sales' ? b.salesThisMonth : b.revenueThisMonth;
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
    return sorted;
  }, [productSales, sortField, sortDirection]);

  // Top 5 products for chart
  const top5Products = useMemo(() => {
    return sortedProducts.slice(0, 5).map((p) => ({
      name: p.productName.length > 20 ? p.productName.substring(0, 20) + '...' : p.productName,
      ventes: p.salesThisMonth,
      revenue: p.revenueThisMonth,
    }));
  }, [sortedProducts]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [SortField, SortDirection];
    setSortField(field);
    setSortDirection(direction);
  };

  const handleExportCSV = () => {
    const headers = ['Produit', 'Ventes ce mois', 'Revenue ce mois', 'Croissance %'];
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Commercial</h1>
          <p className="text-gray-600 mt-1">Statistiques et analyses des ventes</p>
        </div>
        <Button onClick={handleExportCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Télécharger rapport CSV
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Ventes</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {summaryMetrics.totalSales}
              </p>
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
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(summaryMetrics.totalRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Ce mois</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ticket Moyen</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(summaryMetrics.avgTicket)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Par vente</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ventes / Jour (30 derniers jours)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                style={{ fontSize: '12px' }}
              />
              <YAxis style={{ fontSize: '12px' }} />
              <Tooltip
                labelFormatter={(label) => formatDate(label as string)}
                formatter={(value: number) => [value, 'Ventes']}
              />
              <Bar dataKey="sales" fill="#3b82f6" name="Ventes" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Daily Revenue Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue / Jour (30 derniers jours)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                labelFormatter={(label) => formatDate(label as string)}
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top 5 Products Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Top 5 Produits (Revenue & Ventes)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top5Products}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" style={{ fontSize: '12px' }} />
            <YAxis yAxisId="left" style={{ fontSize: '12px' }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'Revenue') return [formatCurrency(value), name];
                return [value, name];
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="ventes" fill="#3b82f6" name="Ventes" />
            <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Products Sales Table */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Ventes par Produit
            </h2>
            <Select
              label=""
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => handleSortChange(e.target.value)}
              options={[
                { value: 'sales-desc', label: 'Par ventes (DESC)' },
                { value: 'sales-asc', label: 'Par ventes (ASC)' },
                { value: 'revenue-desc', label: 'Par revenue (DESC)' },
                { value: 'revenue-asc', label: 'Par revenue (ASC)' },
              ]}
              className="w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ventes ce mois
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue ce mois
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Croissance %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedProducts.map((product) => (
                <tr key={product.productId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.productName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">
                      {product.salesThisMonth}
                    </div>
                    <div className="text-xs text-gray-500">
                      vs {product.salesLastMonth} mois dernier
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(product.revenueThisMonth)}
                    </div>
                    <div className="text-xs text-gray-500">
                      vs {formatCurrency(product.revenueLastMonth)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div
                      className={`inline-flex items-center gap-1 text-sm font-medium ${
                        product.growthPercent > 0
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

      {/* Read-only notice */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <div className="text-sm text-blue-800">
            <p className="font-medium">Mode Lecture Seule</p>
            <p className="text-blue-600 mt-1">
              Ce dashboard est en accès lecture seule. Vous pouvez consulter les statistiques et exporter les rapports,
              mais ne pouvez pas modifier les données.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
