import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './features/auth/LoginPage';
import TwoFactorPage from './features/auth/TwoFactorPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ServicesPage from './features/catalog/ServicesPage';
import CategoriesPage from './features/catalog/CategoriesPage';
import FaqsPage from './features/content/FaqsPage';
import AdvertisementsPage from './features/content/AdvertisementsPage';
import UsersPage from './features/users/UsersPage';
import OrdersPage from './features/orders/OrdersPage';
import OrderDetailPage from './features/orders/OrderDetailPage';
import CommercialDashboardPage from './features/commercial/CommercialDashboardPage';
import MainLayout from './layouts/MainLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleProtectedRoute({ children, allowedRoles }: { children: JSX.Element; allowedRoles: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role && !allowedRoles.includes(user.role)) {
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
        <Route path="catalog/categories" element={<CategoriesPage />} />

        {/* Content */}
        <Route path="content/faq" element={<FaqsPage />} />
        <Route path="content/advertisements" element={<AdvertisementsPage />} />

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
