import { useQuery } from '@tanstack/react-query';
import { accountApi } from '../api/account.api';

export type { Subscription } from '../types/account.types';

export function useSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: accountApi.listSubscriptions,
  });
}

export function useSubscription(id: number | string) {
  return useQuery({
    queryKey: ['subscriptions', id],
    queryFn: () => accountApi.getSubscription(id),
    enabled: !!id,
  });
}

