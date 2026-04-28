import { useQuery } from '@tanstack/react-query';
import { homeApi } from '../api/home.api';

export type { CarouselSlide } from '../types/home.types';

export function usePublicCarousel() {
  return useQuery({
    queryKey: ['carousel'],
    queryFn: homeApi.listCarousel,
    staleTime: 1000 * 60 * 10,
  });
}

