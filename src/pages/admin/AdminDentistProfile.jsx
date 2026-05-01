import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  CalendarDays,
  DollarSign,
  Building2,
  Wallet,
  AlertCircle,
  TrendingUp,
  Stethoscope,
  Key,
  Copy,
  Check,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { 
  useDentistProfile, 
  useResetDentistPassword,
  useImpersonateDentist,
  useTogglePortfolioStatus
} from '../../hooks/useAdmin';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import { calculateAge } from '../../utils/dateUtils';

/* ── Helpers ─────────────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat('en-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-EG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const PIE_COLORS = [
  '#0A66C2', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1',
];

const KPI = ({ icon: Icon, label, value, color = 'primary' }) => (
  <Card className="p-4">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg bg-${color}/10 flex items-center justify-center`}>
        <Icon size={18} className={`text-${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-base-content/60 uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-lg font-bold text-base-content truncate">{value}</p>
      </div>
    </div>
  </Card>
);

/* ── Custom Tooltip ──────────────────────────── */
const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-base-200 border border-neutral-light rounded-lg p-3 shadow-md text-xs">
      <p className="font-semibold text-base-content">{d.name}</p>
      <p className="text-base-content/70">{d.value} sessions · {fmt(d.payload.revenue)} EGP</p>
    </div>
  );
};

/* ── Page ─────────────────────────────────────── */
export default function AdminDentistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useDentistProfile(id);
  const { mutate: resetPassword, isPending: isResetting } = useResetDentistPassword();
  const { mutate: impersonate, isPending: isImpersonating } = useImpersonateDentist();
  const { mutate: togglePortfolio, isPending: isTogglingPortfolio } = useTogglePortfolioStatus();
  const setAuth = useAuthStore((s) => s.setAuth);

  // Reset Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [resetError, setResetError] = useState('');

  const initiateReset = () => {
    setTempPassword(null);
    setResetError('');
    setIsModalOpen(true);
  };

  const confirmReset = () => {
    resetPassword(id, {
      onSuccess: (res) => {
        setTempPassword(res.temporaryPassword);
      },
      onError: (err) => {
        setResetError(err?.response?.data?.message || err.message);
      }
    });
  };

  const copyToClipboard = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleShadowAccess = () => {
    impersonate(id, {
      onSuccess: (res) => {
        // Switch session to this user, but flag it as shadow mode
        setAuth(res, res.accessToken, true);
        navigate('/dashboard');
      }
    });
  };

  const handleTogglePortfolio = () => {
    togglePortfolio(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-5 pb-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-base-100 rounded w-20 mb-2" />
              <div className="h-6 bg-base-100 rounded w-28" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={48} className="text-error mb-4" />
        <h2 className="text-xl font-bold text-base-content mb-2">Failed to load profile</h2>
        <p className="text-sm text-base-content/60 max-w-md">
          {error?.response?.data?.message || error?.message || 'Something went wrong.'}
        </p>
        <button onClick={() => navigate(-1)} className="mt-4 flex items-center gap-1 text-sm text-primary hover:underline">
          <ArrowLeft size={16} /> Go back
        </button>
      </div>
    );
  }

  const { dentist, stats, patientCount, clinics, earningsByClinic, treatmentBreakdown, portfolio } = data;

  return (
    <div className="space-y-5 sm:space-y-6 pb-8">
      {/* ── Back + Header ── */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline mb-3"
        >
          <ArrowLeft size={16} /> Back to Dentists
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shrink-0">
            {dentist.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-base-content">{dentist.name}</h1>
            <p className="text-xs sm:text-sm text-base-content/60">{dentist.email} · {dentist.phone || 'No phone'}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {portfolio && (
              <a
                href={`/portfolio/${portfolio.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-ghost gap-2 border-neutral-light"
                title="View how this portfolio looks to the public"
              >
                <ExternalLink size={14} />
                View Portfolio
              </a>
            )}
            <button
              onClick={handleShadowAccess}
              disabled={isImpersonating || dentist.status === 'suspended'}
              className="btn btn-sm btn-primary gap-2"
              title="Access this doctor's dashboard to provide support"
            >
              {isImpersonating ? <span className="loading loading-spinner loading-xs" /> : <Users size={14} />}
              Shadow Access
            </button>
            <button
              onClick={initiateReset}
              disabled={dentist.status === 'suspended'}
              className="btn btn-sm btn-outline border-neutral-light text-base-content/80 hover:bg-warning/10 hover:text-warning hover:border-warning/30"
              title="Force password reset and log out from all devices"
            >
              <Key size={14} />
              Reset Password
            </button>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              dentist.status === 'suspended'
                ? 'bg-error/10 text-error'
                : 'bg-success/10 text-success'
            }`}>
              {dentist.status || 'active'}
            </span>
          </div>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <KPI icon={DollarSign} label="Revenue" value={`${fmt(stats.totalRevenue)} EGP`} color="primary" />
        <KPI icon={TrendingUp} label="Collected" value={`${fmt(stats.totalPaid)} EGP`} color="success" />
        <KPI icon={Wallet} label="Dentist Cut" value={`${fmt(stats.totalDentistCut)} EGP`} color="info" />
        <KPI icon={Users} label="Patients" value={patientCount} color="secondary" />
        <KPI icon={CalendarDays} label="Sessions" value={stats.sessionCount} color="accent" />
      </motion.div>

      {/* ── Portfolio Control ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <Card className="p-5 border-l-4 border-primary">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
                <Briefcase size={18} className="text-primary" />
                Clinical Portfolio Moderation
              </h2>
              <p className="text-sm text-base-content/60">
                Control the visibility of this clinician's public showcase and published cases.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {data.portfolio ? (
                <>
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                    data.portfolio.isSuspended 
                      ? 'bg-error/10 text-error border-error/20' 
                      : data.portfolio.isPublished 
                        ? 'bg-success/10 text-success border-success/20' 
                        : 'bg-base-200 text-base-content/60 border-neutral-light'
                  }`}>
                    {data.portfolio.isSuspended 
                      ? 'SUSPENDED BY ADMIN' 
                      : data.portfolio.isPublished 
                        ? 'PUBLICLY VISIBLE' 
                        : 'IN DRAFT MODE'}
                  </div>
                  <button
                    onClick={handleTogglePortfolio}
                    disabled={isTogglingPortfolio}
                    className={`btn btn-sm ${data.portfolio.isSuspended ? 'btn-success' : 'btn-error'} min-w-[140px]`}
                  >
                    {isTogglingPortfolio ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : data.portfolio.isSuspended ? (
                      'Unsuspend Portfolio'
                    ) : (
                      'Suspend Portfolio'
                    )}
                  </button>
                </>
              ) : (
                <span className="text-xs font-medium text-base-content/40 italic">No portfolio created yet</span>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ── Two-Column: Treatment Breakdown + Clinics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Treatment Category Pie */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope size={18} className="text-primary" />
              <h2 className="text-base font-bold text-base-content">Treatment Categories</h2>
            </div>
            {treatmentBreakdown.length === 0 ? (
              <p className="text-sm text-base-content/50 text-center py-8">No sessions yet</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={treatmentBreakdown}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                    >
                      {treatmentBreakdown.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Earnings by Clinic */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-light flex items-center gap-2">
              <Building2 size={18} className="text-primary" />
              <h2 className="text-base font-bold text-base-content">Earnings by Clinic</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="border-b border-neutral-light bg-base-200/60">
                    <th className="text-xs font-semibold text-base-content/70 uppercase px-4 py-2.5">Clinic</th>
                    <th className="text-xs font-semibold text-base-content/70 uppercase px-4 py-2.5 text-right">Revenue</th>
                    <th className="text-xs font-semibold text-base-content/70 uppercase px-4 py-2.5 text-right">Cut</th>
                    <th className="text-xs font-semibold text-base-content/70 uppercase px-4 py-2.5 text-center">Sessions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-light">
                  {earningsByClinic.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-base-content/50 text-sm">No clinics</td></tr>
                  ) : (
                    earningsByClinic.map((c, i) => (
                      <tr key={i} className="hover:bg-base-100/60 transition-colors">
                        <td className="px-4 py-2.5 text-sm font-medium text-base-content">{c.clinicName}</td>
                        <td className="px-4 py-2.5 text-sm text-right text-base-content">{fmt(c.totalRevenue)} EGP</td>
                        <td className="px-4 py-2.5 text-sm text-right text-success">{fmt(c.totalDentistCut)} EGP</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                            {c.sessionCount}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Reset Password Modal ── */}
      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Reset Password"
        size="md"
      >
        <div className="space-y-4">
          {!tempPassword ? (
            <>
              {resetError && (
                <div className="p-3 rounded-lg bg-error/10 border border-error/20 flex flex-col items-center justify-center gap-2 text-center">
                  <AlertCircle size={24} className="text-error" />
                  <p className="text-sm font-semibold text-error text-balance">{resetError}</p>
                </div>
              )}
              
              <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg">
                <h3 className="font-bold text-warning flex items-center gap-2 mb-2">
                  <AlertCircle size={18} />
                  Warning: Action is irreversible
                </h3>
                <p className="text-sm text-base-content/80 text-balance leading-relaxed">
                  Are you sure you want to force a password reset for <strong>Dr. {dentist.name}</strong>?
                  <br /><br />
                  This action will <strong>immediately log them out</strong> of all their active devices. A new, highly secure temporary password will be generated for them to use upon next login.
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost"
                  disabled={isResetting}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmReset}
                  className="btn btn-error"
                  disabled={isResetting}
                >
                  {isResetting ? <span className="loading loading-spinner loading-sm" /> : 'Yes, Reset Password'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Check className="text-success w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-base-content">Password Reset Successful</h3>
              <p className="text-sm text-base-content/70 text-balance">
                The old password has been invalidated. Please provide the doctor with this new temporary password immediately.
              </p>
              
              <div className="mt-6 flex flex-col items-center gap-3">
                <span className="text-xs uppercase font-bold tracking-widest text-base-content/50">Temporary Password</span>
                <div className="flex z-10 items-center justify-between w-full max-w-sm bg-base-300 border border-neutral-light rounded-lg overflow-hidden group">
                  <code className="text-lg flex-1 px-4 py-3 font-mono text-center tracking-wider font-semibold text-primary">
                    {tempPassword}
                  </code>
                  <button 
                    onClick={copyToClipboard}
                    className={`flex items-center gap-2 px-4 py-4 h-full border-l border-neutral-light transition-colors ${
                      isCopied ? 'bg-success/20 text-success' : 'hover:bg-base-200 text-base-content/70 hover:text-base-content'
                    }`}
                  >
                    {isCopied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                {isCopied && (
                  <p className="text-xs font-semibold text-success animate-fade-in">
                    Copied to clipboard!
                  </p>
                )}
              </div>

              <div className="mt-8">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-primary w-full"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
