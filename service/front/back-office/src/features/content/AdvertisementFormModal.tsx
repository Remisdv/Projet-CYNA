import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useCreateAdvertisement,
  useUpdateAdvertisement,
  Advertisement,
} from './hooks/useAdvertisements';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

const adSchema = z.object({
  textFr: z.string().min(1, 'Le texte français est requis').max(500, 'Maximum 500 caractères'),
  textEn: z.string().min(1, 'Le texte anglais est requis').max(500, 'Maximum 500 caractères'),
});

type AdFormData = z.infer<typeof adSchema>;

interface AdvertisementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  advertisement: Advertisement | null;
}

export default function AdvertisementFormModal({
  isOpen,
  onClose,
  advertisement,
}: AdvertisementFormModalProps) {
  const createAd = useCreateAdvertisement();
  const updateAd = useUpdateAdvertisement();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      textFr: '',
      textEn: '',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (advertisement) {
      reset({
        textFr: advertisement.textFr,
        textEn: advertisement.textEn,
      });
    } else {
      reset({
        textFr: '',
        textEn: '',
      });
    }
  }, [isOpen, advertisement, reset]);

  const onSubmit = async (data: AdFormData) => {
    try {
      if (advertisement) {
        await updateAd.mutateAsync({ id: advertisement.id, adData: data });
      } else {
        await createAd.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      alert('Erreur lors de la sauvegarde de la publicité');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={advertisement ? 'Modifier la Publicité' : 'Nouvelle Publicité'}
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
        <div>
          <Textarea
            label="Texte en Français"
            {...register('textFr')}
            error={errors.textFr?.message}
            rows={3}
            placeholder="Entrez le texte de la publicité en français (max 500 caractères)"
          />
          <p className="text-xs text-gray-500 mt-1">
            Ce texte sera affiché sur la page d'accueil pour les visiteurs francophones
          </p>
        </div>

        <div>
          <Textarea
            label="Texte en Anglais"
            {...register('textEn')}
            error={errors.textEn?.message}
            rows={3}
            placeholder="Enter the advertisement text in English (max 500 characters)"
          />
          <p className="text-xs text-gray-500 mt-1">
            This text will be displayed on the homepage for English-speaking visitors
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note :</strong> Une seule publicité peut être active à la fois. 
            Activez-la depuis la liste après l'avoir créée.
          </p>
        </div>
      </form>
    </Modal>
  );
}
