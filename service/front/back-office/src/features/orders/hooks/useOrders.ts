import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders.api';

export const useOrders = (params?: { page?: number; status?: string }) => {
  const page = params?.page ?? 1;
  const status = params?.status && params.status !== 'all' ? params.status : undefined;

  return useQuery({
    queryKey: ['orders', page, status],
    queryFn: () => ordersApi.list({ page, status }),
  });
};

export const useOrderDetail = (id: string) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      trackingNumber,
    }: {
      id: string;
      status: string;
      trackingNumber?: string;
    }) => ordersApi.updateStatus(id, status, trackingNumber),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      paymentStatus,
    }: {
      id: string;
      paymentStatus: string;
    }) => ordersApi.updatePaymentStatus(id, paymentStatus),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useAddOrderNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      ordersApi.addNote(id, text),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
    },
  });
};

export const useSendCredentials = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      credentials,
      customMessage,
    }: {
      id: string;
      credentials: Array<{ serviceName: string; data: Record<string, string> }>;
      customMessage?: string;
    }) => ordersApi.sendCredentials(id, credentials, customMessage),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
