import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountApi } from '../api/account.api';
import type { UpdateProfileData, ChangePasswordData } from '../types/account.types';

export type { Address, Profile, UpdateProfileData, ChangePasswordData } from '../types/account.types';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: accountApi.getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileData: UpdateProfileData) => accountApi.updateProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (passwordData: ChangePasswordData) => accountApi.changePassword(passwordData),
  });
}

