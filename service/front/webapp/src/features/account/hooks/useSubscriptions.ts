import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export interface Subscription {
  id: number;
  productId: string;
  productName: string;
  planType: 'mensuel' | 'annuel';
  status: 'active' | 'cancelled' | 'expired';
  price: number;
  startDate: string;
  renewalDate?: string;
  createdAt: string;
}

export function useSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const { data } = await api.get('/webapp/subscriptions');
      return data as Subscription[];
    },
  });
}

export function useSubscription(id: number | string) {
  return useQuery({
    queryKey: ['subscriptions', id],
    queryFn: async () => {
      const { data } = await api.get(`/webapp/subscriptions/${id}`);
      return data as Subscription;
    },
    enabled: !!id,
  });
}
