import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { carouselApi } from '../api/carousel.api';
import type { CarouselItem } from '../types/carousel.types';

export type { CarouselItem };

export const useCarouselItems = () =>
  useQuery({
    queryKey: ['carousel'],
    queryFn: carouselApi.list,
  });

export const useCreateCarouselItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemData: Partial<CarouselItem>) => carouselApi.create(itemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel'] });
    },
  });
};

export const useUpdateCarouselItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, itemData }: { id: string; itemData: Partial<CarouselItem> }) =>
      carouselApi.update(id, itemData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel'] });
    },
  });
};

export const useDeleteCarouselItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => carouselApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carousel'] });
    },
  });
};

