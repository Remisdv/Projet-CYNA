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

function normalizeImages(raw: any[]): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((img: any) => (typeof img === 'string' ? img : img?.url ?? ''));
}

function normalizeProduct(p: any): Product {
  return { ...p, images: normalizeImages(p.images) };
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
      const list = (data?.data ?? data ?? []) as any[];
      return list.map(normalizeProduct);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return normalizeProduct(data?.data ?? data);
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
