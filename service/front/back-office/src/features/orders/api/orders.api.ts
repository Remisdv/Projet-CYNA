import { apiClient } from '@/shared/lib/apiClient';
import type {
  Order,
  OrderDetail,
  OrderItem,
  OrderNote,
  OrderHistoryEntry,
  PaginatedOrders,
} from '../types/order.types';

function normalizeOrder(raw: any): Order {
  const firstName = raw.clientFirstName ?? '';
  const lastName = raw.clientLastName ?? '';
  const clientName =
    [firstName, lastName].filter(Boolean).join(' ') || (raw.clientEmail ?? '');

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
    productType: item.productType,
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

  const history: OrderHistoryEntry[] = (raw.history ?? []).map(
    (h: any, idx: number) => ({
      id: h.id ?? String(idx + 1),
      action: h.action ?? '',
      date: h.date ?? '',
      by: h.by ?? 'Système',
    })
  );

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
    trackingNumber: raw.trackingNumber,
    credentials: raw.credentials ?? [],
    history,
    notes,
  };
}

export const ordersApi = {
  list: async (params?: { page?: number; status?: string }): Promise<PaginatedOrders> => {
    const page = params?.page ?? 1;
    const status =
      params?.status && params.status !== 'all' ? params.status : undefined;
    const { data } = await apiClient.get<any>('/orders', {
      params: { page, per_page: 25, ...(status ? { status } : {}) },
    });
    const items: Order[] = (data.items ?? []).map(normalizeOrder);
    return {
      items,
      total: data.total ?? items.length,
      page: data.page ?? page,
      per_page: data.per_page ?? 25,
      total_pages: data.total_pages ?? Math.ceil((data.total ?? items.length) / 25),
    };
  },
  getById: async (id: string): Promise<OrderDetail> => {
    const { data } = await apiClient.get<any>(`/orders/${id}`);
    return normalizeOrderDetail(data);
  },
  updateStatus: async (id: string, status: string, trackingNumber?: string) => {
    const { data } = await apiClient.patch(`/orders/${id}`, {
      status,
      trackingNumber,
    });
    return data;
  },
  updatePaymentStatus: async (id: string, paymentStatus: string) => {
    const { data } = await apiClient.patch(`/orders/${id}`, {
      paymentStatus,
    });
    return data;
  },
  addNote: async (id: string, text: string) => {
    const { data } = await apiClient.post(`/orders/${id}/notes`, { text });
    return data;
  },
  sendCredentials: async (
    id: string,
    credentials: Array<{ serviceName: string; data: Record<string, string> }>,
    customMessage?: string
  ) => {
    const { data } = await apiClient.post(`/orders/${id}/credential-deliveries`, {
      credentials,
      customMessage,
    });
    return data;
  },
};
