import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

// ========== TYPES ==========

export interface KPIData {
  revenue: number;
  revenueTrend: number | null;
  orders: number;
  ordersTrend: number | null;
  activeCustomers: number;
  customersTrend: number | null;
  conversionRate: number;
  logins7d: number;
  cartAdds7d: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface OrdersDataPoint {
  date: string;
  orders: number;
}

export interface TopProduct {
  name: string;
  sales: number;
}

export interface TopService {
  name: string;
  sales: number;
}

export interface RecentOrder {
  id: string;
  client: string;
  amount: number;
  status: string;
  date: string;
}

export interface RecentUser {
  id: number;
  email: string;
  name: string;
  registeredAt: string;
  status: string;
}

export interface OutOfStockProduct {
  id: string;
  name: string;
  stock: number;
}

interface DashboardStats {
  kpis: {
    totalRevenue: number;
    revenueTrend: number | null;
    totalOrders: number;
    ordersTrend: number | null;
    activeCustomers: number;
    customersTrend: number | null;
    conversionRate: number;
    logins7d: number;
    cartAdds7d: number;
  };
  revenueByDay: RevenueDataPoint[];
  ordersByDay: OrdersDataPoint[];
  topProducts: TopProduct[];
  topServices: { name: string; sales: number }[];
  lowStockProducts: OutOfStockProduct[];
}

// ========== HOOK ==========

export const useDashboard = (dateRange: '7d' | '30d' | '90d' | 'custom') => {
  const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;

  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', days],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>('/stats/dashboard', { params: { days } });
      return data;
    },
  });

  const { data: ordersResponse } = useQuery({
    queryKey: ['dashboard-recent-orders'],
    queryFn: async () => {
      const { data } = await api.get<any>('/orders', { params: { per_page: 5, page: 1 } });
      return data;
    },
  });

  const { data: usersResponse } = useQuery({
    queryKey: ['dashboard-recent-webapp-users'],
    queryFn: async () => {
      const { data } = await api.get<any>('/webapp-users', { params: { limit: 5 } });
      return data;
    },
  });

  const recentOrders: RecentOrder[] = (ordersResponse?.items ?? []).map((o: any) => ({
    id: o.id,
    client: [o.clientFirstName, o.clientLastName].filter(Boolean).join(' ') || o.clientEmail || 'Inconnu',
    amount: o.totalAmount ?? o.amount ?? 0,
    status: o.status,
    date: o.createdAt,
  }));

  const recentUsers: RecentUser[] = (usersResponse?.items ?? []).map((u: any) => ({
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

