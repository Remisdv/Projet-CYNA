import { apiClient } from '@/shared/lib/apiClient';
import type { Category, Product, ProductFilters } from '../types/catalog.types';

interface RawImage {
  url?: string;
}

function normalizeImages(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((img) => (typeof img === 'string' ? img : (img as RawImage)?.url ?? ''));
}

function normalizeProduct(p: Record<string, unknown>): Product {
  return {
    ...(p as unknown as Product),
    description: (p.description_courte as string | undefined) ?? (p.description as string | undefined) ?? '',
    description_longue: p.description_longue as string | undefined,
    images: normalizeImages(p.images),
  };
}

export const catalogApi = {
  listCategories: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<{ data?: Category[] } | Category[]>('/bo/categories');
    const list = (Array.isArray(data) ? data : data?.data ?? []) as Category[];
    return list.filter((c) => c.isActive !== false);
  },
  listProducts: async (filters?: ProductFilters): Promise<Product[]> => {
    const params = new URLSearchParams();
    params.set('statut', filters?.statut ?? 'publié');
    if (filters?.categorie) params.set('categorie', filters.categorie);
    if (filters?.type) params.set('type', filters.type);
    if (filters?.q) params.set('q', filters.q);
    const { data } = await apiClient.get<{ data?: unknown[] } | unknown[]>(`/products?${params}`);
    const list = (Array.isArray(data) ? data : data?.data ?? []) as Record<string, unknown>[];
    return list.map(normalizeProduct);
  },
  getProduct: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<{ data?: unknown } | unknown>(`/products/${id}`);
    const payload = (data && typeof data === 'object' && 'data' in (data as object))
      ? (data as { data: Record<string, unknown> }).data
      : (data as Record<string, unknown>);
    return normalizeProduct(payload);
  },
  searchProducts: async (q: string): Promise<Product[]> => {
    const { data } = await apiClient.get<{ data?: Product[] } | Product[]>(`/products?q=${encodeURIComponent(q)}`);
    return (Array.isArray(data) ? data : data?.data ?? []) as Product[];
  },
};
