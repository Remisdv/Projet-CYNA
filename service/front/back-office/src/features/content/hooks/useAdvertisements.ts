import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';

export interface Advertisement {
  id: string;
  textFr: string;
  textEn: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
