import { useQuery } from '@tanstack/react-query';
import { homeApi } from '../api/home.api';

export type { Advertisement } from '../types/home.types';

export function useActiveAdvertisement() {
  return useQuery({
    queryKey: ['advertisement', 'active'],
    queryFn: homeApi.getActiveAdvertisement,
    staleTime: 1000 * 60 * 10,
  });
}

