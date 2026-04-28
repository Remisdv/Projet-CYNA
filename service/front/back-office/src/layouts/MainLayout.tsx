import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Users,
  LogOut,
  ChevronDown,
  Package,
  FolderOpen,
  Megaphone,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

interface NavLeaf {
  key: string;
  href: string;
  icon: typeof LayoutDashboard;
}

interface NavItem {
  key: string;
  icon: typeof LayoutDashboard;
  roles?: string[];
  href?: string;
  children?: NavLeaf[];
}

const navigation: NavItem[] = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { key: 'commercialDashboard', href: '/commercial', icon: TrendingUp, roles: ['commercial', 'admin'] },
  { key: 'orders', href: '/orders', icon: ShoppingCart, roles: ['admin'] },
  {
    key: 'catalog',
    icon: ShoppingBag,
    roles: ['admin'],
    children: [
      { key: 'services', href: '/catalog/services', icon: Package },
      { key: 'categories', href: '/catalog/categories', icon: FolderOpen },
    ],
  },
  {
    key: 'content',
    icon: FileText,
    roles: ['admin'],
    children: [
      { key: 'advertisements', href: '/content/advertisements', icon: Megaphone },
    ],
  },
  { key: 'users', href: '/users', icon: Users, roles: ['admin'] },
];

export default function MainLayout() {
  const { logout, user } = useAuth();
  const { t } = useTranslation('common');
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    catalog: true,
    content: true,
  });

  // Les utilisateurs commerciaux n'ont accès qu'à /commercial.
  // Toute autre route est redirigée ici (évite d'avoir à wrapper chaque route).
  const isAdmin = user?.roles?.some((r) => r.toLowerCase() === 'admin');
  const isCommercial = user?.roles?.some((r) => r.toLowerCase() === 'commercial');
  if (!isAdmin && isCommercial && !location.pathname.startsWith('/commercial')) {
    return <Navigate to="/commercial" replace />;
  }

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl">
        <div className="flex items-center justify-center h-16 bg-gradient-to-r from-blue-600 to-blue-700">
          <span className="text-2xl font-bold tracking-wide">{t('app.title')}</span>
        </div>
        <nav className="mt-8 px-3 space-y-2 overflow-y-auto h-[calc(100vh-160px)]">
          {navigation.map((item) => {
            // Check role-based access
            if (item.roles) {
              if (!user?.roles?.some(r => item.roles!.includes(r.toLowerCase()))) {
                return null; // Hide menu item if user doesn't have required role
              }
            }

            if (item.children) {
              const isOpen = openMenus[item.key];
              const hasActiveChild = item.children.some((child) =>
                location.pathname.startsWith(child.href)
              );

              return (
                <div key={item.key}>
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className={clsx(
                      'w-full group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all',
                      hasActiveChild
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {t(`navigation.${item.key}`)}
                    </div>
                    <ChevronDown
                      className={clsx(
                        'h-4 w-4 transition-transform',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="mt-1 ml-6 space-y-1">
                      {item.children.map((child) => {
                        const isActive = location.pathname === child.href;
                        return (
                          <Link
                            key={child.key}
                            to={child.href}
                            className={clsx(
                              'group flex items-center px-3 py-2 text-sm rounded-lg transition-all',
                              isActive
                                ? 'bg-blue-500 text-white font-medium shadow-md'
                                : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            )}
                          >
                            <child.icon className="mr-3 h-4 w-4 flex-shrink-0" />
                            {t(`navigation.${child.key}`)}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.key}
                to={item.href!}
                className={clsx(
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {t(`navigation.${item.key}`)}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-full p-4 bg-gray-900 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
              title={t('navigation.logout')}
            >
              <LogOut className="h-5 w-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
