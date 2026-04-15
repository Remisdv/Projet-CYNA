import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

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
      const { data } = await api.get('/webapp/carousel');
      return (data?.data ?? data ?? []) as CarouselSlide[];
    },
    staleTime: 1000 * 60 * 10,
  });
}
