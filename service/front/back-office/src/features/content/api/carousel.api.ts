import apiClient from '@/shared/lib/apiClient';
import type { CarouselItem } from '../types/carousel.types';

export const carouselApi = {
  list: async (): Promise<CarouselItem[]> => {
    const { data } = await apiClient.get<CarouselItem[]>('/carousel');
    return data;
  },
  create: async (itemData: Partial<CarouselItem>): Promise<CarouselItem> => {
    const { data } = await apiClient.post<CarouselItem>('/carousel', itemData);
    return data;
  },
  update: async (id: string, itemData: Partial<CarouselItem>): Promise<CarouselItem> => {
    const { data } = await apiClient.put<CarouselItem>(`/carousel/${id}`, itemData);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/carousel/${id}`);
  },
};
