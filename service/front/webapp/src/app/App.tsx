import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from '@/shared/context/CartContext';
import { AuthProvider } from '@/shared/context/AuthContext';
import { queryClient } from '@/shared/lib/queryClient';
import PublicLayout from '@/layouts/PublicLayout';
import ProtectedRoute from '@/shared/components/ProtectedRoute';
import HomePage from '@/features/home/pages/HomePage';
import CatalogPage from '@/features/catalog/pages/CatalogPage';
import ProductDetailPage from '@/features/catalog/pages/ProductDetailPage';
import CartPage from '@/features/cart/pages/CartPage';
import CheckoutPage from '@/features/checkout/pages/CheckoutPage';
import AccountPage from '@/features/account/pages/AccountPage';
import ContactPage from '@/features/support/pages/ContactPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/features/auth/pages/ResetPasswordPage';
import TwoFactorPage from '@/features/auth/pages/TwoFactorPage';
import OrderTrackingPage from '@/features/orders/pages/OrderTrackingPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="catalog" element={<CatalogPage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
                <Route path="2fa" element={<TwoFactorPage />} />
                <Route path="checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="orders/:orderId" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
                <Route path="account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                <Route path="support" element={<ContactPage />} />
                {/* Redirects for convenience */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
