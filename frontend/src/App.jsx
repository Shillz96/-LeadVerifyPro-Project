import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';
import ComingSoonPage from './components/ComingSoonPage';

// Eagerly load the components most likely to be viewed first for better LCP
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';

// Lazy-loaded pages for performance
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const VerifiedLeadsPage = lazy(() => import('./pages/VerifiedLeadsPage'));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));

// Will create these pages as needed
const PricingPage = lazy(() => import('./pages/PricingPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const VerifyPage = lazy(() => import('./pages/VerifyPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'));

// Optimized loading component with immediate content display
const LoadingFallback = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-primary">Loading...</h2>
      <p className="text-textSecondary">Please wait a moment</p>
    </div>
  </div>
);

// Planned routes that will show "Coming Soon" instead of 404
// Format: { path: '/some/path', featureName: 'Feature Name', estimatedRelease: 'Q3 2023' }
const plannedRoutes = [
  { path: '/dashboard/analytics', featureName: 'Analytics Dashboard', estimatedRelease: 'Coming Next Month' },
  { path: '/leads/import', featureName: 'Lead Import Tool', estimatedRelease: 'Coming Soon' },
  { path: '/leads/export', featureName: 'Lead Export Tool', estimatedRelease: 'Coming Soon' },
  { path: '/dashboard/settings', featureName: 'Dashboard Settings', estimatedRelease: 'Coming Soon' },
  { path: '/api/docs', featureName: 'API Documentation', estimatedRelease: 'Coming Soon' },
  { path: '/support', featureName: 'Support Center', estimatedRelease: 'Coming Soon' }
];

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        {/* Homepage is priority - no Suspense */}
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={
          <Suspense fallback={<LoadingFallback />}>
            <FeaturesPage />
          </Suspense>
        } />
        <Route path="/pricing" element={
          <Suspense fallback={<LoadingFallback />}>
            <PricingPage />
          </Suspense>
        } />
        <Route path="/about" element={
          <Suspense fallback={<LoadingFallback />}>
            <AboutPage />
          </Suspense>
        } />
        <Route path="/contact" element={
          <Suspense fallback={<LoadingFallback />}>
            <ContactPage />
          </Suspense>
        } />
        <Route path="/terms" element={
          <Suspense fallback={<LoadingFallback />}>
            <TermsPage />
          </Suspense>
        } />
        <Route path="/privacy" element={
          <Suspense fallback={<LoadingFallback />}>
            <PrivacyPage />
          </Suspense>
        } />
        <Route path="/error" element={
          <Suspense fallback={<LoadingFallback />}>
            <ErrorPage />
          </Suspense>
        } />
      </Route>
      
      {/* Auth routes - Login is prioritized without Suspense */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={
          <Suspense fallback={<LoadingFallback />}>
            <SignUpPage />
          </Suspense>
        } />
      </Route>
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={
            <Suspense fallback={<LoadingFallback />}>
              <DashboardPage />
            </Suspense>
          } />
          <Route path="/account" element={
            <Suspense fallback={<LoadingFallback />}>
              <AccountPage />
            </Suspense>
          } />
          <Route path="/leads/verified" element={
            <Suspense fallback={<LoadingFallback />}>
              <VerifiedLeadsPage />
            </Suspense>
          } />
          <Route path="/dashboard/verify" element={
            <Suspense fallback={<LoadingFallback />}>
              <VerifyPage />
            </Suspense>
          } />
          <Route path="/dashboard/reports" element={
            <Suspense fallback={<LoadingFallback />}>
              <ReportsPage />
            </Suspense>
          } />
          <Route path="/dashboard/integrations" element={
            <Suspense fallback={<LoadingFallback />}>
              <IntegrationsPage />
            </Suspense>
          } />
          <Route path="/subscription" element={
            <Suspense fallback={<LoadingFallback />}>
              <SubscriptionPage />
            </Suspense>
          } />
          <Route path="/checkout" element={
            <Suspense fallback={<LoadingFallback />}>
              <CheckoutPage />
            </Suspense>
          } />
        </Route>
      </Route>
      
      {/* Planned routes that show "Coming Soon" instead of 404 */}
      {plannedRoutes.map(route => (
        <Route 
          key={route.path} 
          path={route.path} 
          element={
            <ComingSoonPage 
              featureName={route.featureName} 
              estimatedRelease={route.estimatedRelease} 
            />
          } 
        />
      ))}
      
      {/* Fallback for unknown routes */}
      <Route path="*" element={
        <Suspense fallback={<LoadingFallback />}>
          <ErrorPage />
        </Suspense>
      } />
    </Routes>
  );
}

export default App; 