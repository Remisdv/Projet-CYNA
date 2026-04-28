import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/lib/apiClient';

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
