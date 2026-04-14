import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClinicsPage from './pages/ClinicsPage';
import PatientsPage from './pages/PatientsPage';
import PatientProfilePage from './pages/PatientProfilePage';
import TreatmentPlanPage from './pages/TreatmentPlanPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CareerAnalyticsPage from './pages/CareerAnalyticsPage';
import TasksPage from './pages/TasksPage';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminDentistProfile from './pages/admin/AdminDentistProfile';
import NotFound from './components/common/NotFound';
import LandingPage from './pages/LandingPageAdvanced';
import SuspendedPage from './pages/SuspendedPage';

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
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth Routes (Wrapped in PublicRoute) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Routes (Wrapped in ProtectedRoute + MainLayout) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/:id" element={<PatientProfilePage />} />
            <Route path="/patients/:id/treatment-plan" element={<TreatmentPlanPage />} />
            <Route path="/clinics" element={<ClinicsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/career-analytics" element={<CareerAnalyticsPage />} />
          </Route>

          {/* Admin Routes (ProtectedRoute → AdminRoute → AdminLayout) */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/revenue" element={<AdminRevenue />} />
              <Route path="/admin/dentists" element={<AdminUsers />} />
              <Route path="/admin/dentists/:id" element={<AdminDentistProfile />} />
            </Route>
          </Route>
        </Route>

        {/* Suspended Account — outside ProtectedRoute so no layout chrome */}
        <Route path="/suspended" element={<SuspendedPage />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
