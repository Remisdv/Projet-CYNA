import apiClient from '@/shared/lib/apiClient';
import type { Advertisement } from '../types/advertisement.types';

export const advertisementsApi = {
  list: async (): Promise<Advertisement[]> => {
    const { data } = await apiClient.get<Advertisement[]>('/advertisements');
    return data;
  },
  create: async (adData: Partial<Advertisement>): Promise<Advertisement> => {
    const { data } = await apiClient.post<Advertisement>('/advertisements', adData);
    return data;
  },
  update: async (id: string, adData: Partial<Advertisement>): Promise<Advertisement> => {
    const { data } = await apiClient.put<Advertisement>(`/advertisements/${id}`, adData);
    return data;
  },
  activate: async (id: string): Promise<Advertisement> => {
    const { data } = await apiClient.patch<Advertisement>(`/advertisements/${id}/activate`);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/advertisements/${id}`);
  },
};
