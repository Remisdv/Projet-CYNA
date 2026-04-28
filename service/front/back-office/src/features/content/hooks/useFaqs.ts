import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/lib/apiClient';

export interface Faq {
  id: string;
  parentId: string | null;
  question: string;
  answer: string;
  lang: string;
  order: number;
  children?: Faq[];
}

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
