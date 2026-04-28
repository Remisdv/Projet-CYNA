import { apiClient } from '@/shared/lib/apiClient';
import type { Service, UploadedImage } from '../types/service.types';

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
    // Le gateway convertit déjà statut "publié"/"brouillon" en status "published"/"draft".
    // On accepte aussi "publié" au cas où la réponse brute du service-api passerait.
    status: (raw.status === 'published' || raw.status === 'publié') ? 'published' : 'draft',
    type: isService ? 'service' : 'product',
    shortDescription: raw.shortDescription ?? '',
    longDescription: raw.longDescription,
    tags: raw.tags ?? [],
    slug: raw.slug ?? '',
    metaTitle: raw.metaTitle ?? '',
    metaDescription: raw.metaDescription ?? '',
    keywords: raw.keywords ?? '',
    images: (raw.images ?? []).map((img: any) => ({
      id: img.id ?? '',
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

export const servicesApi = {
  list: async (): Promise<Service[]> => {
    const { data } = await apiClient.get<any>('/services', {
      params: { per_page: 100 },
    });
    const items: any[] = data.data ?? data.items ?? (Array.isArray(data) ? data : []);
    return items.map(normalizeService);
  },
  create: async (serviceData: Record<string, any>): Promise<Service> => {
    const { data } = await apiClient.post<Service>('/services', serviceData);
    return data;
  },
  update: async (id: string, serviceData: Record<string, any>): Promise<Service> => {
    const { data } = await apiClient.put<Service>(`/services/${id}`, serviceData);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/services/${id}`);
  },
  publish: async (id: string): Promise<Service> => {
    const { data } = await apiClient.post<Service>(`/services/${id}/publish`);
    return data;
  },
  duplicate: async (id: string): Promise<Service> => {
    const { data } = await apiClient.post<Service>(`/services/${id}/duplicate`);
    return data;
  },
  addImages: async (
    id: string,
    images: Array<{ url: string; est_principale?: boolean }>
  ) => {
    const { data } = await apiClient.post(`/services/${id}/images`, { images });
    return data;
  },
  deleteImage: async (serviceId: string, imageId: string) => {
    const { data } = await apiClient.delete(`/services/${serviceId}/images/${imageId}`);
    return data;
  },
  uploadImages: async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const { data } = await apiClient.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.urls as string[];
  },
  uploadImagesMultipart: async (files: File[]): Promise<{ images: UploadedImage[] }> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const { data } = await apiClient.post('/api/bo/services/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
