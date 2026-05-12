import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../api/customers.api';
import type {
  CustomerDto,
  CustomersResponse,
  CustomersListParams,
  CreateCustomerInput,
  UpdateCustomerInput,
  CreateCustomerResponse,
} from '../types/customer.types';

export type { CustomerDto, CustomersResponse } from '../types/customer.types';

const KEY = ['bo-customers'];

export const useCustomers = (params?: CustomersListParams) =>
  useQuery<CustomersResponse>({
    queryKey: [...KEY, params],
    queryFn: () => customersApi.list(params),
    staleTime: 30_000,
  });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation<CreateCustomerResponse, unknown, CreateCustomerInput>({
    mutationFn: (body) => customersApi.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useMutation<CustomerDto, unknown, UpdateCustomerInput>({
    mutationFn: (body) => customersApi.update(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useResetCustomerPassword = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customersApi.resetPassword(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
