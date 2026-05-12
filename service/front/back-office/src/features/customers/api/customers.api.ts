import apiClient from '@/shared/lib/apiClient';
import type {
  CustomerDto,
  CustomersResponse,
  CustomersListParams,
  CreateCustomerInput,
  UpdateCustomerInput,
  CreateCustomerResponse,
} from '../types/customer.types';

export const customersApi = {
  list: async (params?: CustomersListParams): Promise<CustomersResponse> => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.status && params.status !== 'all') sp.set('status', params.status);
    if (params?.search) sp.set('search', params.search);
    if (params?.dateDebut) sp.set('dateDebut', params.dateDebut);
    if (params?.dateFin) sp.set('dateFin', params.dateFin);
    if (params?.sort) sp.set('sort', params.sort);
    const qs = sp.toString();
    const { data } = await apiClient.get<CustomersResponse>(
      `/customers${qs ? `?${qs}` : ''}`,
    );
    return data;
  },
  create: async (body: CreateCustomerInput): Promise<CreateCustomerResponse> => {
    const { data } = await apiClient.post<CreateCustomerResponse>('/customers', body);
    return data;
  },
  update: async ({ id, ...body }: UpdateCustomerInput): Promise<CustomerDto> => {
    const { data } = await apiClient.put<CustomerDto>(`/customers/${id}`, body);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`);
  },
  resetPassword: async (id: string): Promise<{ tempPassword: string }> => {
    const { data } = await apiClient.post<{ tempPassword: string }>(
      `/customers/${id}/reset-password`,
      {},
    );
    return data;
  },
};
