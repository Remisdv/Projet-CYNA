import { apiClient } from '@/shared/lib/apiClient';

export type TwoFactorType = 'email' | 'totp';

export interface TwoFactorMethod {
  type: TwoFactorType;
  enabled: boolean;
}

export interface TotpSetupResult {
  type: 'totp';
  secret: string;
  qrCodeDataUrl: string;
  otpAuthUrl: string;
}

const BASE = '/webapp/account/two-factor-methods';

export const twoFactorApi = {
  list: async (): Promise<TwoFactorMethod[]> => {
    const { data } = await apiClient.get<TwoFactorMethod[]>(BASE);
    return data;
  },
  /** Initiate enabling a method. For email: sends a code; for totp: returns secret + QR. */
  enable: async (
    type: TwoFactorType,
    password: string,
  ): Promise<{ message: string } | TotpSetupResult> => {
    const { data } = await apiClient.post<{ message: string } | TotpSetupResult>(BASE, {
      type,
      password,
    });
    return data;
  },
  /** Confirm enabling a method by submitting the verification code. */
  confirm: async (type: TwoFactorType, password: string, code: string): Promise<void> => {
    await apiClient.patch(`${BASE}/${type}`, { password, code });
  },
  /** Disable a previously enabled method. */
  disable: async (type: TwoFactorType, password: string, code: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${type}`, { data: { password, code } });
  },
  /** Send (or resend) an email challenge code for enabling or disabling. */
  challenge: async (type: TwoFactorType, password: string): Promise<void> => {
    await apiClient.post(`${BASE}/${type}/challenges`, { password });
  },
};
