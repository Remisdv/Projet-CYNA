import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import type {
  LoginInput,
  TwoFactorVerifyInput,
} from '../types/auth.types';

export const useLogin = () => {
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
  });
};

export const useVerifyTwoFactor = () => {
  return useMutation({
    mutationFn: (input: TwoFactorVerifyInput) => authApi.verifyTwoFactor(input),
  });
};

export const useResendTwoFactor = () => {
  return useMutation({
    mutationFn: (userId: string) => authApi.resendTwoFactor(userId),
  });
};
