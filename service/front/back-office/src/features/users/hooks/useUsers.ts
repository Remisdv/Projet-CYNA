import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';

// ========== TYPES ==========

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'COMMERCIAL';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  data: UserDto[];
  total: number;
  page: number;
  limit: number;
}

/** @deprecated Use UserDto instead */
export type MockUser = UserDto;

// ========== HOOKS ==========

export const useUsers = (params?: { page?: number; limit?: number; role?: string; status?: string }) => {
  return useQuery<UsersResponse>({
    queryKey: ['bo-users', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.role && params.role !== 'all') searchParams.set('role', params.role);
      if (params?.status && params.status !== 'all') searchParams.set('status', params.status);
      const qs = searchParams.toString();
      const { data } = await api.get<UsersResponse>(`/users${qs ? `?${qs}` : ''}`);
      return data;
    },
    staleTime: 30_000,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<UserDto, 'id' | 'createdAt' | 'updatedAt'> & { password?: string }) =>
      api.post('/users', body).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bo-users'] }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<UserDto> & { id: string }) =>
      api.put(`/users/${id}`, body).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bo-users'] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bo-users'] }),
  });
};
