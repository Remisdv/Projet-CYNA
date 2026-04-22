import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Prénom requis'),
    lastName: z.string().min(1, 'Nom requis'),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Minimum 6 caractères'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (formData: RegisterForm) => {
    try {
      setError('');
      await registerUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      navigate('/account');
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-blue-600">
            <Shield className="h-8 w-8" />
            CYNA
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="mt-2 text-gray-600">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prénom"
              {...register('firstName')}
              error={errors.firstName?.message}
            />
            <Input
              label="Nom"
              {...register('lastName')}
              error={errors.lastName?.message}
            />
          </div>

          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
          />

          <PasswordInput
            label="Mot de passe"
            {...register('password')}
            error={errors.password?.message}
          />

          <PasswordInput
            label="Confirmer le mot de passe"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Inscription...' : "S'inscrire"}
          </Button>
        </form>
      </div>
    </div>
  );
}
