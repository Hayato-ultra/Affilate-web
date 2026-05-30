import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import SEO from './components/SEO';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import NotFound from './pages/NotFound';

const FeaturedPage = React.lazy(() => import('./pages/FeaturedPage'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage'));
const AdminLayout = React.lazy(() => import('./components/AdminLayout'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = React.lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductForm = React.lazy(() => import('./pages/admin/AdminProductForm'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface font-body-md">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <BottomNav />
    </div>
  );
}

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <span className="w-8 h-8 border-2 border-outline border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <ErrorBoundary>{children}</ErrorBoundary>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SEO />
      <Routes>
        <Route path="/" element={<Layout><ErrorBoundary><HomePage /></ErrorBoundary></Layout>} />
        <Route path="/shop" element={<Layout><ErrorBoundary><SearchPage /></ErrorBoundary></Layout>} />
        <Route path="/featured" element={<Layout><SuspenseWrapper><FeaturedPage /></SuspenseWrapper></Layout>} />
        <Route path="/product/:id" element={<Layout><SuspenseWrapper><ProductDetail /></SuspenseWrapper></Layout>} />
        <Route path="/login" element={<SuspenseWrapper><Login /></SuspenseWrapper>} />
        <Route path="/register" element={<SuspenseWrapper><Register /></SuspenseWrapper>} />
        <Route path="/about" element={<Layout><SuspenseWrapper><About /></SuspenseWrapper></Layout>} />
        <Route path="/contact" element={<Layout><SuspenseWrapper><Contact /></SuspenseWrapper></Layout>} />
        <Route path="/cart" element={<Layout><SuspenseWrapper><SearchPage /></SuspenseWrapper></Layout>} />
        <Route path="/wishlist" element={<Layout><SuspenseWrapper><WishlistPage /></SuspenseWrapper></Layout>} />
        <Route path="/admin" element={<SuspenseWrapper><AdminLayout><AdminDashboard /></AdminLayout></SuspenseWrapper>} />
        <Route path="/admin/products" element={<SuspenseWrapper><AdminLayout><AdminProducts /></AdminLayout></SuspenseWrapper>} />
        <Route path="/admin/products/new" element={<SuspenseWrapper><AdminLayout><AdminProductForm /></AdminLayout></SuspenseWrapper>} />
        <Route path="/admin/products/:id/edit" element={<SuspenseWrapper><AdminLayout><AdminProductForm /></AdminLayout></SuspenseWrapper>} />
        <Route path="/admin/settings" element={<SuspenseWrapper><AdminLayout><AdminSettings /></AdminLayout></SuspenseWrapper>} />
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </AuthProvider>
  );
}
