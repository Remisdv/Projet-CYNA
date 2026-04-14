import { useState } from 'react';
import {
  User,
  ShoppingBag,
  CreditCard,
  Bell,
  Lock,
  LogOut,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

/* ─── Mock data ──────────────────────────────────────────────────── */
const MOCK_USER = {
  prenom: 'Jean',
  nom: 'Dupont',
  email: 'jean.dupont@exemple.fr',
  telephone: '+33 6 12 34 56 78',
  entreprise: 'Acme Corp',
};

const MOCK_ORDERS = [
  {
    id: 'CYNA-ABC123',
    date: '2024-06-10',
    statut: 'active',
    produits: ['SOC Essentiel', 'EDR Pro'],
    total: 349.0,
  },
  {
    id: 'CYNA-DEF456',
    date: '2024-01-15',
    statut: 'terminée',
    produits: ['Audit de sécurité'],
    total: 1200.0,
  },
];

const MOCK_SUBSCRIPTIONS = [
  { id: '1', nom: 'SOC Essentiel', periodicite: 'mensuel', prix: 199, prochaine: '2024-07-10', statut: 'actif' },
  { id: '2', nom: 'EDR Pro', periodicite: 'mensuel', prix: 150, prochaine: '2024-07-10', statut: 'actif' },
];

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Mon espace</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-1">
          <div className="mb-4 flex flex-col items-center text-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
              {MOCK_USER.prenom[0]}{MOCK_USER.nom[0]}
            </div>
            <p className="font-semibold text-gray-900">
              {MOCK_USER.prenom} {MOCK_USER.nom}
            </p>
            <p className="text-xs text-gray-500">{MOCK_USER.email}</p>
          </div>
          <nav className="space-y-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    activeTab === tab.id
                      ? 'bg-blue-50 font-semibold text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition hover:bg-red-50">
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
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-gray-900">Informations personnelles</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { label: 'Prénom', value: MOCK_USER.prenom },
          { label: 'Nom', value: MOCK_USER.nom },
          { label: 'Email', value: MOCK_USER.email },
          { label: 'Téléphone', value: MOCK_USER.telephone },
          { label: 'Entreprise', value: MOCK_USER.entreprise },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs font-medium uppercase text-gray-400">{label}</p>
            <p className="mt-0.5 text-sm text-gray-800">{value}</p>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" className="mt-6">
        Modifier mes informations
      </Button>
    </div>
  );
}

/* ─── Orders tab ──────────────────────────────────────────────────── */
function OrdersTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Mes commandes</h2>
      {MOCK_ORDERS.map(order => (
        <div
          key={order.id}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-sm font-semibold text-gray-700">{order.id}</span>
            <Badge variant={order.statut === 'active' ? 'default' : 'secondary'}>
              {order.statut}
            </Badge>
          </div>
          <p className="mb-1 text-xs text-gray-400">{order.date}</p>
          <p className="mb-2 text-sm text-gray-600">{order.produits.join(', ')}</p>
          <p className="text-sm font-bold text-blue-600">{order.total.toFixed(2)} €</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Subscriptions tab ───────────────────────────────────────────── */
function SubscriptionsTab() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Mes abonnements</h2>
      {MOCK_SUBSCRIPTIONS.map(sub => (
        <div
          key={sub.id}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-1 flex items-center justify-between">
            <p className="font-semibold text-gray-900">{sub.nom}</p>
            <Badge variant="default">{sub.statut}</Badge>
          </div>
          <p className="text-xs text-gray-400">
            {sub.periodicite} — {sub.prix} €/{sub.periodicite === 'mensuel' ? 'mois' : 'an'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Prochain renouvellement : {sub.prochaine}
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline">
              Modifier
            </Button>
            <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600">
              Résilier
            </Button>
          </div>
        </div>
      ))}
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
function SecurityTab() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Sécurité du compte</h2>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Mot de passe actuel
          </label>
          <input
            type="password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nouveau mot de passe
          </label>
          <input
            type="password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Confirmer le nouveau mot de passe
          </label>
          <input
            type="password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>
      </div>
      <Button size="sm" className="mt-6">Changer le mot de passe</Button>
    </div>
  );
}
