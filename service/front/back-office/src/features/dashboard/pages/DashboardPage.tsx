import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/shared/components/ui/Button';
import {
  Euro, ShoppingCart, Users, TrendingUp, RefreshCw, LogIn, MousePointerClick,
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { formatEur } from '../lib/dashboardLabels';
import { KPICard } from '../components/KPICard';
import { RevenueChart, OrdersChart, TopChart } from '../components/DashboardCharts';
import {
  RecentOrdersTable, RecentUsersTable, OutOfStockTable,
} from '../components/DashboardTables';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    kpiData,
    revenueData,
    ordersData,
    topProducts,
    topServices,
    recentOrders,
    recentUsers,
    outOfStockProducts,
  } = useDashboard(dateRange);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastRefresh(new Date());
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            DerniÃ¨re mise Ã  jour: {lastRefresh.toLocaleTimeString('fr-FR')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${dateRange === range
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {range === '7d' ? '7 jours' : range === '30d' ? '30 jours' : '90 jours'}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard title="Revenus" value={formatEur(kpiData.revenue)} trend={kpiData.revenueTrend}
          icon={<Euro className="h-5 w-5 text-green-600" />} />
        <KPICard title="Commandes" value={kpiData.orders.toString()} trend={kpiData.ordersTrend}
          icon={<ShoppingCart className="h-5 w-5 text-blue-600" />} />
        <KPICard title="Clients actifs" value={kpiData.activeCustomers.toLocaleString('fr-FR')}
          trend={kpiData.customersTrend}
          icon={<Users className="h-5 w-5 text-purple-600" />} />
        <KPICard title="Taux de conversion" value={`${kpiData.conversionRate}%`} trend={null}
          icon={<TrendingUp className="h-5 w-5 text-orange-600" />} />
        <KPICard title="Connexions (7j)" value={kpiData.logins7d.toString()} trend={null}
          icon={<LogIn className="h-5 w-5 text-indigo-600" />} />
        <KPICard title="Ajouts panier (7j)" value={kpiData.cartAdds7d.toString()} trend={null}
          icon={<MousePointerClick className="h-5 w-5 text-pink-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueData} />
        <OrdersChart data={ordersData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopChart title="Top 5 Produits (ventes)" data={topProducts} color="#10b981" yAxisWidth={150} />
        <TopChart title="Top 5 Services (ventes)" data={topServices} color="#f59e0b" yAxisWidth={120} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersTable orders={recentOrders} />
        <RecentUsersTable users={recentUsers} />
      </div>

      <OutOfStockTable products={outOfStockProducts} />
    </div>
  );
}
