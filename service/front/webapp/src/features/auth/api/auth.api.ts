import { apiClient } from '@/shared/lib/apiClient';
import type {
  LoginResponse,
  RegisterData,
  RegisterResponse,
  ProfileResponse,
} from '../types/auth.types';

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/webapp/auth/login', { email, password });
    return data;
  },
  register: async (input: RegisterData): Promise<RegisterResponse> => {
    const { data } = await apiClient.post<RegisterResponse>('/webapp/auth/register', input);
    return data;
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/webapp/auth/logout');
  },
  profile: async (): Promise<ProfileResponse> => {
    const { data } = await apiClient.get<ProfileResponse>('/webapp/account/profile');
    return data;
  },
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/webapp/auth/forgot-password', { email });
  },
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/webapp/auth/reset-password', { token, newPassword });
  },
  verifyTwoFactor: async (userId: string, code: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/webapp/auth/2fa/verify', { userId, code });
    return data;
  },
  resendTwoFactor: async (userId: string): Promise<void> => {
    await apiClient.post('/webapp/auth/2fa/resend', { userId });
  },
  enable2faEmail: async (userId: string, password: string): Promise<void> => {
    await apiClient.post('/webapp/auth/2fa/email/enable', { userId, password });
  },
  enable2faEmailConfirm: async (userId: string, password: string, code: string): Promise<void> => {
    await apiClient.post('/webapp/auth/2fa/email/enable/confirm', { userId, password, code });
  },
  setup2faTotp: async (userId: string, password: string): Promise<{ secret: string; qrCodeDataUrl: string }> => {
    const { data } = await apiClient.post<{ secret: string; qrCodeDataUrl: string }>('/webapp/auth/2fa/totp/setup', {
      userId,
      password,
    });
    return data;
  },
  confirm2faTotp: async (userId: string, password: string, code: string): Promise<void> => {
    await apiClient.post('/webapp/auth/2fa/totp/confirm', { userId, password, code });
  },
  disable2faSendCode: async (userId: string, password: string): Promise<void> => {
    await apiClient.post('/webapp/auth/2fa/disable/send-code', { userId, password });
  },
  disable2fa: async (userId: string, password: string, code: string): Promise<void> => {
    await apiClient.post('/webapp/auth/2fa/disable', { userId, password, code });
  },
};

