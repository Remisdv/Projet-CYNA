import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export interface Product {
  id: string;
  nom: string;
  description: string;
  prix_mensuel?: number;
  prix_annuel?: number;
  prix?: number;
  type: 'produit' | 'service';
  statut: 'publié' | 'archivé';
  categorie?: string;
  images?: string[];
  caracteristiques?: Record<string, string>;
}

interface ProductFilters {
  categorie?: string;
  type?: string;
  q?: string;
  statut?: string;
}

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('statut', filters?.statut ?? 'publié');
      if (filters?.categorie) params.set('categorie', filters.categorie);
      if (filters?.type) params.set('type', filters.type);
      if (filters?.q) params.set('q', filters.q);
      const { data } = await api.get(`/products?${params}`);
      return (data?.data ?? data ?? []) as Product[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return (data?.data ?? data) as Product;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductSearch(q: string) {
  return useQuery({
    queryKey: ['products', 'search', q],
    queryFn: async () => {
      const { data } = await api.get(`/products/search?q=${encodeURIComponent(q)}`);
      return (data?.data ?? data ?? []) as Product[];
    },
    enabled: q.trim().length >= 2,
    staleTime: 1000 * 60 * 2,
  });
}
