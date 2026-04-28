import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';

export interface ServerCartItem {
  id: string;
  productId: string;
  productName: string;
  productType: string;
  quantity: number;
  prix?: number;
  prixMensuel?: number;
  prixAnnuel?: number;
  periodicity?: string;
  image?: string;
}

export function useServerCart(enabled: boolean) {
  return useQuery({
    queryKey: ['server-cart'],
    queryFn: async () => {
      const { data } = await apiClient.get('/webapp/cart');
      return (data.items ?? []) as ServerCartItem[];
    },
    enabled,
    staleTime: 1000 * 30,
  });
}

export function useAddToServerCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<ServerCartItem, 'id'>) => {
      const { data } = await apiClient.post('/webapp/cart/items', item);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['server-cart'] }),
  });
}

export function useUpdateServerCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data } = await apiClient.put(`/webapp/cart/items/${id}`, { quantity });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['server-cart'] }),
  });
}

export function useRemoveServerCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/webapp/cart/items/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['server-cart'] }),
  });
}

export function useClearServerCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete('/webapp/cart');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['server-cart'] }),
  });
}

export function useMergeCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: Omit<ServerCartItem, 'id'>[]) => {
      const { data } = await apiClient.post('/webapp/cart/merge', { items });
      return (data.items ?? []) as ServerCartItem[];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['server-cart'] }),
  });
}
