import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Profile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
  status: string;
  createdAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  billingAddress?: Address;
  shippingAddress?: Address;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/webapp/account/profile');
      return data as Profile;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileData: UpdateProfileData) => {
      const { data } = await api.put('/webapp/account/profile', profileData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (passwordData: ChangePasswordData) => {
      const { data } = await api.put('/webapp/account/password', passwordData);
      return data;
    },
  });
}
