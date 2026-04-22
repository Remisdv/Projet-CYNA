import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShoppingBag,
  CreditCard,
  Bell,
  Lock,
  LogOut,
  Download,
  Eye,
  Shield,
  Smartphone,
  Mail,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useProfile, useUpdateProfile, useChangePassword } from './hooks/useAccount';
import { useOrders, downloadInvoice } from './hooks/useOrders';
import { useSubscriptions } from './hooks/useSubscriptions';
import api from '../../services/api';

/* ─── Tabs ───────────────────────────────────────────────────────── */
const TABS = [
  { id: 'profil', label: 'Mon profil', icon: User },
  { id: 'commandes', label: 'Commandes', icon: ShoppingBag },
  { id: 'abonnements', label: 'Abonnements', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'securite', label: 'Sécurité', icon: Lock },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profil');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Mon espace</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-1">
          <div className="mb-4 flex flex-col items-center text-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
              {user?.firstName?.[0] ?? '?'}{user?.lastName?.[0] ?? '?'}
            </div>
            <p className="font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <nav className="space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${activeTab === tab.id
                      ? 'bg-blue-50 font-semibold text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition hover:bg-red-50"
            >
              <LogOut size={16} /> Déconnexion
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profil' && <ProfileTab />}
          {activeTab === 'commandes' && <OrdersTab />}
          {activeTab === 'abonnements' && <SubscriptionsTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'securite' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

/* ─── Profile tab ─────────────────────────────────────────────────── */
function ProfileTab() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
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

/* ─── Orders tab ──────────────────────────────────────────────────── */
function OrdersTab() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { data, isLoading } = useOrders(page);

  if (isLoading) return <div className="text-center py-8 text-gray-500">Chargement...</div>;

  const orders = data?.data || [];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Mes commandes</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">Aucune commande pour le moment.</p>
      ) : (
        orders.map(order => (
          <div
            key={order.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-gray-700">{order.ref}</span>
              <Badge variant={order.status === 'paid' ? 'success' : order.status === 'pending' ? 'warning' : 'secondary'}>
                {order.status}
              </Badge>
            </div>
            <p className="mb-1 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
            <p className="mb-2 text-sm text-gray-600">
              {order.items.map((i: any) => i.productName).join(', ')}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-blue-600">{Number(order.amount).toFixed(2)} €</p>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <Eye size={14} className="mr-1" /> Suivre
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadInvoice(order.id)}
                >
                  <Download size={14} className="mr-1" /> Facture
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
      {data && data.total > data.limit && (
        <div className="flex justify-center gap-2 pt-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            Précédent
          </Button>
          <span className="text-sm text-gray-500 flex items-center">Page {page}</span>
          <Button size="sm" variant="outline" disabled={page * data.limit >= data.total} onClick={() => setPage(p => p + 1)}>
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─── Subscriptions tab ───────────────────────────────────────────── */
function SubscriptionsTab() {
  const { data: subscriptions, isLoading } = useSubscriptions();

  if (isLoading) return <div className="text-center py-8 text-gray-500">Chargement...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Mes abonnements</h2>
      {!subscriptions || subscriptions.length === 0 ? (
        <p className="text-sm text-gray-500">Aucun abonnement actif.</p>
      ) : (
        subscriptions.map(sub => (
          <div
            key={sub.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-1 flex items-center justify-between">
              <p className="font-semibold text-gray-900">{sub.productName}</p>
              <Badge variant={sub.status === 'active' ? 'success' : sub.status === 'cancelled' ? 'destructive' : 'secondary'}>
                {sub.status}
              </Badge>
            </div>
            <p className="text-xs text-gray-400">
              {sub.planType} — {Number(sub.price).toFixed(2)} €/{sub.planType === 'mensuel' ? 'mois' : 'an'}
            </p>
            {sub.renewalDate && (
              <p className="mt-1 text-xs text-gray-500">
                Prochain renouvellement : {new Date(sub.renewalDate).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

/* ─── Notifications tab ───────────────────────────────────────────── */
function NotificationsTab() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Préférences de notifications</h2>
      <div className="space-y-4">
        {[
          { label: 'Alertes de sécurité', desc: 'Soyez informé des événements critiques détectés.', checked: true },
          { label: 'Rapports mensuels', desc: 'Recevez votre rapport de sécurité mensuel par email.', checked: true },
          { label: 'Actualités et offres', desc: 'Restez informé de nos nouvelles solutions et promotions.', checked: false },
          { label: 'Renouvellements', desc: 'Rappels avant le renouvellement de vos abonnements.', checked: true },
        ].map(item => (
          <label key={item.label} className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              defaultChecked={item.checked}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          </label>
        ))}
      </div>
      <Button size="sm" className="mt-6">Enregistrer</Button>
    </div>
  );
}

/* ─── Security tab ────────────────────────────────────────────────── */
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: z.string().min(6, 'Minimum 6 caractères'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

function SecurityTab() {
  const changePassword = useChangePassword();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data: any) => {
    try {
      setSuccess(false);
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccess(true);
      reset();
    } catch {
      // error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Sécurité du compte</h2>
        {success && (
          <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 rounded-lg">
            Mot de passe modifié avec succès.
          </div>
        )}
        {changePassword.isError && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            {(changePassword.error as any)?.response?.data?.message || 'Erreur lors du changement de mot de passe'}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Mot de passe actuel"
            type="password"
            {...register('currentPassword')}
            error={errors.currentPassword?.message as string}
          />
          <Input
            label="Nouveau mot de passe"
            type="password"
            {...register('newPassword')}
            error={errors.newPassword?.message as string}
          />
          <Input
            label="Confirmer le nouveau mot de passe"
            type="password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message as string}
          />
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Modification...' : 'Changer le mot de passe'}
          </Button>
        </form>
      </div>

      <TwoFactorSection />
    </div>
  );
}

/* ─── 2FA section ─────────────────────────────────────────────────── */
function TwoFactorSection() {
  const { user, refreshUser } = useAuth();
  const [view, setView] = useState<'main' | 'enable-email' | 'setup-totp' | 'confirm-totp' | 'disable'>('main');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [totpData, setTotpData] = useState<{ secret: string; qrCodeDataUrl: string } | null>(null);
  const [emailEnableCodeSent, setEmailEnableCodeSent] = useState(false);
  const [disableCodeSent, setDisableCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const userId = String(user?.id ?? '');
  const twoFactorEnabled = user?.twoFactorEnabled ?? false;
  const totpEnabled = user?.totpEnabled ?? false;

  const reset = () => {
    setPassword('');
    setCode('');
    setError('');
    setSuccess('');
    setTotpData(null);
    setEmailEnableCodeSent(false);
    setDisableCodeSent(false);
    setView('main');
  };

  // Email enable — step 1: verify password and send code
  const handleRequestEnableEmail = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/webapp/auth/2fa/email/enable', { userId, password });
      setEmailEnableCodeSent(true);
      setCode('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  // Email enable — step 2: confirm with code
  const handleConfirmEnableEmail = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/webapp/auth/2fa/email/enable/confirm', { userId, password, code });
      setSuccess('Authentification par email activée.');
      refreshUser();
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  // TOTP setup — step 1: verify password and generate QR
  const handleSetupTotp = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/webapp/auth/2fa/totp/setup', { userId, password });
      setTotpData({ secret: data.secret, qrCodeDataUrl: data.qrCodeDataUrl });
      setView('confirm-totp');
      // Keep password in state — needed for confirm step
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  // TOTP setup — step 2: confirm with password + TOTP code
  const handleConfirmTotp = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/webapp/auth/2fa/totp/confirm', { userId, password, code });
      setSuccess('Application d\'authentification configurée avec succès.');
      refreshUser();
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  // Disable — email 2FA: request code first
  const handleRequestDisableCode = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/webapp/auth/2fa/disable/send-code', { userId, password });
      setDisableCodeSent(true);
      setCode('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  // Disable — confirm with password + code (email or TOTP)
  const handleDisable = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/webapp/auth/2fa/disable', { userId, password, code });
      setSuccess('Authentification à deux facteurs désactivée.');
      refreshUser();
      reset();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Shield size={18} className="text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Authentification à deux facteurs</h2>
        {twoFactorEnabled && (
          <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            {totpEnabled ? 'Activée (Application)' : 'Activée (Email)'}
          </span>
        )}
        {!twoFactorEnabled && (
          <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Désactivée
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600">{success}</div>
      )}

      {/* ─── Main view ─── */}
      {view === 'main' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            La 2FA renforce la sécurité de votre compte en demandant un code supplémentaire lors de la connexion.
          </p>
          {!twoFactorEnabled && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" size="sm" onClick={() => { setError(''); setSuccess(''); setView('enable-email'); }}>
                <Mail size={14} className="mr-1.5" />
                Activer par email
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setError(''); setSuccess(''); setView('setup-totp'); }}>
                <Smartphone size={14} className="mr-1.5" />
                Activer par application (TOTP)
              </Button>
            </div>
          )}
          {twoFactorEnabled && (
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => { setError(''); setSuccess(''); setView('disable'); }}>
              Désactiver la 2FA
            </Button>
          )}
        </div>
      )}

      {/* ─── Enable email — password then code appears on same screen ─── */}
      {view === 'enable-email' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Entrez votre mot de passe pour recevoir un code de confirmation par email.
          </p>
          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          />
          {!emailEnableCodeSent ? (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleRequestEnableEmail} disabled={loading || !password}>
                {loading ? 'Envoi...' : 'Envoyer le code'}
              </Button>
              <Button variant="outline" size="sm" onClick={reset}>Annuler</Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-green-600">Un code a été envoyé à votre adresse email.</p>
              <Input
                label="Code reçu par email (6 chiffres)"
                value={code}
                onChange={(e) => setCode((e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleConfirmEnableEmail} disabled={loading || code.length !== 6}>
                  {loading ? 'Activation...' : 'Activer la 2FA'}
                </Button>
                <Button variant="outline" size="sm" onClick={reset}>Annuler</Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Setup TOTP — step 1: password ─── */}
      {view === 'setup-totp' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Entrez votre mot de passe pour générer le QR code.
          </p>
          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSetupTotp} disabled={loading || !password}>
              {loading ? 'Génération...' : 'Continuer'}
            </Button>
            <Button variant="outline" size="sm" onClick={reset}>Annuler</Button>
          </div>
        </div>
      )}

      {/* ─── Confirm TOTP — step 2: scan QR + password + code ─── */}
      {view === 'confirm-totp' && totpData && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Scannez ce QR code avec votre application (Google Authenticator, Authy…), puis entrez votre mot de passe et le code généré.
          </p>
          <div className="flex justify-center">
            <img src={totpData.qrCodeDataUrl} alt="QR Code TOTP" className="h-40 w-40 rounded border border-gray-200" />
          </div>
          <p className="text-center text-xs text-gray-400">
            Ou entrez manuellement : <span className="font-mono text-gray-600">{totpData.secret}</span>
          </p>
          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
          />
          <Input
            label="Code de l'application (6 chiffres)"
            value={code}
            onChange={(e) => setCode((e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleConfirmTotp} disabled={loading || code.length !== 6 || !password}>
              {loading ? 'Vérification...' : 'Confirmer'}
            </Button>
            <Button variant="outline" size="sm" onClick={reset}>Annuler</Button>
          </div>
        </div>
      )}

      {/* ─── Disable 2FA ─── */}
      {view === 'disable' && (
        <div className="space-y-4">
          {totpEnabled ? (
            /* TOTP: password + TOTP code together */
            <>
              <p className="text-sm text-gray-600">
                Entrez votre mot de passe et le code de votre application pour désactiver la 2FA.
              </p>
              <Input
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
              />
              <Input
                label="Code de l'application (6 chiffres)"
                value={code}
                onChange={(e) => setCode((e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
              />
              <div className="flex gap-2">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDisable}
                  disabled={loading || !password || code.length !== 6}>
                  {loading ? 'Désactivation...' : 'Désactiver'}
                </Button>
                <Button variant="outline" size="sm" onClick={reset}>Annuler</Button>
              </div>
            </>
          ) : !disableCodeSent ? (
            /* Email 2FA — step 1: verify password, send code */
            <>
              <p className="text-sm text-gray-600">
                Entrez votre mot de passe pour recevoir un code de confirmation par email.
              </p>
              <Input
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
              />
              <div className="flex gap-2">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleRequestDisableCode}
                  disabled={loading || !password}>
                  {loading ? 'Envoi...' : 'Envoyer le code'}
                </Button>
                <Button variant="outline" size="sm" onClick={reset}>Annuler</Button>
              </div>
            </>
          ) : (
            /* Email 2FA — step 2: enter received code */
            <>
              <p className="text-sm text-gray-600">
                Un code de confirmation a été envoyé à votre adresse email. Entrez-le pour désactiver la 2FA.
              </p>
              <Input
                label="Code reçu par email (6 chiffres)"
                value={code}
                onChange={(e) => setCode((e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
              />
              <div className="flex gap-2">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDisable}
                  disabled={loading || code.length !== 6}>
                  {loading ? 'Désactivation...' : 'Désactiver'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setDisableCodeSent(false); setCode(''); setError(''); }}>Retour</Button>
                <Button variant="outline" size="sm" onClick={reset}>Annuler</Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
