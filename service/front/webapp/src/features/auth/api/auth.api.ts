import { apiClient } from '@/shared/lib/apiClient';
import type {
  LoginResponse,
  RegisterData,
  RegisterResponse,
  ProfileResponse,
} from '../types/auth.types';

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/webapp/auth/sessions', { email, password });
    return data;
  },
  register: async (input: RegisterData): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<RegisterResponse>('/webapp/auth/users', input);
    return data;
  },
  logout: async (): Promise<void> => {
    await apiClient.delete('/webapp/auth/sessions/current');
  },
  profile: async (): Promise<ProfileResponse> => {
    const { data } = await apiClient.get<ProfileResponse>('/webapp/account/profile');
    return data;
  },
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/webapp/auth/password-resets', { email });
  },
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.patch(`/webapp/auth/password-resets/${encodeURIComponent(token)}`, { newPassword });
  },
  verifyTwoFactor: async (userId: string, code: string): Promise<LoginResponse> => {
    const { data } = await apiClient.patch<LoginResponse>('/webapp/auth/sessions/current', { userId, code });
    return data;
  },
  resendTwoFactor: async (userId: string): Promise<void> => {
    await apiClient.post('/webapp/auth/sessions/current/two-factor-challenges', { userId });
  },
};

