import { useQuery } from '@tanstack/react-query';
import { accountApi } from '../api/account.api';

export type { OrderItem, OrderCredential, Order, TrackingData } from '../types/account.types';

export function useOrders(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['orders', page, limit],
    queryFn: () => accountApi.listOrders(page, limit),
  });
}

export function useOrder(id: number | string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => accountApi.getOrder(id),
    enabled: !!id,
  });
}

export function useOrderTracking(id: number | string) {
  return useQuery({
    queryKey: ['orders', id, 'tracking'],
    queryFn: () => accountApi.getOrderTracking(id),
    enabled: !!id,
  });
}

export function downloadInvoice(orderId: number | string) {
  return accountApi.downloadInvoice(orderId);
}

