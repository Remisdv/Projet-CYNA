import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { infoSchema, type InfoForm } from '../../types/checkout.types';

export function Step1Info({
  onNext,
  defaults,
}: {
  onNext: (data: InfoForm) => void;
  defaults?: Partial<InfoForm>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InfoForm>({
    resolver: zodResolver(infoSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    if (defaults) reset(defaults);
  }, [defaults, reset]);

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Vos informations</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Prénom *</label>
          <Input {...register('prenom')} placeholder="Jean" />
          {errors.prenom && <p className="mt-1 text-xs text-red-500">{errors.prenom.message}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Nom *</label>
          <Input {...register('nom')} placeholder="Dupont" />
          {errors.nom && <p className="mt-1 text-xs text-red-500">{errors.nom.message}</p>}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
        <Input {...register('email')} type="email" placeholder="jean.dupont@exemple.fr" />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Téléphone</label>
        <Input {...register('telephone')} type="tel" placeholder="+33 6 12 34 56 78" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Adresse *</label>
        <Input {...register('adresse')} placeholder="12 rue de la Paix" />
        {errors.adresse && <p className="mt-1 text-xs text-red-500">{errors.adresse.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="col-span-1">
          <label className="mb-1 block text-sm font-medium text-gray-700">Code postal *</label>
          <Input {...register('codePostal')} placeholder="75001" />
          {errors.codePostal && (
            <p className="mt-1 text-xs text-red-500">{errors.codePostal.message}</p>
          )}
        </div>
        <div className="col-span-1 sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">Ville *</label>
          <Input {...register('ville')} placeholder="Paris" />
          {errors.ville && <p className="mt-1 text-xs text-red-500">{errors.ville.message}</p>}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Pays *</label>
        <Input {...register('pays')} defaultValue="France" placeholder="France" />
        {errors.pays && <p className="mt-1 text-xs text-red-500">{errors.pays.message}</p>}
      </div>
      <Button type="submit" className="w-full">Continuer</Button>
    </form>
  );
}
