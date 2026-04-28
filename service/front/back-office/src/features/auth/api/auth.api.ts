import { apiClient } from '@/shared/lib/apiClient';
import type {
  LoginInput,
  LoginResponse,
  TwoFactorVerifyInput,
  TwoFactorVerifyResponse,
} from '../types/auth.types';

export const authApi = {
  login: async (input: LoginInput): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>('/auth/sessions', input);
    return data;
  },
  verifyTwoFactor: async (
    input: TwoFactorVerifyInput
  ): Promise<TwoFactorVerifyResponse> => {
    const { data } = await apiClient.patch<TwoFactorVerifyResponse>(
      '/auth/sessions/current',
      input
    );
    return data;
  },
  resendTwoFactor: async (userId: string): Promise<void> => {
    await apiClient.post('/auth/sessions/current/two-factor-challenges', { userId });
  },
  logout: async (): Promise<void> => {
    await apiClient.delete('/auth/sessions/current');
  },
};
