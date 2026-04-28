import { apiClient } from '@/shared/lib/apiClient';
import type { Advertisement } from '../types/home.types';

export const homeApi = {
  getActiveAdvertisement: async (): Promise<Advertisement | null> => {
    const { data } = await apiClient.get<any>('/webapp/advertisements', { params: { isActive: true } });
    if (!data) return null;
    const list: Advertisement[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : (data?.data ? [data.data] : [data]);
    return list[0] ?? null;
  },
};
