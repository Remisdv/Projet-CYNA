import apiClient from '@/shared/lib/apiClient';
import type { CommercialStats } from '../types/commercial.types';

export const commercialApi = {
  stats: async (days: number): Promise<CommercialStats> => {
    const { data } = await apiClient.get<CommercialStats>('/stats/commercial', { params: { days } });
    return data;
  },
};
