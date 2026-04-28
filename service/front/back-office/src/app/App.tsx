import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { AuthProvider, useAuth } from '@/shared/context/AuthContext';
import { queryClient } from '@/shared/lib/queryClient';

import LoginPage from '@/features/auth/pages/LoginPage';
import TwoFactorPage from '@/features/auth/pages/TwoFactorPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import ServicesPage from '@/features/catalog/pages/ServicesPage';
import CategoriesPage from '@/features/catalog/pages/CategoriesPage';
import ServiceFormPage from '@/features/catalog/pages/ServiceFormPage';
import FaqsPage from '@/features/content/pages/FaqsPage';
import AdvertisementsPage from '@/features/content/pages/AdvertisementsPage';
import UsersPage from '@/features/users/pages/UsersPage';
import OrdersPage from '@/features/orders/pages/OrdersPage';
import OrderDetailPage from '@/features/orders/pages/OrderDetailPage';
import CommercialDashboardPage from '@/features/commercial/pages/CommercialDashboardPage';
import CarouselPage from '@/features/content/pages/CarouselPage';
import MainLayout from '@/layouts/MainLayout';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation('common');

  if (isLoading) {
    return <div>{t('app.loading')}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleProtectedRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { t } = useTranslation('common');

  if (isLoading) {
    return <div>{t('app.loading')}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.roles?.some(r => allowedRoles.includes(r.toLowerCase()))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/2fa" element={<TwoFactorPage />} />

      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="commercial" element={
          <RoleProtectedRoute allowedRoles={['commercial', 'admin']}>
            <CommercialDashboardPage />
          </RoleProtectedRoute>
        } />

        {/* Orders */}
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />

        {/* Catalog */}
        <Route path="catalog/services" element={<ServicesPage />} />
        <Route path="catalog/services/new" element={<ServiceFormPage />} />
        <Route path="catalog/services/:id/edit" element={<ServiceFormPage />} />
        <Route path="catalog/categories" element={<CategoriesPage />} />

        {/* Content */}
        <Route path="content/faq" element={<FaqsPage />} />
        <Route path="content/advertisements" element={<AdvertisementsPage />} />
        <Route path="content/carousel" element={<CarouselPage />} />

        {/* Users */}
        <Route path="users" element={<UsersPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
