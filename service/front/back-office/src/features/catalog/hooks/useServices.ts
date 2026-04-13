import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';

// ========== TYPES ==========

export interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
  monthlyPrice?: number;
  annualPrice?: number;
  annualDiscountPct?: number;
  stock: number | 'unlimited';
  lowStockThreshold: number;
  status: 'draft' | 'published';
  type: 'product' | 'service';
  shortDescription: string;
  longDescription?: string;
  tags: string[];
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  images: Array<{ url: string; altText: string; isPrimary: boolean }>;
  updatedAt: string;
  createdAt: string;
  autoRenewal?: boolean;
  demoAvailable?: boolean;
  periodicity?: string;
}

export interface ServiceCategory {
  value: string;
  label: string;
}

// ========== NORMALIZE ==========

function normalizeService(raw: any): Service {
  const isService = raw.type === 'service';
  return {
    id: raw.id,
    name: raw.name ?? '',
    category: raw.category ?? '',
    price: isService ? (raw.monthlyPrice ?? raw.price ?? 0) : (raw.price ?? 0),
    monthlyPrice: raw.monthlyPrice,
    annualPrice: raw.annualPrice,
    annualDiscountPct: raw.annualDiscountPct,
    stock: raw.unlimitedStock ? 'unlimited' : (raw.stock ?? 0),
    lowStockThreshold: raw.lowStockThreshold ?? 10,
    status: raw.status === 'publié' ? 'published' : 'draft',
    type: isService ? 'service' : 'product',
    shortDescription: raw.shortDescription ?? '',
    longDescription: raw.longDescription,
    tags: raw.tags ?? [],
    slug: raw.slug ?? '',
    metaTitle: raw.metaTitle ?? '',
    metaDescription: raw.metaDescription ?? '',
    keywords: raw.keywords ?? '',
    images: (raw.images ?? []).map((img: any) => ({
      url: img.url ?? '',
      altText: img.altText ?? img.alt_text ?? '',
      isPrimary: img.isPrimary ?? img.est_principale ?? false,
    })),
    updatedAt: raw.updatedAt ?? '',
    createdAt: raw.createdAt ?? '',
    autoRenewal: raw.autoRenewal,
    demoAvailable: raw.demoAvailable,
    periodicity: raw.periodicity,
  };
}

// ========== HOOKS ==========

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data } = await api.get<any>('/services', {
        params: { per_page: 100 },
      });
      const items: any[] = data.data ?? data.items ?? (Array.isArray(data) ? data : []);
      return items.map(normalizeService);
    },
  });
};

const FALLBACK_CATEGORIES: ServiceCategory[] = [
  { value: '', label: 'Toutes les catégories' },
  { value: 'SOC', label: 'SOC' },
  { value: 'EDR', label: 'EDR' },
  { value: 'XDR', label: 'XDR' },
  { value: 'Service', label: 'Service' },
];

export const useServiceCategories = () => {
  const query = useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data } = await api.get<{ id: string; nom: string; slug: string }[]>(
        '/categories',
        { baseURL: '/api' },
      );
      if (!data || data.length === 0) return FALLBACK_CATEGORIES;
      return [
        { value: '', label: 'Toutes les catégories' },
        ...data.map((c) => ({ value: c.nom, label: c.nom })),
      ] as ServiceCategory[];
    },
  });
  return {
    data: query.data ?? FALLBACK_CATEGORIES,
    isLoading: query.isLoading,
  };
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (serviceData: Record<string, any>) => {
      const { data } = await api.post<Service>('/services', serviceData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...serviceData }: Record<string, any> & { id: string }) => {
      const { data } = await api.put<Service>(`/services/${id}`, serviceData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const usePublishService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<Service>(`/services/${id}/publish`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useDuplicateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<Service>(`/services/${id}/duplicate`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};
