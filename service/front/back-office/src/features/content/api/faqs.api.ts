import apiClient from '@/shared/lib/apiClient';
import type { Faq, CreateFaqInput } from '../types/faq.types';

export const faqsApi = {
  tree: async (lang?: string): Promise<Faq[]> => {
    const { data } = await apiClient.get<Faq[]>('/faqs/tree', { params: { lang } });
    return data;
  },
  byId: async (id: string): Promise<Faq> => {
    const { data } = await apiClient.get<Faq>(`/faqs/${id}`);
    return data;
  },
  create: async (faqData: CreateFaqInput): Promise<Faq> => {
    const { data } = await apiClient.post<Faq>('/faqs', faqData);
    return data;
  },
  update: async (id: string, faqData: Partial<Faq>): Promise<Faq> => {
    const { data } = await apiClient.put<Faq>(`/faqs/${id}`, faqData);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/faqs/${id}`);
  },
  reorder: async (id: string, order: number): Promise<Faq> => {
    const { data } = await apiClient.put<Faq>(`/faqs/${id}/reorder`, { order });
    return data;
  },
};
