import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../api/catalog.api';
import type { ProductFilters } from '../types/catalog.types';

export type { Product } from '../types/catalog.types';

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => catalogApi.listProducts(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => catalogApi.getProduct(id as string),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductSearch(q: string) {
  return useQuery({
    queryKey: ['products', 'search', q],
    queryFn: () => catalogApi.searchProducts(q),
    enabled: q.trim().length >= 2,
    staleTime: 1000 * 60 * 2,
  });
}

