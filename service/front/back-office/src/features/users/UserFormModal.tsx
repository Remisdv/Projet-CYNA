import { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Mail, CheckCircle } from 'lucide-react';
import { useCreateUser, useUpdateUser } from './hooks/useUsers';

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
  user: any | null;
}

export default function UserFormModal({
  isOpen,
  onClose,
  user,
}: UserFormModalProps) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [createdUserEmail, setCreatedUserEmail] = useState('');

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
      setShowSuccessMessage(false);
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
        await createUser.mutateAsync(apiPayload);
        setCreatedUserEmail(formData.email);
        setShowSuccessMessage(true);
      } else {
        await updateUser.mutateAsync({ id: user.id, ...apiPayload });
        onClose();
      }
    } catch (error: any) {
      const message = error?.response?.data?.message ?? 'Erreur lors de la sauvegarde';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close from success message
  const handleCloseSuccess = () => {
    setShowSuccessMessage(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? "Modifier l'Utilisateur" : 'Nouvel Utilisateur'}
      size="md"
      footer={
        !showSuccessMessage ? (
          <>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (user ? 'Enregistrement...' : 'Création...') : (user ? 'Enregistrer' : 'Créer')}
            </Button>
          </>
        ) : (
          <Button onClick={handleCloseSuccess}>
            Fermer
          </Button>
        )
      }
    >
      {!showSuccessMessage ? (
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
                  <p className="font-medium mb-1">Email de bienvenue</p>
                  <p className="text-blue-600">
                    Après la création, un email sera automatiquement envoyé à l'utilisateur avec des identifiants temporaires et un lien pour réinitialiser son mot de passe.
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      ) : (
        <div className="py-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Utilisateur créé avec succès !
          </h3>
          <p className="text-gray-600 mb-4">
            {formData.firstName} {formData.lastName} a été ajouté(e) à la plateforme.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <Mail className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800 text-left">
                <p className="font-medium mb-1">Email envoyé</p>
                <p className="text-green-700">
                  Un email de bienvenue a été envoyé à <span className="font-medium">{createdUserEmail}</span> avec :
                </p>
                <ul className="list-disc list-inside mt-2 text-green-600 space-y-1">
                  <li>Identifiants de connexion temporaires</li>
                  <li>Lien de réinitialisation de mot de passe</li>
                  <li>Instructions de première connexion</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Informations du compte :</span>
            </p>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Nom complet :</dt>
                <dd className="font-medium text-gray-900">{formData.firstName} {formData.lastName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Email :</dt>
                <dd className="font-medium text-gray-900">{formData.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Rôle :</dt>
                <dd className="font-medium text-gray-900 capitalize">{formData.role}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Statut :</dt>
                <dd className="font-medium text-gray-900 capitalize">{formData.status === 'active' ? 'Actif' : 'Inactif'}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </Modal>
  );
}
