import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { DollarSign, TrendingUp, Building2, Calendar } from 'lucide-react';
import { useEarningsHistory } from '../hooks/useAnalytics';
import { CardSkeleton } from '../components/Skeleton';
import Card from '../components/Card';

const COLORS = ['#0EA5E9', '#14B8A6', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-base-200 rounded-lg border border-neutral-light px-4 py-3">
      <p className="text-sm font-semibold text-base-content">{payload[0].payload.month}</p>
      <p className="text-sm text-primary font-bold">
        {payload[0].value.toLocaleString()} EGP
      </p>
      <p className="text-xs text-base-content/50">{payload[0].payload.sessions} sessions</p>
    </div>
  );
};

const ClinicTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-base-200 rounded-lg border border-neutral-light px-4 py-3">
      <p className="text-sm font-semibold text-base-content">{payload[0].payload.clinicName}</p>
      <p className="text-sm text-primary font-bold">
        {payload[0].value.toLocaleString()} EGP
      </p>
      <p className="text-xs text-base-content/50">{payload[0].payload.sessions} sessions</p>
    </div>
  );
};

export default function AnalyticsPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const { data, isLoading, isFetching } = useEarningsHistory(selectedYear, selectedMonth);

  const yearlyTrend = data?.yearlyTrend || [];
  const monthlyBreakdown = data?.monthlyBreakdown || [];
  const summary = data?.summary || {};

  // Generate year options (current year ± 5 years)
  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  }, [currentYear]);

  const monthLabel = MONTH_NAMES[selectedMonth - 1];
  const totalMonthlyEarnings = monthlyBreakdown.reduce((sum, c) => sum + c.earnings, 0);
  const totalMonthlySessions = monthlyBreakdown.reduce((sum, c) => sum + c.sessions, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Earnings Analytics</h1>
          <p className="text-base-content/70 text-sm mt-0.5">
            Track your financial performance over time.
          </p>
        </div>
      </div>

      {/* Time Selectors - LinkedIn Flat Style */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Year Selector */}
        <div className="flex-1 sm:flex-none">
          <label className="label text-xs font-semibold text-base-content/70 uppercase tracking-wider mb-2">
            <Calendar size={14} className="mr-1" />
            Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="select select-sm select-bordered w-full sm:w-40 bg-base-200 border-neutral-light rounded-lg font-medium"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Month Selector */}
        <div className="flex-1 sm:flex-none">
          <label className="label text-xs font-semibold text-base-content/70 uppercase tracking-wider mb-2">
            <Calendar size={14} className="mr-1" />
            Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            className="select select-sm select-bordered w-full sm:w-40 bg-base-200 border-neutral-light rounded-lg font-medium"
          >
            {MONTH_NAMES.map((month, idx) => (
              <option key={idx} value={idx + 1}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : (
        <>
          {/* Summary Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            animate={{ opacity: isFetching ? 0.6 : 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* Card 1 - Annual Earnings */}
            <Card className="hover:border-primary/30 transition-colors">
              <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-3">
                <DollarSign size={22} className="text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-base-content">
                {summary.totalYearlyEarnings?.toLocaleString()} EGP
              </p>
              <p className="text-sm text-base-content/70 mt-1">Total Earnings {selectedYear}</p>
            </Card>

            {/* Card 2 - Annual Sessions */}
            <Card className="hover:border-primary/30 transition-colors">
              <div className="w-11 h-11 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center mb-3">
                <TrendingUp size={22} className="text-sky-500" />
              </div>
              <p className="text-3xl font-bold text-base-content">{summary.totalYearlySessions}</p>
              <p className="text-sm text-base-content/70 mt-1">Sessions {selectedYear}</p>
            </Card>

            {/* Card 3 - Monthly Earnings */}
            <Card className="hover:border-primary/30 transition-colors">
              <div className="w-11 h-11 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center mb-3">
                <Building2 size={22} className="text-violet-500" />
              </div>
              <p className="text-3xl font-bold text-base-content">
                {summary.totalMonthlyEarnings?.toLocaleString()} EGP
              </p>
              <p className="text-sm text-base-content/70 mt-1">{monthLabel} Earnings</p>
            </Card>
          </motion.div>

          {/* Yearly Bar Chart */}
          <Card>
            <h2 className="text-lg font-bold text-base-content mb-4">
              Monthly Breakdown - {selectedYear}
            </h2>
            {yearlyTrend.length === 0 ? (
              <div className="text-center py-12 text-base-content/50">
                No earnings data available for {selectedYear}.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={yearlyTrend}
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0DFDC" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#999' }}
                    stroke="#E0DFDC"
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#999' }}
                    stroke="#E0DFDC"
                    label={{ value: 'Earnings (EGP)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200, 200, 200, 0.1)' }} />
                  <Bar dataKey="earnings" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Monthly Breakdown - Clinic Details */}
          {monthlyBreakdown.length > 0 && (
            <Card>
              <h2 className="text-lg font-bold text-base-content mb-4">
                {monthLabel} {selectedYear} - Breakdown by Clinic
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {monthlyBreakdown.map((clinic, idx) => (
                  <motion.div
                    key={clinic.clinicId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-lg bg-base-100/50 border border-neutral-light/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-base-content">{clinic.clinicName}</h3>
                        <p className="text-xs text-base-content/50 mt-1">
                          {clinic.sessions} session{clinic.sessions !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full shrink-0 mt-1"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                    </div>
                    <div className="border-t border-neutral-light pt-3">
                      <p className="text-2xl font-bold text-primary">
                        {clinic.earnings.toLocaleString()} EGP
                      </p>
                      <p className="text-xs text-base-content/50 mt-1">
                        {((clinic.earnings / totalMonthlyEarnings) * 100).toFixed(1)}% of month
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-base-content flex justify-between">
                  <span className="font-semibold">Total {monthLabel} {selectedYear}:</span>
                  <span className="text-lg font-bold text-primary">
                    {totalMonthlyEarnings.toLocaleString()} EGP
                  </span>
                </p>
              </div>
            </Card>
          )}

          {monthlyBreakdown.length === 0 && selectedMonth && (
            <Card className="text-center py-12 text-base-content/50">
              No earnings recorded for {monthLabel} {selectedYear}.
            </Card>
          )}
        </>
      )}
    </div>
  );
}
