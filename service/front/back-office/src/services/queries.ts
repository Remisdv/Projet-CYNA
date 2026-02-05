import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  emailVerifiedAt: string | null;
  roles: Array<{ id: string; role: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  isActive: boolean;
  translations: Array<{
    id: string;
    lang: string;
    name: string;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  categoryId: string;
  slug: string;
  isActive: boolean;
  translations: Array<{
    id: string;
    lang: string;
    name: string;
    description: string;
    features: string;
  }>;
  plans: Array<{
    id: string;
    name: string;
    price: number;
    durationMonths: number;
    lemonProductId: string | null;
  }>;
  stock: {
    id: string;
    quantityAvailable: number;
    lowStockThreshold: number;
    updatedAt: string;
  } | null;
  images: Array<{
    id: string;
    url: string;
    altText: string;
    size: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  id: string;
  parentId: string | null;
  question: string;
  answer: string;
  lang: string;
  order: number;
}

export interface CarouselItem {
  id: string;
  imageId: string;
  title: string;
  text: string;
  link: string;
  order: number;
  image?: {
    id: string;
    url: string;
    altText: string;
  };
}

export interface Advertisement {
  id: string;
  textFr: string;
  textEn: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Faq {
  id: string;
  parentId: string | null;
  question: string;
  answer: string;
  lang: string;
  order: number;
  children?: Faq[];
}

export interface DashboardStats {
  totalRevenue: number;
  activeSubscriptions: number;
  topServices: Array<{
    serviceId: string;
    serviceName: string;
    revenue: number;
    orders: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
  }>;
}

// Dashboard Queries
export const useDashboardStats = (range: string = '30d') => {
  return useQuery({
    queryKey: ['dashboard', 'stats', range],
    queryFn: async () => {
      const { data } = await api.get<DashboardStats>(`/dashboard/overview?range=${range}`);
      return data;
    },
  });
};

// Users Queries
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get<User[]>('/users');
      return data;
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: async () => {
      const { data } = await api.get<User>(`/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData: Partial<User> & { password: string }) => {
      const { data } = await api.post<User>('/users', userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: Partial<User> }) => {
      const { data } = await api.put<User>(`/users/${id}`, userData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Categories Queries
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<Category[]>('/categories');
      return data;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryData: Partial<Category>) => {
      const { data } = await api.post<Category>('/categories', categoryData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, categoryData }: { id: string; categoryData: Partial<Category> }) => {
      const { data } = await api.put<Category>(`/categories/${id}`, categoryData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Services Queries
export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data } = await api.get<Service[]>('/services');
      return data;
    },
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: ['services', id],
    queryFn: async () => {
      const { data } = await api.get<Service>(`/services/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (serviceData: Partial<Service>) => {
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
    mutationFn: async ({ id, serviceData }: { id: string; serviceData: Partial<Service> }) => {
      const { data } = await api.put<Service>(`/services/${id}`, serviceData);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['services', variables.id] });
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

// Low Stock Query
export const useLowStockServices = () => {
  return useQuery({
    queryKey: ['stocks', 'low'],
    queryFn: async () => {
      const { data } = await api.get<Service[]>('/stocks/low');
      return data;
    },
  });
};

// FAQ Queries
export const useFAQs = () => {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const { data } = await api.get<FAQ[]>('/faq');
      return data;
    },
  });
};

export const useCreateFAQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (faqData: Partial<FAQ>) => {
      const { data } = await api.post<FAQ>('/faq', faqData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

export const useUpdateFAQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, faqData }: { id: string; faqData: Partial<FAQ> }) => {
      const { data } = await api.put<FAQ>(`/faq/${id}`, faqData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

export const useDeleteFAQ = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/faq/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

// Carousel Queries
export const useCarouselItems = () => {
  return useQuery({
    queryKey: ['carousel'],
    queryFn: async () => {
      const { data } = await api.get<CarouselItem[]>('/carousel');
      return data;
    },
  });
};

export const useCreateCarouselItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemData: Partial<CarouselItem>) => {
      const { data } = await api.post<CarouselItem>('/carousel', itemData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel'] });
    },
  });
};

export const useUpdateCarouselItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, itemData }: { id: string; itemData: Partial<CarouselItem> }) => {
      const { data } = await api.put<CarouselItem>(`/carousel/${id}`, itemData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel'] });
    },
  });
};

export const useDeleteCarouselItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/carousel/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel'] });
    },
  });
};

// Advertisements Queries
export const useAdvertisements = () => {
  return useQuery({
    queryKey: ['advertisements'],
    queryFn: async () => {
      const { data } = await api.get<Advertisement[]>('/advertisements');
      return data;
    },
  });
};

export const useCreateAdvertisement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (adData: Partial<Advertisement>) => {
      const { data } = await api.post<Advertisement>('/advertisements', adData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
  });
};

export const useUpdateAdvertisement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, adData }: { id: string; adData: Partial<Advertisement> }) => {
      const { data } = await api.put<Advertisement>(`/advertisements/${id}`, adData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
  });
};

export const useActivateAdvertisement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<Advertisement>(`/advertisements/${id}/activate`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
  });
};

export const useDeleteAdvertisement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/advertisements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
  });
};

// FAQ Queries
export const useFaqs = () => {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const { data } = await api.get<Faq[]>('/faqs');
      return data;
    },
  });
};

export const useFaqTree = (lang?: string) => {
  return useQuery({
    queryKey: ['faqs', 'tree', lang],
    queryFn: async () => {
      const { data } = await api.get<Faq[]>('/faqs/tree', {
        params: { lang },
      });
      return data;
    },
  });
};

export const useFaq = (id: string | undefined) => {
  return useQuery({
    queryKey: ['faqs', id],
    queryFn: async () => {
      const { data } = await api.get<Faq>(`/faqs/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (faqData: { parentId?: string | null; question: string; answer?: string; lang: string; order?: number }) => {
      const { data } = await api.post<Faq>('/faqs', faqData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

export const useUpdateFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, faqData }: { id: string; faqData: Partial<Faq> }) => {
      const { data } = await api.put<Faq>(`/faqs/${id}`, faqData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

export const useDeleteFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/faqs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

export const useReorderFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, order }: { id: string; order: number }) => {
      const { data } = await api.put<Faq>(`/faqs/${id}/reorder`, { order });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

// File Upload
export const useUploadFile = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<{ id: string; url: string }>('/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
  });
};
