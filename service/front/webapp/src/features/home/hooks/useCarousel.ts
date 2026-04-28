import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';

export interface CarouselSlide {
  id: string;
  titre?: string;
  description?: string;
  image?: string;
  lien?: string;
  ordre?: number;
}

export function usePublicCarousel() {
  return useQuery({
    queryKey: ['carousel'],
    queryFn: async () => {
      const { data } = await apiClient.get('/webapp/carousel');
      return (data?.data ?? data ?? []) as CarouselSlide[];
    },
    staleTime: 1000 * 60 * 10,
  });
}
