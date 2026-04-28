import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { faqsApi } from '../api/faqs.api';
import type { Faq, CreateFaqInput } from '../types/faq.types';

export type { Faq };

export const useFaqTree = (lang?: string) =>
  useQuery({
    queryKey: ['faqs', 'tree', lang],
    queryFn: () => faqsApi.tree(lang),
  });

export const useFaq = (id: string | undefined) =>
  useQuery({
    queryKey: ['faqs', id],
    queryFn: () => faqsApi.byId(id as string),
    enabled: !!id,
  });

export const useCreateFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (faqData: CreateFaqInput) => faqsApi.create(faqData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

export const useUpdateFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, faqData }: { id: string; faqData: Partial<Faq> }) =>
      faqsApi.update(id, faqData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

export const useDeleteFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => faqsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

export const useReorderFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, order }: { id: string; order: number }) => faqsApi.reorder(id, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

