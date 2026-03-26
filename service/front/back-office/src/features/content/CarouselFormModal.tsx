import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useCreateCarouselItem,
  useUpdateCarouselItem,
  CarouselItem,
} from './hooks/useCarousel';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

const carouselSchema = z.object({
  imageId: z.string().min(1, "L'ID de l'image est requis"),
  title: z.string().min(1, 'Le titre est requis'),
  text: z.string().min(1, 'Le texte est requis'),
  link: z.string().min(1, 'Le lien est requis'),
  order: z.number().min(0, "L'ordre doit être positif"),
});

type CarouselFormData = z.infer<typeof carouselSchema>;

interface CarouselFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CarouselItem | null;
}

export default function CarouselFormModal({
  isOpen,
  onClose,
  item,
}: CarouselFormModalProps) {
  const createItem = useCreateCarouselItem();
  const updateItem = useUpdateCarouselItem();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CarouselFormData>({
    resolver: zodResolver(carouselSchema),
    defaultValues: {
      imageId: '',
      title: '',
      text: '',
      link: '',
      order: 0,
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        imageId: item.imageId,
        title: item.title,
        text: item.text,
        link: item.link,
        order: item.order,
      });
    } else {
      reset({
        imageId: '',
        title: '',
        text: '',
        link: '',
        order: 0,
      });
    }
  }, [item, reset]);

  const onSubmit = async (data: CarouselFormData) => {
    try {
      if (item) {
        await updateItem.mutateAsync({ id: item.id, itemData: data });
      } else {
        await createItem.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      alert("Erreur lors de la sauvegarde de l'item");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Modifier le Slide' : 'Nouveau Slide'}
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
        <Input
          label="Image ID"
          {...register('imageId')}
          error={errors.imageId?.message}
          placeholder="ID de l'image uploadée"
        />
        <Input
          label="Titre"
          {...register('title')}
          error={errors.title?.message}
        />
        <Textarea
          label="Texte"
          {...register('text')}
          error={errors.text?.message}
          rows={3}
        />
        <Input
          label="Lien"
          {...register('link')}
          error={errors.link?.message}
          placeholder="https://..."
        />
        <Input
          label="Ordre"
          type="number"
          {...register('order', { valueAsNumber: true })}
          error={errors.order?.message}
        />
      </form>
    </Modal>
  );
}
