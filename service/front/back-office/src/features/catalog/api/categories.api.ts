import { apiClient } from '@/shared/lib/apiClient';
import type { Category, CategoryInput } from '../types/category.types';

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>('/categories');
    return data;
  },
  create: async (input: CategoryInput): Promise<Category> => {
    const { data } = await apiClient.post<Category>('/categories', input);
    return data;
  },
  update: async (id: string, input: CategoryInput): Promise<Category> => {
    const { data } = await apiClient.put<Category>(`/categories/${id}`, input);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
