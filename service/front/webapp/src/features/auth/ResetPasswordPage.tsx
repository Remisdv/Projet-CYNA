import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { PasswordInput } from '../../components/ui/PasswordInput';

const schema = z
  .object({
    newPassword: z.string().min(6, 'Minimum 6 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type ResetForm = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (formData: ResetForm) => {
    if (!token) return;
    try {
      setError('');
      await api.post('/webapp/auth/reset-password', {
        token,
        newPassword: formData.newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la réinitialisation');
    }
  };

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">Lien de réinitialisation invalide ou expiré.</p>
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-blue-600">
            <Shield className="h-8 w-8" />
            CYNA
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Réinitialiser le mot de passe</h1>
        </div>

        {success ? (
          <div className="text-center">
            <div className="p-4 bg-green-50 rounded-lg text-green-700 mb-4">
              Mot de passe réinitialisé avec succès ! Redirection vers la connexion...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
            )}

            <PasswordInput
              label="Nouveau mot de passe"
              {...register('newPassword')}
              error={errors.newPassword?.message}
            />

            <PasswordInput
              label="Confirmer le mot de passe"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Réinitialisation...' : 'Réinitialiser'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
