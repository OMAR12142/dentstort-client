import { useState } from 'react';
import Modal from './Modal';
import { Phone, AlertCircle } from 'lucide-react';
import { useUpdateProfile } from '../hooks/useAuth';

export default function CompleteProfileModal({ open, onClose }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const { mutate, isPending } = useUpdateProfile();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }
    
    if (phone.trim().length < 8) {
      setError('Please enter a valid phone number');
      return;
    }

    mutate(
      { phone: phone.trim() },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          setError(err.response?.data?.message || 'Failed to update profile');
        }
      }
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Complete Your Profile" size="sm">
      <div className="p-1">
        <p className="text-sm text-base-content/70 mb-4">
          Please add your phone number to complete your registration. This helps us secure your account and improve your experience.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg px-3 py-2 border border-red-200 dark:border-red-800 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-base-content/80 mb-1">
              Phone Number <span className="text-error">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone size={14} className="text-base-content/40" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError('');
                }}
                placeholder="+20 1xx xxx xxxx"
                className="input input-bordered w-full pl-10 rounded-lg bg-base-200 border-neutral-light focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-xs h-10"
                autoFocus
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn bg-primary hover:bg-primary/90 text-white border-0 text-xs shadow-none"
            >
              {isPending ? <span className="loading loading-spinner loading-xs" /> : 'Save Phone Number'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
