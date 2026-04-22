import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const schema = z.object({
  code: z.string().length(6, 'Le code doit contenir 6 chiffres'),
});

type FormData = z.infer<typeof schema>;

const RESEND_COOLDOWN = 60; // seconds

export default function TwoFactorPage() {
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { userId, email } = location.state || {};

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!userId) return null;

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      const response = await api.post('/auth/2fa/verify', {
        userId,
        code: data.code,
      });
      const { access_token, refresh_token, user } = response.data;
      login(access_token, refresh_token, {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: [user.role ?? 'admin'],
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code invalide');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      setResendSuccess(false);
      await api.post('/auth/2fa/resend', { userId });
      setResendSuccess(true);
      setResendCooldown(RESEND_COOLDOWN);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du renvoi du code');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-2 text-center">Vérification en deux étapes</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Un code à 6 chiffres a été envoyé à<br />
          <span className="font-medium text-gray-700">{email}</span>
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>
        )}
        {resendSuccess && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
            Nouveau code envoyé !
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code de vérification</label>
            <input
              {...register('code')}
              placeholder="123456"
              maxLength={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border text-center tracking-[0.5em] text-xl font-mono"
            />
            {errors.code && (
              <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Vérification...' : 'Vérifier'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-sm text-indigo-600 hover:text-indigo-800 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0
              ? `Renvoyer le code (${resendCooldown}s)`
              : 'Renvoyer le code'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ← Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  );
}
