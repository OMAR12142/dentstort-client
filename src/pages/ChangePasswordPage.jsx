import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUpdatePassword } from '../hooks/useAuth';
import Card from '../components/Card';
import Button from '../components/Button';
import SEO from '../components/common/SEO';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const { mutate: updatePassword, isPending: isUpdatingPassword } = useUpdatePassword();

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) { setPasswordError('New passwords do not match'); return; }
    if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters'); return; }
    updatePassword({ currentPassword, newPassword }, {
      onSuccess: () => {
        setPasswordSuccess(true);
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        setTimeout(() => navigate('/profile'), 1500);
      },
      onError: (err) => setPasswordError(err?.response?.data?.message || 'Failed to update'),
    });
  };

  return (
    <div className="space-y-7 sm:space-y-6">
      <SEO title="Change Password" noindex />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="p-2 rounded-lg hover:bg-base-200 transition-colors text-base-content/60 hover:text-base-content"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-base-content tracking-tight">Change Password</h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Update your password to keep your account secure.
          </p>
        </div>
      </div>

      {/* Password Form */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-0 overflow-hidden max-w-7xl">
          <div className="px-5 py-4 border-b border-neutral-light flex items-center gap-2 bg-base-200/30">
            <Lock size={18} className="text-warning" />
            <h2 className="text-base font-bold text-base-content">Security & Password</h2>
          </div>

          <form onSubmit={handleUpdatePassword} className="p-5 sm:p-6 space-y-4">
            <AnimatePresence>
              {passwordError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg bg-error/10 border border-error/20 flex items-center gap-2 text-error text-sm overflow-hidden"
                >
                  <AlertCircle size={16} className="shrink-0" />
                  {passwordError}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold text-sm">Current Password</span>
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input input-bordered w-full bg-base-100 focus:outline-none focus:border-warning focus:ring-1 focus:ring-warning transition-all shadow-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-sm">New Password</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input input-bordered w-full bg-base-100 focus:outline-none focus:border-warning focus:ring-1 focus:ring-warning transition-all shadow-sm"
                  required
                />
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-semibold text-sm">Confirm New Password</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input input-bordered w-full bg-base-100 focus:outline-none focus:border-warning focus:ring-1 focus:ring-warning transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Button type="submit" variant="warning" loading={isUpdatingPassword} className="px-6 text-white bg-primary hover:bg-primary/90 transition-all  ">
                Update Password
              </Button>
              <AnimatePresence>
                {passwordSuccess && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-success text-sm font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 size={15} /> Updated!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
