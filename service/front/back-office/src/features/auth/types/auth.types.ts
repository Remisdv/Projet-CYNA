export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUserPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface LoginResponse {
  requiresTwoFactor?: boolean;
  userId?: string;
  email?: string;
  access_token?: string;
  refresh_token?: string;
  user?: AuthUserPayload;
}

export interface TwoFactorVerifyInput {
  userId: string;
  code: string;
}

export interface TwoFactorVerifyResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUserPayload;
}
