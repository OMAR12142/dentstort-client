import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
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
const TasksPage = lazy(() => import('./pages/TasksPage'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminRevenue = lazy(() => import('./pages/admin/AdminRevenue'));
const AdminDentistProfile = lazy(() => import('./pages/admin/AdminDentistProfile'));
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

/**
 * ProtectedRoute: Wrapper for authenticated user routes
 * - If not authenticated, redirects to /login
 * - If authenticated, renders the outlet
 */
function ProtectedRoute() {
  const token = useAuthStore((s) => s.accessToken);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

/**
 * AdminRoute: Wrapper for admin-only routes
 * - Handles hydration: shows spinner if user is not yet loaded
 * - Strict case-sensitive role check
 * - Logs denial with the exact role string for debugging
 * - Exposes window.DEBUG_USER for live console inspection
 */
function AdminRoute() {
  const user = useAuthStore((s) => s.user);

  // Global debug helper — type DEBUG_USER in the browser console
  window.DEBUG_USER = user;

  // Hydration guard: user is null while localStorage is parsing
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  // Strict, case-sensitive admin check
  if (!user || user.role !== 'admin') {
    console.warn(
      `⛔ [ADMIN GUARD] Access DENIED. user.role is: "${user?.role}" (type: ${typeof user?.role}). Expected: "admin".`
    );
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

/**
 * PublicRoute: Wrapper for public auth routes (login, register)
 * - If authenticated, redirects based on ROLE (admin → /admin, dentist → /dashboard)
 * - This is critical: a hard-coded redirect to /dashboard was the ROOT CAUSE
 *   of the admin redirect bug — it raced against useLogin's navigate() and won.
 */
function PublicRoute() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  if (token) {
    // Role-aware redirect — admins go to /admin, dentists to /dashboard
    const target = user?.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}

/**
 * DentistRoute: Wrapper for dentist-only routes
 * - Prevents admins from seeing clinical dashboards
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

  // If user is admin, they don't belong here. Send them to their panel.
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default function App() {
  // Initialize theme on app mount
  const isDark = useThemeStore((s) => s.isDark);

  useEffect(() => {
    // Apply theme to <html> tag on mount and whenever theme changes
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
    } else {
      html.classList.remove('dark');
      html.setAttribute('data-theme', 'light');
    }
  }, [isDark]);

  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-base-100">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      }>
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

          {/* Public Portfolio Routes (No Auth Required) */}
          <Route element={<PortfolioLayout />}>
            <Route path="/portfolio/:slug" element={<PublicPortfolioPage />} />
            <Route path="/portfolio/:slug/case/:caseId" element={<PublicCaseDetailPage />} />
          </Route>

          {/* Auth Routes (Wrapped in PublicRoute) */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={
              <>
                <SEO title="Login" description="Access your DentStory account." noindex />
                <LoginPage />
              </>
            } />
            <Route path="/register" element={
              <>
                <SEO title="Get Started" description="Join 1,000+ dentists transforming their practice with DentStory." />
                <RegisterPage />
              </>
            } />
          </Route>

          {/* Protected Routes (Wrapped in ProtectedRoute) */}
          <Route element={<ProtectedRoute />}>
            
            {/* Dentist-Only Routes (Excludes Admins) */}
            <Route element={<DentistRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={
                  <>
                    <SEO title="Dashboard" noindex />
                    <DashboardPage />
                  </>
                } />
                <Route path="/patients" element={
                  <>
                    <SEO title="Patient Registry" noindex />
                    <PatientsPage />
                  </>
                } />
                <Route path="/patients/:id" element={
                  <>
                    <SEO title="Patient Profile" noindex />
                    <PatientProfilePage />
                  </>
                } />
                <Route path="/patients/:id/treatment-plan" element={
                  <>
                    <SEO title="Treatment Plan" noindex />
                    <TreatmentPlanPage />
                  </>
                } />
                <Route path="/clinics" element={
                  <>
                    <SEO title="My Clinics" noindex />
                    <ClinicsPage />
                  </>
                } />
                <Route path="/tasks" element={
                  <>
                    <SEO title="Clinical Tasks" noindex />
                    <TasksPage />
                  </>
                } />
                <Route path="/analytics" element={
                  <>
                    <SEO title="Practice Analytics" noindex />
                    <AnalyticsPage />
                  </>
                } />
                <Route path="/career-analytics" element={
                  <>
                    <SEO title="Career Insights" noindex />
                    <CareerAnalyticsPage />
                  </>
                } />
                <Route path="/profile" element={
                  <>
                    <SEO title="My Profile" noindex />
                    <ProfilePage />
                  </>
                } />
                <Route path="/profile/security" element={
                  <>
                    <SEO title="Change Password" noindex />
                    <ChangePasswordPage />
                  </>
                } />
                <Route path="/portfolio/manage" element={
                  <>
                    <SEO title="Portfolio Editor" noindex />
                    <PortfolioEditorPage />
                  </>
                } />
              </Route>
            </Route>

            {/* Admin-Only Routes (Excludes Dentists) */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={
                  <>
                    <SEO title="Admin Overview" noindex />
                    <AdminOverview />
                  </>
                } />
                <Route path="/admin/revenue" element={
                  <>
                    <SEO title="Revenue Management" noindex />
                    <AdminRevenue />
                  </>
                } />
                <Route path="/admin/dentists" element={
                  <>
                    <SEO title="Dentist Management" noindex />
                    <AdminUsers />
                  </>
                } />
                <Route path="/admin/dentists/:id" element={
                  <>
                    <SEO title="Dentist Profile Audit" noindex />
                    <AdminDentistProfile />
                  </>
                } />
              </Route>
            </Route>
          </Route>

          {/* Suspended Account */}
          <Route path="/suspended" element={
            <>
              <SEO title="Account Suspended" noindex />
              <SuspendedPage />
            </>
          } />

          {/* Catch-all 404 */}
          <Route path="*" element={
            <>
              <SEO title="Page Not Found" noindex />
              <NotFound />
            </>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
