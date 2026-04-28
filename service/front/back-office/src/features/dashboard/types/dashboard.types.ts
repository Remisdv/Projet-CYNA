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

export interface DashboardStats {
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
  topServices: TopService[];
  lowStockProducts: OutOfStockProduct[];
}

export interface RecentOrdersResponse {
  items: Array<{
    id: string;
    clientFirstName?: string;
    clientLastName?: string;
    clientEmail?: string;
    totalAmount?: number;
    amount?: number;
    status: string;
    createdAt: string;
  }>;
  total?: number;
}

export interface RecentUsersResponse {
  items: Array<{
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    createdAt: string;
    status?: string;
  }>;
  total?: number;
}

export type DashboardDateRange = '7d' | '30d' | '90d' | 'custom';
