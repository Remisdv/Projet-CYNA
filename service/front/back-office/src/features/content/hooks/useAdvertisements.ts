import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { advertisementsApi } from '../api/advertisements.api';
import type { Advertisement } from '../types/advertisement.types';

export type { Advertisement };

export const useAdvertisements = () =>
  useQuery({
    queryKey: ['advertisements'],
    queryFn: advertisementsApi.list,
  });

export const useCreateAdvertisement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adData: Partial<Advertisement>) => advertisementsApi.create(adData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
  });
};

export const useUpdateAdvertisement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adData }: { id: string; adData: Partial<Advertisement> }) =>
      advertisementsApi.update(id, adData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
  });
};

export const useActivateAdvertisement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => advertisementsApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
  });
};

export const useDeleteAdvertisement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => advertisementsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
    },
  });
};

