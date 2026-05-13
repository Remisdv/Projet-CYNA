import { useEffect, useState } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { Button } from '@/shared/components/ui/Button';
import { useCreateCustomer, useUpdateCustomer } from '../hooks/useCustomers';
import type { CustomerDto, CustomerStatus } from '../types/customer.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerDto | null;
}

interface FormState {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: CustomerStatus;
}

export default function CustomerFormModal({ isOpen, onClose, customer }: Props) {
  const createMut = useCreateCustomer();
  const updateMut = useUpdateCustomer();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const [form, setForm] = useState<FormState>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (!isOpen) return;
    if (customer) {
      setForm({
        email: customer.email,
        firstName: customer.firstName ?? '',
        lastName: customer.lastName ?? '',
        phone: customer.phone ?? '',
        status: customer.status,
      });
    } else {
      setForm({ email: '', firstName: '', lastName: '', phone: '', status: 'ACTIVE' });
    }
    setErrors({});
  }, [isOpen, customer]);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.email.trim()) e.email = 'Email requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide';
    if (!form.firstName.trim()) e.firstName = 'Prénom requis';
    if (!form.lastName.trim()) e.lastName = 'Nom requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        status: form.status,
      };
      if (!customer) {
        const res = await createMut.mutateAsync(payload);
        window.prompt(
          `Mot de passe temporaire pour ${res.email} (à transmettre au client) :`,
          res.tempPassword,
        );
      } else {
        await updateMut.mutateAsync({ id: customer.id, ...payload });
      }
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erreur lors de la sauvegarde');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'Modifier le client' : 'Nouveau client'}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={submitting}>
            {submitting
              ? customer
                ? 'Enregistrement...'
                : 'Création...'
              : customer
                ? 'Enregistrer'
                : 'Créer'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <Input
          label="Email *"
          type="email"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email}
          placeholder="client@email.com"
          disabled={!!customer}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Prénom *"
            value={form.firstName}
            onChange={(e) => setField('firstName', e.target.value)}
            error={errors.firstName}
          />
          <Input
            label="Nom *"
            value={form.lastName}
            onChange={(e) => setField('lastName', e.target.value)}
            error={errors.lastName}
          />
        </div>

        <Input
          label="Téléphone"
          value={form.phone}
          onChange={(e) => setField('phone', e.target.value)}
          placeholder="+33 6 12 34 56 78"
        />

        <Select
          label="Statut *"
          value={form.status}
          onChange={(e) => setField('status', e.target.value as CustomerStatus)}
          options={[
            { value: 'ACTIVE', label: 'Actif' },
            { value: 'INACTIVE', label: 'Inactif' },
          ]}
        />
      </form>
    </Modal>
  );
}
