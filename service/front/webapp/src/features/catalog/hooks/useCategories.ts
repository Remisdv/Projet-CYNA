import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export interface Category {
  id: string;
  nom: string;
  description?: string;
  image?: string;
}

export function usePublicCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return (data?.data ?? data ?? []) as Category[];
    },
    staleTime: 1000 * 60 * 10,
  });
}
