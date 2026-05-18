import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import type {
  UserDto,
  UsersResponse,
  UsersListParams,
  CreateUserInput,
  CreateUserResponse,
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
  return useMutation<CreateUserResponse, unknown, CreateUserInput>({
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

export const useResetUserPassword = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.resetPassword(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bo-users'] }),
  });
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves a list of potential user IDs to a map of { id → display name }.
 * Non-UUID values (like "Système", "webapp") are passed through unchanged.
 */
export function useUserNames(ids: string[]): Record<string, string> {
  const uuids = [...new Set(ids.filter((id) => UUID_REGEX.test(id)))];

  const results = useQueries({
    queries: uuids.map((id) => ({
      queryKey: ['bo-user', id],
      queryFn: () => usersApi.getById(id),
      staleTime: 5 * 60 * 1000,
      retry: false,
    })),
  });

  const nameMap: Record<string, string> = {};
  uuids.forEach((id, i) => {
    const data = results[i]?.data;
    if (data) {
      const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.email;
      nameMap[id] = name;
    } else {
      nameMap[id] = id; // fallback: show raw id if fetch failed
    }
  });
  return nameMap;
}

