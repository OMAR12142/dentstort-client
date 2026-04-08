import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClinicsPage from './pages/ClinicsPage';
import PatientsPage from './pages/PatientsPage';
import PatientProfilePage from './pages/PatientProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import CareerAnalyticsPage from './pages/CareerAnalyticsPage';
import TasksPage from './pages/TasksPage';
import NotFound from './components/common/NotFound';

/**
 * ProtectedRoute: Wrapper for authenticated user routes
 * - If loading, shows skeleton
 * - If not authenticated, redirects to /login
 * - If authenticated, renders the outlet
 */
function ProtectedRoute() {
  const token = useAuthStore((s) => s.accessToken);

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

/**
 * PublicRoute: Wrapper for public user routes (login, register)
 * - If authenticated, redirects to /dashboard
 * - If not authenticated, renders the outlet
 */
function PublicRoute() {
  const token = useAuthStore((s) => s.accessToken);

  // If already logged in, redirect to dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

/**
 * LandingRoute: Landing page can be visited by anyone
 * - If authenticated, still show landing page with "Go to Dashboard" button
 * - If not authenticated, show normal landing page with "Get Started" button
 */
function LandingRoute() {
  return <LandingPage />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PUBLIC ROUTES - Accessible to everyone */}
        {/* ═══════════════════════════════════════════════════════════ */}

        {/* Landing Page - Always public, smart navbar handles auth state */}
        <Route path="/" element={<LandingRoute />} />

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* AUTH ROUTES - Accessible only to unauthenticated users */}
        {/* Wrapped in PublicRoute to redirect logged-in users */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PROTECTED ROUTES - Accessible only to authenticated users */}
        {/* Wrapped in ProtectedRoute to redirect unauthenticated users */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Dashboard */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Patients */}
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/:id" element={<PatientProfilePage />} />

            {/* Clinics */}
            <Route path="/clinics" element={<ClinicsPage />} />

            {/* Tasks */}
            <Route path="/tasks" element={<TasksPage />} />

            {/* Analytics */}
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/career-analytics" element={<CareerAnalyticsPage />} />
          </Route>
        </Route>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* CATCH-ALL - 404 Not Found */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
