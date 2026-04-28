export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  twoFactorEnabled?: boolean;
  totpEnabled?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface TwoFactorPending {
  requiresTwoFactor: true;
  userId: string;
  email: string;
  method: 'email' | 'totp';
}

export interface AuthTokens {
  access_token?: string;
  refresh_token?: string;
}

export interface LoginResponse extends AuthTokens {
  requiresTwoFactor?: boolean;
  userId?: string;
  email?: string;
  method?: 'email' | 'totp';
  user?: User;
}

export interface RegisterResponse extends AuthTokens {
  user: User;
}

export interface ProfileResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  twoFactorEnabled?: boolean;
  totpEnabled?: boolean;
}
