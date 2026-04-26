import { Ban, Mail, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function SuspendedPage() {
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-4">
      <div className="w-full max-w-md bg-base-200 border border-neutral-light rounded-xl p-8 sm:p-10 text-center">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
          <Ban size={32} className="text-error" />
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-error mb-3">
          Account Suspended
        </h1>

        {/* Body */}
        <p className="text-sm sm:text-base text-base-content/70 leading-relaxed mb-8">
          Your access to <strong className="text-base-content">DentStory</strong> has
          been temporarily suspended. This might be due to a pending payment or a
          violation of our terms. Please contact support to resolve this issue.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Contact Support — Primary */}
          <a
            href="https://wa.me/201019876800?text=Hello%2C%20my%20DentStory%20account%20has%20been%20suspended.%20Please%20help."
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Mail size={16} />
            Contact Support
          </a>

          {/* Logout — Secondary/Outline */}
          <button
            onClick={handleLogout}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-neutral-light text-base-content/70 text-sm font-semibold hover:bg-base-100 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
