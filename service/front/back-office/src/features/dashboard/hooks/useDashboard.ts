// ========== TYPES ==========

export interface KPIData {
  revenue: number;
  revenueTrend: number;
  orders: number;
  ordersTrend: number;
  activeCustomers: number;
  customersTrend: number;
  conversionRate: number;
  conversionTrend: number;
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
  revenue: number;
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
  id: number;
  name: string;
  stock: number;
}

// ========== MOCK DATA GENERATORS ==========

const generateMockRevenueData = (days: number): RevenueDataPoint[] => {
  const data = [];
  const baseRevenue = 2500;
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.round(baseRevenue + Math.random() * 1500 - 500),
    });
  }
  return data;
};

const generateMockOrdersData = (days: number): OrdersDataPoint[] => {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      orders: Math.round(15 + Math.random() * 25),
    });
  }
  return data;
};

const mockTopProducts: TopProduct[] = [
  { name: 'Premium Subscription', sales: 145 },
  { name: 'Basic Plan', sales: 98 },
  { name: 'Enterprise License', sales: 76 },
  { name: 'Starter Pack', sales: 54 },
  { name: 'Add-on Module', sales: 32 },
];

const mockTopServices: TopService[] = [
  { name: 'Consulting', revenue: 12500 },
  { name: 'Support Premium', revenue: 8900 },
  { name: 'Formation', revenue: 6700 },
  { name: 'Audit', revenue: 4500 },
  { name: 'Maintenance', revenue: 3200 },
];

const mockRecentOrders: RecentOrder[] = [
  { id: 'ORD-001', client: 'Jean Dupont', amount: 299.99, status: 'completed', date: '2025-01-17' },
  { id: 'ORD-002', client: 'Marie Martin', amount: 149.50, status: 'pending', date: '2025-01-17' },
  { id: 'ORD-003', client: 'Pierre Bernard', amount: 599.00, status: 'processing', date: '2025-01-16' },
  { id: 'ORD-004', client: 'Sophie Petit', amount: 89.99, status: 'completed', date: '2025-01-16' },
  { id: 'ORD-005', client: 'Lucas Moreau', amount: 449.00, status: 'cancelled', date: '2025-01-15' },
];

const mockRecentUsers: RecentUser[] = [
  { id: 1, email: 'jean.dupont@email.com', name: 'Jean Dupont', registeredAt: '2025-01-17', status: 'active' },
  { id: 2, email: 'marie.martin@email.com', name: 'Marie Martin', registeredAt: '2025-01-16', status: 'active' },
  { id: 3, email: 'pierre.b@email.com', name: 'Pierre Bernard', registeredAt: '2025-01-15', status: 'pending' },
  { id: 4, email: 'sophie.petit@email.com', name: 'Sophie Petit', registeredAt: '2025-01-14', status: 'active' },
  { id: 5, email: 'lucas.m@email.com', name: 'Lucas Moreau', registeredAt: '2025-01-13', status: 'inactive' },
];

const mockOutOfStockProducts: OutOfStockProduct[] = [
  { id: 1, name: 'Module Analytics Pro', stock: 0 },
  { id: 2, name: 'License Enterprise XL', stock: 2 },
  { id: 3, name: 'Pack Sécurité Avancé', stock: 1 },
];

// ========== HOOK ==========

export const useDashboard = (dateRange: '7d' | '30d' | '90d' | 'custom') => {
  const multiplier = dateRange === '7d' ? 0.25 : dateRange === '90d' ? 3 : 1;
  const days = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;

  const kpiData: KPIData = {
    revenue: Math.round(45678 * multiplier),
    revenueTrend: 12.5,
    orders: Math.round(234 * multiplier),
    ordersTrend: 8.3,
    activeCustomers: Math.round(1847 * (multiplier * 0.5 + 0.5)),
    customersTrend: 15.2,
    conversionRate: 23.5,
    conversionTrend: 2.1,
  };

  return {
    kpiData,
    revenueData: generateMockRevenueData(days),
    ordersData: generateMockOrdersData(days),
    topProducts: mockTopProducts,
    topServices: mockTopServices,
    recentOrders: mockRecentOrders,
    recentUsers: mockRecentUsers,
    outOfStockProducts: mockOutOfStockProducts,
    isLoading: false as const,
    isError: false as const,
  };
};
