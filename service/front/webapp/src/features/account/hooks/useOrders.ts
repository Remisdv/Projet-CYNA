import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';

export interface OrderItem {
  productId: string;
  productName: string;
  type: 'produit' | 'service';
  quantity: number;
  unitPrice: number;
  periodicity?: string;
}

export interface Order {
  id: number;
  ref: string;
  items: OrderItem[];
  amount: number;
  status: string;
  paymentStatus: string;
  billingAddress: Record<string, string>;
  shippingAddress?: Record<string, string>;
  createdAt: string;
}

export function useOrders(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['orders', page, limit],
    queryFn: async () => {
      const { data } = await api.get(`/webapp/orders?page=${page}&limit=${limit}`);
      return data as { data: Order[]; total: number; page: number; limit: number };
    },
  });
}

export function useOrder(id: number | string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const { data } = await api.get(`/webapp/orders/${id}`);
      return data as Order;
    },
    enabled: !!id,
  });
}

export function downloadInvoice(orderId: number | string) {
  return api.get(`/webapp/orders/${orderId}/invoice`, {
    responseType: 'blob',
  }).then((response) => {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `facture-${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  });
}
