import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';

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

export interface CategoryInput {
  slug: string;
  isActive?: boolean;
  translations: Array<{
    lang: string;
    name: string;
    description?: string;
  }>;
}

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
    mutationFn: async (categoryData: CategoryInput) => {
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
    mutationFn: async ({ id, categoryData }: { id: string; categoryData: CategoryInput }) => {
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
