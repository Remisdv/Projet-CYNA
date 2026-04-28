import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/Button';
import { PasswordInput } from '@/shared/components/ui/PasswordInput';
import { useChangePassword } from '../hooks/useAccount';
import { TwoFactorSection } from './TwoFactorSection';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: z.string().min(6, 'Minimum 6 caractères'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export function SecurityTab() {
  const changePassword = useChangePassword();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data: any) => {
    try {
      setSuccess(false);
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      reset();
    } catch {
      // error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Sécurité du compte</h2>
        {success && (
          <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 rounded-lg">
            Mot de passe modifié avec succès.
          </div>
        )}
        {changePassword.isError && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            {(changePassword.error as any)?.response?.data?.message || 'Erreur lors du changement de mot de passe'}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <PasswordInput
            label="Mot de passe actuel"
            {...register('currentPassword')}
            error={errors.currentPassword?.message as string}
          />
          <PasswordInput
            label="Nouveau mot de passe"
            {...register('newPassword')}
            error={errors.newPassword?.message as string}
          />
          <PasswordInput
            label="Confirmer le nouveau mot de passe"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message as string}
          />
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Modification...' : 'Changer le mot de passe'}
          </Button>
        </form>
      </div>

      <TwoFactorSection />
    </div>
  );
}
