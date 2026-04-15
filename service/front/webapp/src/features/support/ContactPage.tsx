import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MessageSquare, Check } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { useContact } from './hooks/useContact';

const schema = z.object({
  prenom: z.string().min(1, 'Prénom requis'),
  nom: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  sujet: z.string().min(1, 'Sujet requis'),
  message: z.string().min(10, 'Message trop court (10 caractères minimum)'),
});
type ContactForm = z.infer<typeof schema>;

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const contact = useContact();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactForm>({ resolver: zodResolver(schema) });

  async function onSubmit(formData: ContactForm) {
    try {
      setError('');
      await contact.mutateAsync({
        name: `${formData.prenom} ${formData.nom}`,
        email: formData.email,
        subject: formData.sujet,
        message: formData.message,
      });
      setSent(true);
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi du message");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Nous contacter</h1>
        <p className="mt-2 text-gray-500">
          Notre équipe répond sous 24 heures ouvrées.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Contact info */}
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Email</p>
              <a href="mailto:contact@cyna-it.fr" className="text-sm text-blue-600 hover:underline">
                contact@cyna-it.fr
              </a>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Téléphone</p>
              <a href="tel:+33123456789" className="text-sm text-blue-600 hover:underline">
                +33 1 23 45 67 89
              </a>
              <p className="text-xs text-gray-400">Lun–Ven, 9h–18h</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Chat en ligne</p>
              <p className="text-sm text-gray-500">Disponible depuis le tableau de bord client.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {sent ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-green-200 bg-green-50 p-12 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                <Check size={28} />
              </div>
              <h2 className="mb-1 text-xl font-semibold text-gray-900">Message envoyé !</h2>
              <p className="text-sm text-gray-500">
                Nous vous répondrons dans les 24 heures ouvrées.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSent(false)}
              >
                Envoyer un autre message
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Prénom *</label>
                  <Input {...register('prenom')} placeholder="Jean" />
                  {errors.prenom && (
                    <p className="mt-1 text-xs text-red-500">{errors.prenom.message}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Nom *</label>
                  <Input {...register('nom')} placeholder="Dupont" />
                  {errors.nom && (
                    <p className="mt-1 text-xs text-red-500">{errors.nom.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
                <Input {...register('email')} type="email" placeholder="jean@exemple.fr" />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Sujet *</label>
                <Input {...register('sujet')} placeholder="Renseignement sur le SOC Essentiel" />
                {errors.sujet && (
                  <p className="mt-1 text-xs text-red-500">{errors.sujet.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Message *</label>
                <Textarea
                  {...register('message')}
                  placeholder="Décrivez votre besoin..."
                  rows={5}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Envoi en cours…' : 'Envoyer le message'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
