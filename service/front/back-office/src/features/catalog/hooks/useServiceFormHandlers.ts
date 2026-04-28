import { useRef, useState, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateService, useUpdateService, useAddServiceImages,
  useDeleteServiceImage, useUploadImages,
} from './useServices';
import type { ServiceFormData, TabId } from '../types/serviceForm.types';
import { buildServicePayload } from './useServiceForm';
import { clearDraft } from '../lib/serviceFormDraft';

interface Args {
  service: any | null;
  formData: ServiceFormData;
  setFormData: React.Dispatch<React.SetStateAction<ServiceFormData>>;
  setActiveTab: (tab: TabId) => void;
}

export function useServiceFormHandlers({ service, formData, setFormData, setActiveTab }: Args) {
  const navigate = useNavigate();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const addImages = useAddServiceImages();
  const deleteImage = useDeleteServiceImage();
  const uploadImages = useUploadImages();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    try { new URL(url); } catch { return; }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { id: `new-${Date.now()}`, url, altText: '', isPrimary: prev.images.length === 0, isNew: true }],
    }));
    setImageUrlInput('');
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArr.length === 0) return;
    setIsUploading(true);
    try {
      const urls = await uploadImages.mutateAsync(fileArr);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...urls.map((url, idx) => ({
          id: `new-${Date.now()}-${idx}`,
          url,
          altText: fileArr[idx]?.name?.replace(/\.[^/.]+$/, '') || '',
          isPrimary: prev.images.length === 0 && idx === 0,
          isNew: true,
        }))],
      }));
    } catch (err) { console.error('Upload failed:', err); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const removeImage = (imageId: string) => {
    setFormData(prev => {
      const updated = prev.images.filter(img => img.id !== imageId);
      if (updated.length > 0 && !updated.some(img => img.isPrimary)) updated[0].isPrimary = true;
      return { ...prev, images: updated };
    });
  };

  const setPrimaryImage = (imageId: string) => {
    setFormData(prev => ({ ...prev, images: prev.images.map(img => ({ ...img, isPrimary: img.id === imageId })) }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ServiceFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.category) newErrors.category = 'La catégorie est requise';
    if (formData.type === 'product' && formData.price <= 0) newErrors.price = 'Le prix est requis';
    if (formData.type === 'service') {
      if (formData.monthlyPrice <= 0) newErrors.monthlyPrice = 'Le prix mensuel est requis';
      if (formData.annualPrice <= 0) newErrors.annualPrice = 'Le prix annuel est requis';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      if (newErrors.name || newErrors.category) setActiveTab('general');
      else if (newErrors.price || newErrors.monthlyPrice || newErrors.annualPrice) setActiveTab('pricing');
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (publish: boolean = false) => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const payload = buildServicePayload(formData, publish);

      let savedId = service?.id;
      if (service?.id) {
        await updateService.mutateAsync({ id: service.id, ...payload });
      } else {
        const result = await createService.mutateAsync(payload);
        savedId = (result as any)?.id;
      }

      if (savedId) {
        if (service?.images) {
          const currentIds = new Set(formData.images.filter(i => !i.isNew).map(i => i.id));
          for (const img of service.images) {
            if (img.id && !currentIds.has(img.id)) {
              try { await deleteImage.mutateAsync({ serviceId: savedId, imageId: img.id }); } catch { /* ignore */ }
            }
          }
        }
        const newImages = formData.images.filter(i => i.isNew && i.url);
        if (newImages.length > 0) {
          try {
            await addImages.mutateAsync({
              id: savedId,
              images: newImages.map(i => ({ url: i.url, est_principale: i.isPrimary })),
            });
          } catch { /* ignore */ }
        }
      }

      clearDraft();
      navigate('/catalog/services');
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting, errors, setErrors,
    imageUrlInput, setImageUrlInput,
    isUploading, fileInputRef,
    addImageUrl, handleFileUpload, removeImage, setPrimaryImage,
    handleSave,
  };
}
