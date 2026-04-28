import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/context/AuthContext';
import { useLogin } from '../hooks/useAuth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      // 2FA required — redirect to verification page
      if (response.requiresTwoFactor) {
        navigate('/2fa', {
          state: { userId: response.userId, email: response.email },
        });
        return;
      }

      const { access_token, refresh_token, user } = response;
      if (!user?.role) {
        setError('root', { message: t('login.errors.missingRole') });
        return;
      }
      const role = String(user.role).toUpperCase();
      login(access_token!, refresh_token!, {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: [role],
      });
      // Les commerciaux arrivent sur leur dashboard dédié;
      // les admins gardent le dashboard global.
      navigate(role === 'COMMERCIAL' ? '/commercial' : '/dashboard');
    } catch {
      setError('root', { message: t('login.errors.invalidCredentials') });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('login.title')}</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('login.emailLabel')}</label>
            <input
              {...register('email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('login.passwordLabel')}</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 pr-10 border"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? t('login.hidePasswordAriaLabel') : t('login.showPasswordAriaLabel')}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? t('login.submitting') : t('login.submitButton')}
          </button>
          {errors.root && <p className="text-red-500 text-sm text-center">{errors.root.message}</p>}
        </form>
      </div>
    </div>
  );
}
