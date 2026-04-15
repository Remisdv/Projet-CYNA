import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useCreateFaq,
  useUpdateFaq,
  Faq,
} from './hooks/useFaqs';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';

const faqSchema = z.object({
  question: z.string().min(1, 'La question est requise').max(500, 'Maximum 500 caractères'),
  answer: z.string().optional(),
  lang: z.enum(['fr', 'en'], { required_error: 'La langue est requise' }),
  order: z.number().min(0).optional(),
});

type FaqFormData = z.infer<typeof faqSchema>;

interface FaqFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  faq: Faq | null;
  parentId: string | null;
}

export default function FaqFormModal({
  isOpen,
  onClose,
  faq,
  parentId,
}: FaqFormModalProps) {
  const createFaq = useCreateFaq();
  const updateFaq = useUpdateFaq();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FaqFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: '',
      answer: '',
      lang: 'fr',
      order: 0,
    },
  });

  const answer = watch('answer');
  const isLeaf = answer && answer.trim().length > 0;

  useEffect(() => {
    if (!isOpen) return;
    if (faq) {
      reset({
        question: faq.question,
        answer: faq.answer,
        lang: faq.lang as 'fr' | 'en',
        order: faq.order,
      });
    } else {
      reset({
        question: '',
        answer: '',
        lang: 'fr',
        order: 0,
      });
    }
  }, [isOpen, faq, reset]);

  const onSubmit = async (data: FaqFormData) => {
    try {
      if (faq) {
        await updateFaq.mutateAsync({
          id: faq.id,
          faqData: {
            question: data.question,
            answer: data.answer || '',
            lang: data.lang,
            order: data.order,
          },
        });
      } else {
        await createFaq.mutateAsync({
          parentId: parentId || null,
          question: data.question,
          answer: data.answer || '',
          lang: data.lang,
          order: data.order || 0,
        });
      }
      onClose();
    } catch (error) {
      alert('Erreur lors de la sauvegarde de la FAQ');
    }
  };

  const getModalTitle = () => {
    if (faq) return 'Modifier l\'élément FAQ';
    if (parentId) return 'Ajouter une sous-catégorie';
    return 'Nouvelle catégorie principale';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <Select
          label="Langue"
          {...register('lang')}
          error={errors.lang?.message}
          options={[
            { value: 'fr', label: '🇫🇷 Français' },
            { value: 'en', label: '🇬🇧 English' },
          ]}
        />

        <Input
          label="Question / Titre"
          {...register('question')}
          error={errors.question?.message}
          placeholder="Ex: Problème avec votre commande"
        />

        <Textarea
          label="Réponse (optionnel)"
          {...register('answer')}
          error={errors.answer?.message}
          rows={5}
          placeholder="Si vous remplissez ce champ, cet élément sera une réponse finale (feuille). Laissez vide pour créer une catégorie avec sous-éléments."
        />

        <Input
          type="number"
          label="Ordre d'affichage"
          {...register('order', { valueAsNumber: true })}
          error={errors.order?.message}
          placeholder="0"
        />

        <div className={`rounded-lg p-4 ${isLeaf ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
          <p className="text-sm font-medium mb-1">
            {isLeaf ? '✓ Réponse finale' : 'Catégorie'}
          </p>
          <p className="text-sm text-gray-700">
            {isLeaf
              ? 'Cet élément sera une réponse finale affichée à l\'utilisateur.'
              : 'Cet élément peut avoir des sous-catégories ou des réponses enfants.'}
          </p>
        </div>

        {parentId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note :</strong> Cet élément sera ajouté comme sous-catégorie.
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
}
