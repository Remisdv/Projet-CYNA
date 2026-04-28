import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '../api/services.api';
import { categoriesApi } from '../api/categories.api';
import type { ServiceCategory } from '../types/service.types';

const SERVICES_KEY = ['services'] as const;
const CATEGORIES_KEY = ['categories'] as const;

export const useServices = () => {
  return useQuery({
    queryKey: SERVICES_KEY,
    queryFn: servicesApi.list,
  });
};

export const useServiceCategories = (allCategoriesLabel = 'Toutes les catégories') => {
  const query = useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: categoriesApi.list,
  });

  const categories: ServiceCategory[] = [
    { value: '', label: allCategoriesLabel },
    ...(query.data ?? []).map((c) => {
      const translation = c.translations.find((t) => t.lang === 'fr') ?? c.translations[0];
      return { value: c.id, label: translation?.name ?? c.slug };
    }),
  ];

  return {
    data: categories,
    isLoading: query.isLoading,
  };
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (serviceData: Record<string, any>) => servicesApi.create(serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...serviceData }: Record<string, any> & { id: string }) =>
      servicesApi.update(id, serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    },
  });
};

export const usePublishService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesApi.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    },
  });
};

export const useDuplicateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    },
  });
};

export const useAddServiceImages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      images,
    }: {
      id: string;
      images: Array<{ url: string; est_principale?: boolean }>;
    }) => servicesApi.addImages(id, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    },
  });
};

export const useDeleteServiceImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, imageId }: { serviceId: string; imageId: string }) =>
      servicesApi.deleteImage(serviceId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    },
  });
};

export const useUploadImages = () => {
  return useMutation({
    mutationFn: (files: File[]) => servicesApi.uploadImages(files),
  });
};

export const useUploadServiceImagesMultipart = () => {
  return useMutation({
    mutationFn: (files: File[]) => servicesApi.uploadImagesMultipart(files),
  });
};
