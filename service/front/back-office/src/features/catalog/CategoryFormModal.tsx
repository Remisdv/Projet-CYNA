import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useCreateCategory,
  useUpdateCategory,
  Category,
  CategoryInput,
} from './hooks/useCategories';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

const categorySchema = z.object({
  slug: z.string().min(1, 'Le slug est requis'),
  translations: z.array(
    z.object({
      lang: z.enum(['fr', 'en']),
      name: z.string().min(1, 'Le nom est requis'),
      description: z.string().optional(),
    })
  ),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  category,
}: CategoryFormModalProps) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      slug: '',
      translations: [
        { lang: 'fr', name: '', description: '' },
        { lang: 'en', name: '', description: '' },
      ],
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (category) {
      reset({
        slug: category.slug,
        translations: category.translations.map((t) => ({
          lang: t.lang.toLowerCase() as 'fr' | 'en',
          name: t.name,
          description: t.description || '',
        })),
      });
    } else {
      reset({
        slug: '',
        translations: [
          { lang: 'fr', name: '', description: '' },
          { lang: 'en', name: '', description: '' },
        ],
      });
    }
  }, [isOpen, category, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const payload: CategoryInput = {
        slug: data.slug,
        translations: data.translations.map((t) => ({
          lang: t.lang,
          name: t.name,
          description: t.description || '',
        })),
      };
      if (category) {
        await updateCategory.mutateAsync({
          id: category.id,
          categoryData: payload,
        });
      } else {
        await createCategory.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      alert('Erreur lors de la sauvegarde de la catégorie');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
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
      <form className="space-y-6">
        {/* Basic Info */}
        <Input
          label="Slug"
          {...register('slug')}
          error={errors.slug?.message}
          placeholder="ma-categorie"
        />

        {/* Translations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Traductions</h3>
          {[{ lang: 'fr', label: 'Français' }, { lang: 'en', label: 'English' }].map((item, index) => (
            <div key={item.lang} className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-700">{item.label}</h4>
              <input type="hidden" {...register(`translations.${index}.lang`)} value={item.lang} />
              <Input
                label="Nom"
                {...register(`translations.${index}.name`)}
                error={errors.translations?.[index]?.name?.message}
              />
              <Textarea
                label="Description"
                {...register(`translations.${index}.description`)}
                error={errors.translations?.[index]?.description?.message}
                rows={3}
              />
            </div>
          ))}
        </div>
      </form>
    </Modal>
  );
}
