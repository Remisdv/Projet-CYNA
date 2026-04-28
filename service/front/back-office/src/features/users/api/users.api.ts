import apiClient from '@/shared/lib/apiClient';
import type {
  UserDto,
  UsersResponse,
  UsersListParams,
  CreateUserInput,
  UpdateUserInput,
} from '../types/user.types';

export const usersApi = {
  list: async (params?: UsersListParams): Promise<UsersResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.role && params.role !== 'all') searchParams.set('role', params.role);
    if (params?.status && params.status !== 'all') searchParams.set('status', params.status);
    const qs = searchParams.toString();
    const { data } = await apiClient.get<UsersResponse>(`/users${qs ? `?${qs}` : ''}`);
    return data;
  },
  create: async (body: CreateUserInput): Promise<UserDto> => {
    const { data } = await apiClient.post<UserDto>('/users', body);
    return data;
  },
  update: async ({ id, ...body }: UpdateUserInput): Promise<UserDto> => {
    const { data } = await apiClient.put<UserDto>(`/users/${id}`, body);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
