import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export interface Advertisement {
  id: string;
  textFr?: string;
  textEn?: string;
  isActive?: boolean;
}

export function useActiveAdvertisement() {
  return useQuery({
    queryKey: ['advertisement', 'active'],
    queryFn: async () => {
      const { data } = await api.get('/webapp/advertisements/active');
      return (data?.data ?? data) as Advertisement | null;
    },
    staleTime: 1000 * 60 * 10,
  });
}
