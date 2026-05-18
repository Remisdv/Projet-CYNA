import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { useProfile, useUpdateProfile } from '../hooks/useAccount';
import type { Address } from '../types/account.types';

const inputCls = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

function AddressBlock({ title, address }: { title: string; address?: Address }) {
  if (!address) return null;
  return (
    <div className="mt-6">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">{title}</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[
          { label: 'Rue', value: address.street },
          { label: 'Code postal', value: address.postalCode },
          { label: 'Ville', value: address.city },
          { label: 'Pays', value: address.country },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs font-medium uppercase text-gray-400">{label}</p>
            <p className="mt-0.5 text-sm text-gray-800">{value || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddressFields({
  title,
  prefix,
  value,
  onChange,
}: {
  title: string;
  prefix: string;
  value: Address;
  onChange: (a: Address) => void;
}) {
  const set = (field: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [field]: e.target.value });
  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-gray-700">{title}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-600">Rue</label>
          <input id={`${prefix}-street`} value={value.street} onChange={set('street')} className={inputCls} placeholder="12 rue de la Paix" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Code postal</label>
          <input id={`${prefix}-postalCode`} value={value.postalCode} onChange={set('postalCode')} className={inputCls} placeholder="75001" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Ville</label>
          <input id={`${prefix}-city`} value={value.city} onChange={set('city')} className={inputCls} placeholder="Paris" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Pays</label>
          <input id={`${prefix}-country`} value={value.country} onChange={set('country')} className={inputCls} placeholder="France" />
        </div>
      </div>
    </div>
  );
}

const emptyAddress = (): Address => ({ street: '', postalCode: '', city: '', country: '' });

export function ProfileTab() {
  const { data: profile, isLoading } = useProfile();
  const [editing, setEditing] = useState(false);

  if (isLoading) return <div className="text-center py-8 text-gray-500">Chargement...</div>;
  if (!profile) return <div className="text-center py-8 text-gray-500">Profil introuvable</div>;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">Informations personnelles</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { label: 'Prénom', value: profile.firstName },
          { label: 'Nom', value: profile.lastName },
          { label: 'Email', value: profile.email },
          { label: 'Téléphone', value: profile.phone || '—' },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs font-medium uppercase text-gray-400">{label}</p>
            <p className="mt-0.5 text-sm text-gray-800">{value}</p>
          </div>
        ))}
      </div>
      <AddressBlock title="Adresse de facturation" address={profile.billingAddress} />
      <AddressBlock title="Adresse de livraison" address={profile.shippingAddress} />
      <Button variant="outline" size="sm" className="mt-6" onClick={() => setEditing(!editing)}>
        {editing ? 'Annuler' : 'Modifier mes informations'}
      </Button>
      {editing && <ProfileEditForm profile={profile} onSave={() => setEditing(false)} />}
    </div>
  );
}

function ProfileEditForm({ profile, onSave }: { profile: any; onSave: () => void }) {
  const updateProfile = useUpdateProfile();
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [phone, setPhone] = useState(profile.phone || '');
  const [billingAddress, setBillingAddress] = useState<Address>(
    profile.billingAddress ?? emptyAddress(),
  );
  const [shippingAddress, setShippingAddress] = useState<Address>(
    profile.shippingAddress ?? emptyAddress(),
  );

  const toAddressOrUndefined = (a: Address) =>
    a.street || a.city || a.postalCode || a.country ? a : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync({
      firstName,
      lastName,
      phone: phone || undefined,
      billingAddress: toAddressOrUndefined(billingAddress),
      shippingAddress: toAddressOrUndefined(shippingAddress),
    });
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom</label>
          <input value={firstName} onChange={e => setFirstName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <input value={lastName} onChange={e => setLastName(e.target.value)} className={inputCls} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Téléphone</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} />
      </div>
      <AddressFields
        title="Adresse de facturation"
        prefix="billing"
        value={billingAddress}
        onChange={setBillingAddress}
      />
      <AddressFields
        title="Adresse de livraison"
        prefix="shipping"
        value={shippingAddress}
        onChange={setShippingAddress}
      />
      <Button type="submit" size="sm" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
    </form>
  );
}
