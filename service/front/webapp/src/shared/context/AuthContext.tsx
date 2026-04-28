import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/shared/lib/apiClient';
import { trackEvent } from '@/shared/lib/tracking';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  twoFactorEnabled?: boolean;
  totpEnabled?: boolean;
}

interface TwoFactorPending {
  requiresTwoFactor: true;
  userId: string;
  email: string;
  method: 'email' | 'totp';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void | TwoFactorPending>;
  loginWithTokens: (user: User) => void;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await apiClient.get('/webapp/account/profile');
      setUser({
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        twoFactorEnabled: data.twoFactorEnabled,
        totpEnabled: data.totpEnabled,
      });
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string): Promise<void | TwoFactorPending> => {
    const { data } = await apiClient.post('/webapp/auth/login', { email, password });

    // 2FA pending — return pending state for caller to redirect
    if (data.requiresTwoFactor) {
      return data as TwoFactorPending;
    }

    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    setUser(data.user);
    trackEvent('LOGIN', data.user?.id);
  }, []);

  const loginWithTokens = useCallback((userData: User) => {
    setUser(userData);
    trackEvent('LOGIN', userData?.id);
  }, []);

  const register = useCallback(async (registerData: RegisterData) => {
    const { data } = await apiClient.post('/webapp/auth/register', registerData);
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/webapp/auth/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithTokens,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
