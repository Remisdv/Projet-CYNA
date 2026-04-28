import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { useProfile, useUpdateProfile } from '../hooks/useAccount';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync({ firstName, lastName, phone: phone || undefined });
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Prénom</label>
          <input value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom</label>
          <input value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Téléphone</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <Button type="submit" size="sm" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
    </form>
  );
}
