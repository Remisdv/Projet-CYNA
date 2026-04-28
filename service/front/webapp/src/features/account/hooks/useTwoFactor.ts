import { useState } from 'react';
import { useAuth } from '@/shared/context/AuthContext';
import { twoFactorApi, TotpSetupResult } from '@/features/account/api/twoFactor.api';

export type TwoFAView = 'main' | 'enable-email' | 'setup-totp' | 'confirm-totp' | 'disable';

export function useTwoFactor() {
  const { user, refreshUser } = useAuth();
  const [view, setView] = useState<TwoFAView>('main');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [totpData, setTotpData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [emailEnableCodeSent, setEmailEnableCodeSent] = useState(false);
  const [disableCodeSent, setDisableCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const twoFactorEnabled = user?.twoFactorEnabled ?? false;
  const totpEnabled = user?.totpEnabled ?? false;

  const reset = () => {
    setPassword('');
    setCode('');
    setError('');
    setSuccess('');
    setTotpData(null);
    setEmailEnableCodeSent(false);
    setDisableCodeSent(false);
    setView('main');
  };

  const handleRequestEnableEmail = async () => {
    setLoading(true);
    setError('');
    try {
      await twoFactorApi.enable('email', password);
      setEmailEnableCodeSent(true);
      setCode('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmEnableEmail = async () => {
    setLoading(true);
    setError('');
    try {
      await twoFactorApi.confirm('email', password, code);
      setSuccess('Authentification par email activée.');
      refreshUser();
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupTotp = async () => {
    setLoading(true);
    setError('');
    try {
      const data = (await twoFactorApi.enable('totp', password)) as TotpSetupResult;
      setTotpData({ secret: data.secret, qrCodeDataUrl: data.qrCodeDataUrl });
      setView('confirm-totp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTotp = async () => {
    setLoading(true);
    setError('');
    try {
      await twoFactorApi.confirm('totp', password, code);
      setSuccess('Application d\'authentification configurée avec succès.');
      refreshUser();
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDisableCode = async () => {
    setLoading(true);
    setError('');
    try {
      await twoFactorApi.challenge('email', password);
      setDisableCodeSent(true);
      setCode('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setError('');
    try {
      const type = totpEnabled ? 'totp' : 'email';
      await twoFactorApi.disable(type, password, code);
      setSuccess('Authentification à deux facteurs désactivée.');
      refreshUser();
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return {
    view, setView,
    password, setPassword,
    code, setCode,
    totpData,
    emailEnableCodeSent,
    disableCodeSent, setDisableCodeSent,
    error, setError,
    success, setSuccess,
    loading,
    twoFactorEnabled,
    totpEnabled,
    reset,
    handleRequestEnableEmail,
    handleConfirmEnableEmail,
    handleSetupTotp,
    handleConfirmTotp,
    handleRequestDisableCode,
    handleDisable,
  };
}
