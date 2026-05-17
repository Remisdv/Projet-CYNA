import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShoppingBag, CreditCard, Bell, Lock, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/context/AuthContext';
import { ProfileTab } from '../components/ProfileTab';
import { OrdersTab } from '../components/OrdersTab';
import { SubscriptionsTab } from '../components/SubscriptionsTab';
import { SecurityTab } from '../components/SecurityTab';

const TABS = [
  { id: 'profil', labelKey: 'tabs.profile', icon: User },
  { id: 'commandes', labelKey: 'tabs.orders', icon: ShoppingBag },
  { id: 'abonnements', labelKey: 'tabs.subscriptions', icon: CreditCard },
  { id: 'securite', labelKey: 'tabs.security', icon: Lock },
] as const;

export default function AccountPage() {
  const { t } = useTranslation('account');
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('profil');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">{t('heading')}</h1>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
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
                  {t(tab.labelKey)}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition hover:bg-red-50"
            >
              <LogOut size={16} /> {t('logout')}
            </button>
          </nav>
        </aside>

        <div className="lg:col-span-3">
          {activeTab === 'profil' && <ProfileTab />}
          {activeTab === 'commandes' && <OrdersTab />}
          {activeTab === 'abonnements' && <SubscriptionsTab />}
          {activeTab === 'securite' && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}
