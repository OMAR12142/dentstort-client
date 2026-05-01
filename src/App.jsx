import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import PortfolioLayout from './layouts/PortfolioLayout';

// ── Lazy Loaded Pages ─────────────────────────
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ClinicsPage = lazy(() => import('./pages/ClinicsPage'));
const PatientsPage = lazy(() => import('./pages/PatientsPage'));
const PatientProfilePage = lazy(() => import('./pages/PatientProfilePage'));
const TreatmentPlanPage = lazy(() => import('./pages/TreatmentPlanPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const CareerAnalyticsPage = lazy(() => import('./pages/CareerAnalyticsPage'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
const DayDetailPage = lazy(() => import('./pages/DayDetailPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminRevenue = lazy(() => import('./pages/admin/AdminRevenue'));
const AdminDentistProfile = lazy(() => import('./pages/admin/AdminDentistProfile'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));
const LandingPage = lazy(() => import('./pages/LandingPageAdvanced'));
const SuspendedPage = lazy(() => import('./pages/SuspendedPage'));
const NotFound = lazy(() => import('./components/common/NotFound'));
const PublicPortfolioPage = lazy(() => import('./pages/portfolio/PublicPortfolioPage'));
const PublicCaseDetailPage = lazy(() => import('./pages/portfolio/PublicCaseDetailPage'));
const PortfolioEditorPage = lazy(() => import('./pages/portfolio/PortfolioEditorPage'));

// SEO Component
import SEO from './components/common/SEO';
import { Toaster } from 'react-hot-toast';

/**
 * ProtectedRoute: Wrapper for authenticated user routes
 */
function ProtectedRoute() {
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/**
 * AdminRoute: Wrapper for admin-only routes
 */
function AdminRoute() {
  const user = useAuthStore((s) => s.user);
  window.DEBUG_USER = user;

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

/**
 * PublicRoute: Wrapper for public auth routes
 */
function PublicRoute() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  if (token) {
    const target = user?.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}

/**
 * DentistRoute: Wrapper for dentist-only routes
 */
function DentistRoute() {
  const user = useAuthStore((s) => s.user);

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default function App() {
  const isDark = useThemeStore((s) => s.isDark);
  const { isShadowMode, exitShadowMode, user } = useAuthStore();

  useEffect(() => {
    const html = document.documentElement;
    const theme = isDark ? 'dark' : 'light';
    html.setAttribute('data-theme', theme);
    if (isDark) html.classList.add('dark');
    else html.classList.remove('dark');
  }, [isDark]);

  const handleExitShadow = () => {
    if (exitShadowMode()) {
      window.location.href = '/admin/dentists';
    }
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Shadow Mode Banner */}
      {isShadowMode && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-warning text-warning-content px-4 py-2 flex items-center justify-center gap-4 shadow-lg border-b border-warning-content/20 animate-in fade-in slide-in-from-top duration-500">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
            <span className="animate-pulse">●</span> Shadow Access: Viewing as <strong>{user?.name}</strong>
          </div>
          <button 
            onClick={handleExitShadow}
            className="btn btn-xs btn-outline border-warning-content/30 text-warning-content hover:bg-warning-content hover:text-warning"
          >
            Return to Admin Dashboard
          </button>
        </div>
      )}

      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-base-100">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        }
      >
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={
              <>
                <SEO
                  title="Management Software for Dentists"
                  description="The all-in-one SaaS platform for modern dentists. Manage patient records, clinical sessions, and earnings with ease."
                />
                <LandingPage />
              </>
            } />

            {/* Public Portfolio Routes */}
            <Route element={<PortfolioLayout />}>
              <Route path="/portfolio/:slug" element={<PublicPortfolioPage />} />
              <Route path="/portfolio/:slug/case/:caseId" element={<PublicCaseDetailPage />} />
            </Route>

            {/* Auth Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              {/* Dentist-Only Routes */}
              <Route element={<DentistRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/appointments" element={<AppointmentsPage />} />
                  <Route path="/appointments/day/:date" element={<DayDetailPage />} />
                  <Route path="/patients" element={<PatientsPage />} />
                  <Route path="/patients/:id" element={<PatientProfilePage />} />
                  <Route path="/patients/:id/treatment-plan" element={<TreatmentPlanPage />} />
                  <Route path="/clinics" element={<ClinicsPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/career-analytics" element={<CareerAnalyticsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/security" element={<ChangePasswordPage />} />
                  <Route path="/portfolio/manage" element={<PortfolioEditorPage />} />
                </Route>
              </Route>

              {/* Admin-Only Routes */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminOverview />} />
                  <Route path="/admin/revenue" element={<AdminRevenue />} />
                  <Route path="/admin/dentists" element={<AdminUsers />} />
                  <Route path="/admin/dentists/:id" element={<AdminDentistProfile />} />
                  <Route path="/admin/broadcasts" element={<AdminAnnouncements />} />
                </Route>
              </Route>
            </Route>

            {/* Other Routes */}
            <Route path="/suspended" element={<SuspendedPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </Suspense>
    </div>
  );
}
