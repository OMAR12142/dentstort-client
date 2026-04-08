import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  AlertCircle,
  Trophy,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useRevenueStats } from '../../hooks/useAdmin';
import Card from '../../components/Card';

/* ── Helpers ─────────────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat('en-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0);

const KPI = ({ icon: Icon, label, value, sub, color = 'primary' }) => (
  <Card className="p-5">
    <div className="flex items-center gap-3 mb-2">
      <div
        className={`w-10 h-10 rounded-lg bg-${color}/10 flex items-center justify-center`}
      >
        <Icon size={20} className={`text-${color}`} />
      </div>
      <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
        {label}
      </span>
    </div>
    <p className="text-2xl font-bold text-base-content">{value}</p>
    {sub && <p className="text-xs text-base-content/50 mt-1">{sub}</p>}
  </Card>
);

/* ── Custom Tooltip ──────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-base-200 border border-neutral-light rounded-lg p-3 shadow-md text-xs">
      <p className="font-semibold text-base-content mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {fmt(entry.value)} EGP
        </p>
      ))}
    </div>
  );
};

/* ── Page ─────────────────────────────────────── */
export default function AdminRevenue() {
  const { data, isLoading, isError, error } = useRevenueStats();

  if (isLoading) {
    return (
      <div className="space-y-5 pb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-base-content">
            Revenue Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
            Loading platform financials…
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-5 animate-pulse">
              <div className="h-4 bg-base-100 rounded w-24 mb-3" />
              <div className="h-8 bg-base-100 rounded w-32" />
            </Card>
          ))}
        </div>
        <Card className="p-6 animate-pulse">
          <div className="h-64 bg-base-100 rounded" />
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={48} className="text-error mb-4" />
        <h2 className="text-xl font-bold text-base-content mb-2">
          Failed to load revenue data
        </h2>
        <p className="text-sm text-base-content/60 max-w-md">
          {error?.response?.data?.message || error?.message || 'Something went wrong.'}
        </p>
      </div>
    );
  }

  const { global, monthlyRevenue, topDentists } = data;

  return (
    <div className="space-y-5 sm:space-y-6 pb-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-base-content">
          Revenue Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
          Platform-wide financial overview across all dentists.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <KPI
          icon={DollarSign}
          label="Total Revenue"
          value={`${fmt(global.totalRevenue)} EGP`}
          sub="Across all sessions"
          color="primary"
        />
        <KPI
          icon={TrendingUp}
          label="Total Collected"
          value={`${fmt(global.totalPaid)} EGP`}
          sub="Payments received"
          color="success"
        />
        <KPI
          icon={Wallet}
          label="Dentist Cuts"
          value={`${fmt(global.totalDentistCuts)} EGP`}
          sub="Paid to dentists"
          color="info"
        />
        <KPI
          icon={AlertCircle}
          label="Outstanding"
          value={`${fmt(global.totalOutstanding)} EGP`}
          sub="Remaining balances"
          color="warning"
        />
      </motion.div>

      {/* ── Monthly Revenue Chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-primary" />
            <h2 className="text-base font-bold text-base-content">
              Monthly Revenue (Last 12 Months)
            </h2>
          </div>
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyRevenue}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-base-content, #333)"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'var(--color-base-content, #666)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--color-base-content, #666)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#0A66C2"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="dentistCuts"
                  name="Dentist Cuts"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* ── Top Earning Dentists Leaderboard ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-light flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" />
            <h2 className="text-base font-bold text-base-content">
              Top Earning Dentists
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="border-b border-neutral-light bg-base-200/60">
                  <th className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-5 py-3 w-12">
                    #
                  </th>
                  <th className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-4 py-3">
                    Dentist
                  </th>
                  <th className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-4 py-3 text-right">
                    Revenue
                  </th>
                  <th className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-4 py-3 text-right hidden sm:table-cell">
                    Dentist Cut
                  </th>
                  <th className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-4 py-3 text-center hidden sm:table-cell">
                    Sessions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-light">
                {topDentists.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-base-content/50 text-sm">
                      No revenue data yet
                    </td>
                  </tr>
                ) : (
                  topDentists.map((d, idx) => (
                    <motion.tr
                      key={d.dentistId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-base-100/60 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                            idx === 0
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                              : idx === 1
                              ? 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400'
                              : idx === 2
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
                              : 'bg-base-100 text-base-content/50'
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                            {d.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-base-content truncate">
                              {d.name}
                            </p>
                            <p className="text-xs text-base-content/50 truncate">
                              {d.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-base-content">
                        {fmt(d.totalRevenue)} EGP
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-success hidden sm:table-cell">
                        {fmt(d.totalDentistCut)} EGP
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                          {d.sessionCount}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
