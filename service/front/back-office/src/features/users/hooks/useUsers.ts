import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import type {
  UserDto,
  UsersResponse,
  UsersListParams,
  CreateUserInput,
  UpdateUserInput,
} from '../types/user.types';

export type { UserDto, UsersResponse } from '../types/user.types';

/** @deprecated Use UserDto instead */
export type MockUser = UserDto;

export const useUsers = (params?: UsersListParams) =>
  useQuery<UsersResponse>({
    queryKey: ['bo-users', params],
    queryFn: () => usersApi.list(params),
    staleTime: 30_000,
  });

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserInput) => usersApi.create(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bo-users'] }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateUserInput) => usersApi.update(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bo-users'] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bo-users'] }),
  });
};

