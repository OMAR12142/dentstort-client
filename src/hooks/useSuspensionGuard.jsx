import { useEffect, useState } from 'react';
import { Ban, Mail, LogOut } from 'lucide-react';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

const POLL_INTERVAL = 30_000; // Check every 30 seconds

/**
 * useSuspensionGuard
 *
 * Polls GET /api/auth/me every 30s to detect if the current user's account
 * has been suspended while they're actively using the app.
 *
 * When suspension is detected, it shows a full-screen overlay BEFORE
 * clearing auth state and redirecting — so the user sees a clear message.
 *
 * Mount this hook in MainLayout (or any layout wrapping authenticated pages).
 */
export function useSuspensionGuard() {
  const [isSuspended, setIsSuspended] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    let timeoutId;

    const checkStatus = async () => {
      try {
        const { data } = await api.get('/api/auth/me');
        if (data.status === 'suspended') {
          setIsSuspended(true);
        }
      } catch {
        // If it's a 403 ACCOUNT_SUSPENDED, the axios interceptor will
        // handle it. For other errors (network, etc.) silently ignore.
      }
    };

    // First check after a short delay (don't block initial render)
    timeoutId = setTimeout(() => {
      checkStatus();
      // Then poll on interval
      timeoutId = setInterval(checkStatus, POLL_INTERVAL);
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(timeoutId);
    };
  }, [accessToken]);

  return isSuspended;
}

/**
 * SuspensionOverlay
 *
 * Full-screen overlay that appears when suspension is detected mid-session.
 * Shows a countdown before auto-redirecting to /suspended.
 */
export function SuspensionOverlay() {
  const logout = useAuthStore((s) => s.logout);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          logout();
          window.location.href = '/suspended';
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [logout]);

  const handleLogoutNow = () => {
    logout();
    window.location.href = '/suspended';
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-base-100/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-base-200 border border-neutral-light rounded-xl p-8 sm:p-10 text-center shadow-lg">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Ban size={32} className="text-error" />
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-error mb-3">
          Account Suspended
        </h1>

        {/* Body */}
        <p className="text-sm sm:text-base text-base-content/70 leading-relaxed mb-4">
          Your access to{' '}
          <strong className="text-base-content">DentStory</strong> has been
          suspended by an administrator. You will be redirected shortly.
        </p>

        {/* Countdown */}
        <p className="text-xs text-base-content/50 mb-6">
          Redirecting in{' '}
          <span className="font-bold text-error">{countdown}</span> second
          {countdown !== 1 ? 's' : ''}…
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://wa.me/2001019876800?text=Hello%2C%20my%20DentStory%20account%20has%20been%20suspended.%20Please%20help."
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Mail size={16} />
            Contact Support
          </a>
          <button
            onClick={handleLogoutNow}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-neutral-light text-base-content/70 text-sm font-semibold hover:bg-base-100 transition-colors"
          >
            <LogOut size={16} />
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
}
