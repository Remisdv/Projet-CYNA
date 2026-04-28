import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import type {
  DashboardDateRange,
  DashboardStats,
  KPIData,
  RecentOrder,
  RecentUser,
} from '../types/dashboard.types';

export type {
  KPIData,
  RevenueDataPoint,
  OrdersDataPoint,
  TopProduct,
  TopService,
  RecentOrder,
  RecentUser,
  OutOfStockProduct,
} from '../types/dashboard.types';

export const useDashboard = (dateRange: DashboardDateRange) => {
  const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;

  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', days],
    queryFn: () => dashboardApi.stats(days),
  });

  const { data: ordersResponse } = useQuery({
    queryKey: ['dashboard-recent-orders'],
    queryFn: () => dashboardApi.recentOrders(5),
  });

  const { data: usersResponse } = useQuery({
    queryKey: ['dashboard-recent-webapp-users'],
    queryFn: () => dashboardApi.recentUsers(5),
  });

  const recentOrders: RecentOrder[] = (ordersResponse?.items ?? []).map((o) => ({
    id: o.id,
    client: [o.clientFirstName, o.clientLastName].filter(Boolean).join(' ') || o.clientEmail || 'Inconnu',
    amount: o.totalAmount ?? o.amount ?? 0,
    status: o.status,
    date: o.createdAt,
  }));

  const recentUsers: RecentUser[] = (usersResponse?.items ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
    registeredAt: u.createdAt,
    status: u.status ?? 'active',
  }));

  const kpiData: KPIData = {
    revenue: stats?.kpis.totalRevenue ?? 0,
    revenueTrend: stats?.kpis.revenueTrend ?? null,
    orders: stats?.kpis.totalOrders ?? ordersResponse?.total ?? 0,
    ordersTrend: stats?.kpis.ordersTrend ?? null,
    activeCustomers: stats?.kpis.activeCustomers ?? usersResponse?.total ?? 0,
    customersTrend: stats?.kpis.customersTrend ?? null,
    conversionRate: stats?.kpis.conversionRate ?? 0,
    logins7d: stats?.kpis.logins7d ?? 0,
    cartAdds7d: stats?.kpis.cartAdds7d ?? 0,
  };

  return {
    kpiData,
    revenueData: stats?.revenueByDay ?? [],
    ordersData: stats?.ordersByDay ?? [],
    topProducts: stats?.topProducts ?? [],
    topServices: stats?.topServices ?? [],
    recentOrders,
    recentUsers,
    outOfStockProducts: stats?.lowStockProducts ?? [],
    isLoading: statsLoading,
    isError: statsError,
  };
};

