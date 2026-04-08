import { motion } from 'framer-motion';
import { Users, CalendarClock, ShieldCheck } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAdminStats } from '../../hooks/useAdmin';
import Card from '../../components/Card';
import { CardSkeleton } from '../../components/Skeleton';

// ── LinkedIn-flat-friendly palette for pie slices ─
const COLORS = [
  '#0A66C2', // primary blue
  '#057642', // success green
  '#F5871E', // warning orange
  '#CC1016', // error red
  '#7C3AED', // violet
  '#0EA5E9', // sky
  '#14B8A6', // teal
  '#EC4899', // pink
  '#F59E0B', // amber
  '#6366F1', // indigo
];

// ── Custom legend to handle long lists with flex-wrap ──
function WrappedLegend({ payload }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4 px-2">
      {payload?.map((entry, i) => (
        <span
          key={i}
          className="flex items-center gap-1.5 text-xs text-base-content/80"
        >
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          {entry.value}
        </span>
      ))}
    </div>
  );
}

// ── Custom tooltip ──
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-base-200 border border-neutral-light rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-base-content">{name}</p>
      <p className="text-base-content/70">
        {value} patient{value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

export default function AdminOverview() {
  const { data: stats, isLoading, isError, error } = useAdminStats();

  // ── Loading skeleton ─────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="skeleton shadow-none border-0 h-7 bg-base-300 rounded-full w-48 mb-2" />
          <div className="skeleton shadow-none border-0 h-4 bg-base-300 rounded-full w-64" />
        </div>
        <CardSkeleton count={2} />
        <div className="bg-base-200 rounded-lg p-6 border border-neutral-light shadow-none">
          <div className="skeleton shadow-none border-0 h-5 bg-base-300 rounded-full w-56 mb-6" />
          <div className="skeleton shadow-none border-0 h-64 bg-base-300 rounded-lg w-full" />
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldCheck size={48} className="text-error mb-4" />
        <h2 className="text-xl font-bold text-base-content mb-2">
          Failed to load stats
        </h2>
        <p className="text-sm text-base-content/60 max-w-md">
          {error?.response?.data?.message || error?.message || 'Something went wrong.'}
        </p>
      </div>
    );
  }

  // ── Map insurance data for Recharts ──────────
  const insuranceData = (stats?.insuranceDistribution || []).map((item) => ({
    name: item.insuranceCompany || item._id || 'Unknown',
    value: item.patientCount || item.count || 0,
  }));

  const kpiCards = [
    {
      label: 'Total Dentists',
      value: stats?.totalDentists ?? 0,
      icon: Users,
      color: 'text-sky-500',
      bg: 'bg-sky-50 dark:bg-sky-500/10',
    },
    {
      label: 'Total Sessions',
      value: stats?.totalSessions ?? 0,
      icon: CalendarClock,
      color: 'text-violet-500',
      bg: 'bg-violet-50 dark:bg-violet-500/10',
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 pb-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-base-content">
          Platform Overview
        </h1>
        <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
          Real-time platform-wide statistics.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Card className="hover:border-primary/40 transition-colors p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${kpi.bg} flex items-center justify-center`}
                  >
                    <Icon size={20} className={kpi.color} />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-base-content">
                  {kpi.value.toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm text-base-content/70 mt-1">
                  {kpi.label}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── Insurance Distribution Chart ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-base-content mb-4 sm:mb-6">
            Insurance Distribution
          </h2>

          {insuranceData.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <ShieldCheck size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No insurance data available yet.</p>
            </div>
          ) : (
            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={insuranceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {insuranceData.map((_, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<WrappedLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
