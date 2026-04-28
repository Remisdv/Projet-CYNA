import { apiClient } from '@/shared/lib/apiClient';
import type { ServerCartItem, ServerCartResponse, AddToCartInput } from '../types/cart.types';

export const cartApi = {
  list: async (): Promise<ServerCartItem[]> => {
    const { data } = await apiClient.get<ServerCartResponse>('/webapp/cart');
    return data.items ?? [];
  },
  add: async (item: AddToCartInput): Promise<unknown> => {
    const { data } = await apiClient.post('/webapp/cart/items', item);
    return data;
  },
  update: async (id: string, quantity: number): Promise<unknown> => {
    const { data } = await apiClient.put(`/webapp/cart/items/${id}`, { quantity });
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/webapp/cart/items/${id}`);
  },
  clear: async (): Promise<void> => {
    await apiClient.delete('/webapp/cart');
  },
  merge: async (items: AddToCartInput[]): Promise<ServerCartItem[]> => {
    const { data } = await apiClient.post<ServerCartResponse>('/webapp/cart/merge', { items });
    return data.items ?? [];
  },
};
