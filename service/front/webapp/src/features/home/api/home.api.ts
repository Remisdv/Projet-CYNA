import { apiClient } from '@/shared/lib/apiClient';
import type { Advertisement, CarouselSlide } from '../types/home.types';

export const homeApi = {
  getActiveAdvertisement: async (): Promise<Advertisement | null> => {
    const { data } = await apiClient.get<{ data?: Advertisement } | Advertisement | null>('/webapp/advertisements/active');
    if (!data) return null;
    return ('data' in (data as object) ? (data as { data: Advertisement }).data : (data as Advertisement)) ?? null;
  },
  listCarousel: async (): Promise<CarouselSlide[]> => {
    const { data } = await apiClient.get<{ data?: CarouselSlide[] } | CarouselSlide[]>('/webapp/carousel');
    return (Array.isArray(data) ? data : data?.data ?? []) as CarouselSlide[];
  },
};
