import { apiClient } from '@/shared/lib/apiClient';
import type {
  LoginInput,
  LoginResponse,
  TwoFactorVerifyInput,
  TwoFactorVerifyResponse,
} from '../types/auth.types';

export const authApi = {
  login: async (input: LoginInput): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', input);
    return data;
  },
  verifyTwoFactor: async (
    input: TwoFactorVerifyInput
  ): Promise<TwoFactorVerifyResponse> => {
    const { data } = await apiClient.post<TwoFactorVerifyResponse>(
      '/auth/2fa/verify',
      input
    );
    return data;
  },
  resendTwoFactor: async (userId: string): Promise<void> => {
    await apiClient.post('/auth/2fa/resend', { userId });
  },
};
