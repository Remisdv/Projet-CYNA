import { apiClient } from '@/shared/lib/apiClient';
import type {
  Profile,
  UpdateProfileData,
  ChangePasswordData,
  Order,
  OrdersListResponse,
  TrackingData,
  Subscription,
} from '../types/account.types';

export const accountApi = {
  getProfile: async (): Promise<Profile> => {
    const { data } = await apiClient.get<Profile>('/webapp/account/profile');
    return data;
  },
  updateProfile: async (profileData: UpdateProfileData): Promise<Profile> => {
    const { data } = await apiClient.put<Profile>('/webapp/account/profile', profileData);
    return data;
  },
  changePassword: async (passwordData: ChangePasswordData): Promise<unknown> => {
    const { data } = await apiClient.put('/webapp/account/password', passwordData);
    return data;
  },
  listOrders: async (page = 1, limit = 10): Promise<OrdersListResponse> => {
    const { data } = await apiClient.get<OrdersListResponse>(`/webapp/orders?page=${page}&limit=${limit}`);
    return data;
  },
  getOrder: async (id: number | string): Promise<Order> => {
    const { data } = await apiClient.get<Order>(`/webapp/orders/${id}`);
    return data;
  },
  getOrderTracking: async (id: number | string): Promise<TrackingData> => {
    const { data } = await apiClient.get<TrackingData>(`/webapp/orders/${id}/tracking`);
    return data;
  },
  downloadInvoice: async (orderId: number | string): Promise<void> => {
    const response = await apiClient.get(`/webapp/orders/${orderId}/invoice`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `facture-${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  listSubscriptions: async (): Promise<Subscription[]> => {
    const { data } = await apiClient.get<Subscription[]>('/webapp/subscriptions');
    return data;
  },
  getSubscription: async (id: number | string): Promise<Subscription> => {
    const { data } = await apiClient.get<Subscription>(`/webapp/subscriptions/${id}`);
    return data;
  },
};
