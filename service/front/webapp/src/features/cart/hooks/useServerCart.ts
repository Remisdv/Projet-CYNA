import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cart.api';
import type { AddToCartInput } from '../types/cart.types';

export type { ServerCartItem } from '../types/cart.types';

export function useServerCart(enabled: boolean) {
  return useQuery({
    queryKey: ['server-cart'],
    queryFn: cartApi.list,
    enabled,
    staleTime: 1000 * 30,
  });
}

export function useAddToServerCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item: AddToCartInput) => cartApi.add(item),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['server-cart'] }),
  });
}

export function useUpdateServerCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => cartApi.update(id, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['server-cart'] }),
  });
}

export function useRemoveServerCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cartApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['server-cart'] }),
  });
}

export function useClearServerCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['server-cart'] }),
  });
}

export function useMergeCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: AddToCartInput[]) => cartApi.merge(items),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['server-cart'] }),
  });
}

