import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Button } from '@/shared/components/ui/Button';
import { Mail } from 'lucide-react';
import { useCreateUser, useUpdateUser } from '../hooks/useUsers';
import type { UserDto } from '../types/user.types';

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'COMMERCIAL';
  status: 'active' | 'inactive';
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDto | null;
}

export default function UserFormModal({
  isOpen,
  onClose,
  user,
}: UserFormModalProps) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'COMMERCIAL',
    status: 'active',
  });

  // Form errors
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: (user.role === 'ADMIN' ? 'ADMIN' : 'COMMERCIAL') as 'ADMIN' | 'COMMERCIAL',
          status: (user.status?.toLowerCase() === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
        });
      } else {
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          role: 'COMMERCIAL',
          status: 'active',
        });
      }
      setErrors({});
    }
  }, [isOpen, user]);

  // Update form field
  const updateField = <K extends keyof UserFormData>(
    field: K,
    value: UserFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const apiPayload = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role as 'ADMIN' | 'COMMERCIAL',
        status: formData.status === 'active' ? 'ACTIVE' : 'INACTIVE' as 'ACTIVE' | 'INACTIVE',
      };

      if (!user) {
        const created = await createUser.mutateAsync(apiPayload);
        // Affiche le mot de passe temporaire à l'admin (pas d'email implémenté).
        window.prompt(
          `Mot de passe temporaire pour ${created.email} (à transmettre à l'utilisateur) :`,
          created.tempPassword,
        );
      } else {
        await updateUser.mutateAsync({ id: user.id, ...apiPayload });
      }
      onClose();
    } catch (error: any) {
      const message = error?.response?.data?.message ?? 'Erreur lors de la sauvegarde';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? "Modifier l'Utilisateur" : 'Nouvel Utilisateur'}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (user ? 'Enregistrement...' : 'Création...') : (user ? 'Enregistrer' : 'Créer')}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            error={errors.email}
            placeholder="utilisateur@email.com"
            disabled={!!user} // Email cannot be changed when editing
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prénom *"
              value={formData.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              error={errors.firstName}
              placeholder="Jean"
            />

            <Input
              label="Nom *"
              value={formData.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              error={errors.lastName}
              placeholder="Dupont"
            />
          </div>

          <Select
            label="Rôle *"
            value={formData.role}
            onChange={(e) => updateField('role', e.target.value as any)}
            error={errors.role}
            options={[
              { value: 'ADMIN', label: 'Admin' },
              { value: 'COMMERCIAL', label: 'Commercial' },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut *
            </label>
            <div className="flex gap-2">
              {(['active', 'inactive'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => updateField('status', status)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.status === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'active' ? 'Actif' : 'Inactif'}
                </button>
              ))}
            </div>
          </div>

          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Mot de passe temporaire</p>
                  <p className="text-blue-600">
                    Après la création, utilisez le bouton « Réinitialiser le mot de passe » dans la liste pour générer un mot de passe temporaire à transmettre à l'utilisateur.
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
    </Modal>
  );
}
