import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';

// ========== TYPES ==========

export interface Order {
  id: string;
  ref: string;
  clientEmail: string;
  clientName: string;
  amount: number;
  itemsCount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  createdAt: string;
}

export interface OrderNote {
  id: string;
  text: string;
  date: string;
  by: string;
}

export interface OrderHistoryEntry {
  id: string;
  action: string;
  date: string;
  by: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderDetail {
  id: string;
  ref: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: string;
  clientEmail: string;
  clientFirstName: string;
  clientLastName: string;
  billingAddress: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentRef: string;
  paymentAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentDate?: string;
  history: OrderHistoryEntry[];
  notes: OrderNote[];
}

export interface PaginatedOrders {
  items: Order[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ========== NORMALIZERS ==========

function normalizeOrder(raw: any): Order {
  const firstName = raw.clientFirstName ?? '';
  const lastName = raw.clientLastName ?? '';
  const clientName = [firstName, lastName].filter(Boolean).join(' ') || (raw.clientEmail ?? '');

  return {
    id: raw.id,
    ref: raw.ref ?? '',
    clientEmail: raw.clientEmail ?? '',
    clientName,
    amount: parseFloat(raw.amount ?? 0),
    itemsCount: Array.isArray(raw.items) ? raw.items.length : 0,
    status: raw.status ?? 'pending',
    paymentStatus: raw.paymentStatus ?? 'pending',
    createdAt: raw.createdAt ?? '',
  };
}

function normalizeOrderDetail(raw: any): OrderDetail {
  const items: OrderItem[] = (raw.items ?? []).map((item: any, idx: number) => ({
    id: item.id ?? String(idx + 1),
    productName: item.productName ?? '',
    quantity: item.quantity ?? 1,
    unitPrice: parseFloat(item.unitPrice ?? 0),
    subtotal: parseFloat(item.subtotal ?? 0),
  }));

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const total = parseFloat(raw.amount ?? subtotal);
  const tax = parseFloat((total - subtotal).toFixed(2));

  const rawNotes = raw.notes;
  let notes: OrderNote[];
  if (Array.isArray(rawNotes)) {
    notes = rawNotes.map((n: any, idx: number) => ({
      id: n.id ?? String(idx + 1),
      text: n.text ?? n.action ?? '',
      date: n.date ?? raw.createdAt ?? '',
      by: n.by ?? 'Système',
    }));
  } else if (rawNotes && typeof rawNotes === 'string' && rawNotes.trim()) {
    notes = [{ id: '1', text: rawNotes, date: raw.createdAt ?? '', by: 'Système' }];
  } else {
    notes = [];
  }

  const history: OrderHistoryEntry[] = (raw.history ?? []).map((h: any, idx: number) => ({
    id: h.id ?? String(idx + 1),
    action: h.action ?? '',
    date: h.date ?? '',
    by: h.by ?? 'Système',
  }));

  return {
    id: raw.id,
    ref: raw.ref ?? '',
    status: raw.status ?? 'pending',
    createdAt: raw.createdAt ?? '',
    clientEmail: raw.clientEmail ?? '',
    clientFirstName: raw.clientFirstName ?? '',
    clientLastName: raw.clientLastName ?? '',
    billingAddress: raw.billingAddress ?? {},
    items,
    subtotal,
    tax,
    total,
    paymentRef: raw.paymentRef ?? '',
    paymentAmount: total,
    paymentStatus: raw.paymentStatus ?? 'pending',
    paymentDate: raw.paymentDate,
    history,
    notes,
  };
}

// ========== HOOKS ==========

export const useOrders = (params?: { page?: number; status?: string }) => {
  const page = params?.page ?? 1;
  const status = params?.status && params.status !== 'all' ? params.status : undefined;

  return useQuery({
    queryKey: ['orders', page, status],
    queryFn: async () => {
      const { data } = await api.get<any>('/orders', {
        params: { page, per_page: 25, ...(status ? { status } : {}) },
      });
      const items: Order[] = (data.items ?? []).map(normalizeOrder);
      return {
        items,
        total: data.total ?? items.length,
        page: data.page ?? page,
        per_page: data.per_page ?? 25,
        total_pages: data.total_pages ?? Math.ceil((data.total ?? items.length) / 25),
      } as PaginatedOrders;
    },
  });
};

export const useOrderDetail = (id: string) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const { data } = await api.get<any>(`/orders/${id}`);
      return normalizeOrderDetail(data);
    },
    enabled: !!id,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      trackingNumber,
    }: {
      id: string;
      status: string;
      trackingNumber?: string;
    }) => {
      const { data } = await api.patch(`/orders/${id}/status`, {
        status,
        trackingNumber,
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      paymentStatus,
    }: {
      id: string;
      paymentStatus: string;
    }) => {
      const { data } = await api.patch(`/orders/${id}/payment-status`, {
        paymentStatus,
      });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useAddOrderNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const { data } = await api.post(`/orders/${id}/notes`, { text });
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
    },
  });
};
