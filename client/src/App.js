import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ContactPage from './pages/contact/ContactPage';
import AboutPage from './pages/about/AboutPage';
import CollectionPage from './pages/collection/CollectionPage';
import CategoryPage from './pages/collection/CategoryPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import NotFoundPage from './pages/NotFoundPage';
import UserDashboard from './pages/user/UserDashboard';
import AdminPanel from './pages/admin/AdminPanel';
import DashboardHome from './pages/admin/DashboardHome';
import BooksPage from './pages/admin/BooksPage';
import MembersPage from './pages/admin/MembersPage';
import IssuesPage from './pages/admin/IssuesPage';
import UsersPage from './pages/admin/UsersPage';
import OrdersPage from './pages/admin/OrdersPage';
import BackToTop from './components/common/BackToTop';

const ProtectedRoute = ({ children, adminRequired }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'var(--bg-primary)' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminRequired && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup"   element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/contact"  element={<ContactPage />} />
        <Route path="/about"    element={<AboutPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/collection/:category" element={<CategoryPage />} />
        <Route path="/cart"     element={<CartPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminRequired><AdminPanel /></ProtectedRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="orders"  element={<OrdersPage />} />
          <Route path="books"   element={<BooksPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="issues"  element={<IssuesPage />} />
          <Route path="users"   element={<UsersPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <BackToTop />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#c9a84c', secondary: '#000' } },
                error:   { iconTheme: { primary: '#e05a5a', secondary: '#000' } },
              }}
            />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}