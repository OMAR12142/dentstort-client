import { useParams, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useDentistProfile } from '../../hooks/useAdmin';
import Card from '../../components/Card';

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
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-primary hover:underline">
          ← Go back
        </button>
      </div>
    );
  }

  const { dentist, stats, patientCount, patients, clinics, recentSessions, earningsByClinic, treatmentBreakdown } = data;

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
          <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
            dentist.status === 'suspended'
              ? 'bg-error/10 text-error'
              : 'bg-success/10 text-success'
          }`}>
            {dentist.status || 'active'}
          </span>
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

      {/* ── Recent Sessions ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-light flex items-center gap-2">
            <CalendarDays size={18} className="text-primary" />
            <h2 className="text-base font-bold text-base-content">Recent Sessions</h2>
            <span className="ml-auto text-xs text-base-content/50">Last 10</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="border-b border-neutral-light bg-base-200/60">
                  <th className="text-xs font-semibold text-base-content/70 uppercase px-4 py-2.5">Date</th>
                  <th className="text-xs font-semibold text-base-content/70 uppercase px-4 py-2.5">Patient</th>
                  <th className="text-xs font-semibold text-base-content/70 uppercase px-4 py-2.5 hidden sm:table-cell">Clinic</th>
                  <th className="text-xs font-semibold text-base-content/70 uppercase px-4 py-2.5 hidden md:table-cell">Category</th>
                  <th className="text-xs font-semibold text-base-content/70 uppercase px-4 py-2.5 text-right">Cost</th>
                  <th className="text-xs font-semibold text-base-content/70 uppercase px-4 py-2.5 text-right">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {recentSessions.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-base-content/50 text-sm">No sessions</td></tr>
                ) : (
                  recentSessions.map((s) => (
                    <tr key={s._id} className="hover:bg-base-100/60 transition-colors">
                      <td className="px-4 py-2.5 text-sm text-base-content whitespace-nowrap">{fmtDate(s.date)}</td>
                      <td className="px-4 py-2.5 text-sm text-base-content font-medium truncate max-w-[120px]">
                        {s.patient_id?.name || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-base-content/70 hidden sm:table-cell truncate max-w-[120px]">
                        {s.clinic_id?.name || '—'}
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(s.treatment_category) ? s.treatment_category : [s.treatment_category].filter(Boolean)).map((cat) => (
                            <span key={cat} className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-right text-base-content font-medium">{fmt(s.total_cost)} EGP</td>
                      <td className="px-4 py-2.5 text-sm text-right text-success">{fmt(s.amount_paid)} EGP</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* ── Patient List ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-light flex items-center gap-2">
            <Users size={18} className="text-primary" />
            <h2 className="text-base font-bold text-base-content">Patients</h2>
            <span className="ml-auto text-xs text-base-content/50">{patientCount} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="border-b border-neutral-light bg-base-200/60">
                  <th className="text-xs font-semibold text-base-content/70 uppercase px-4 py-2.5">Name</th>
                  <th className="text-xs font-semibold text-base-content/70 uppercase px-4 py-2.5 hidden sm:table-cell">Phone</th>
                  <th className="text-xs font-semibold text-base-content/70 uppercase px-4 py-2.5 hidden md:table-cell">Insurance</th>
                  <th className="text-xs font-semibold text-base-content/70 uppercase px-4 py-2.5">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {patients.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-base-content/50 text-sm">No patients</td></tr>
                ) : (
                  patients.slice(0, 20).map((p) => (
                    <tr key={p._id} className="hover:bg-base-100/60 transition-colors">
                      <td className="px-4 py-2.5 text-sm font-medium text-base-content">{p.name}</td>
                      <td className="px-4 py-2.5 text-sm text-base-content/70 hidden sm:table-cell">{p.phone || '—'}</td>
                      <td className="px-4 py-2.5 text-sm text-base-content/70 hidden md:table-cell">{p.insuranceCompany || 'Private'}</td>
                      <td className="px-4 py-2.5 text-sm text-base-content/60 whitespace-nowrap">{fmtDate(p.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {patients.length > 20 && (
              <div className="px-4 py-3 border-t border-neutral-light bg-base-200/40 text-xs text-base-content/60">
                Showing 20 of {patientCount} patients
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
