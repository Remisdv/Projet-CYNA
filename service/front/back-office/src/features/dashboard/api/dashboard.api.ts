import apiClient from '@/shared/lib/apiClient';
import type { DashboardStats, RecentOrdersResponse, RecentUsersResponse } from '../types/dashboard.types';

export const dashboardApi = {
  stats: async (days: number): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>('/stats', { params: { scope: 'dashboard', days } });
    return data;
  },
  recentOrders: async (limit = 5): Promise<RecentOrdersResponse> => {
    const { data } = await apiClient.get<RecentOrdersResponse>('/orders', {
      params: { per_page: limit, page: 1 },
    });
    return data;
  },
  recentUsers: async (limit = 5): Promise<RecentUsersResponse> => {
    const { data } = await apiClient.get<RecentUsersResponse>('/users', {
      params: { limit, page: 1, sort: 'createdAt:desc' },
    });
    return data;
  },
};
