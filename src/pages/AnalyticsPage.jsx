import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Building2, 
  Calendar, 
  ArrowUpRight, 
  Filter,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import { useEarningsHistory } from '../hooks/useAnalytics';
import { CardSkeleton } from '../components/Skeleton';
import Card from '../components/Card';

const COLORS = ['#0EA5E9', '#14B8A6', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const StatCard = ({ icon: Icon, label, value, subtext, colorClass, animationDelay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: animationDelay }}
  >
    <Card className="relative overflow-hidden group hover:shadow-md transition-all border-neutral-light/50">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity ${colorClass}`}>
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ring-8 ring-transparent group-hover:ring-current/5 transition-all ${colorClass.replace('text-', 'bg-').replace('500', '500/10')}`}>
          <Icon size={24} className={colorClass} />
        </div>
        <h3 className="text-sm font-bold text-base-content/50 uppercase tracking-widest mb-1">{label}</h3>
        <p className="text-3xl font-black text-base-content tracking-tight">
          {value}
        </p>
        <p className="text-xs text-base-content/40 mt-2 font-medium flex items-center gap-1">
          {subtext}
        </p>
      </div>
    </Card>
  </motion.div>
);

const ModernTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-base-100/95 backdrop-blur-md p-4 rounded-2xl border border-neutral-light/50 shadow-xl ring-1 ring-black/5">
      <p className="text-[10px] uppercase font-black text-base-content/40 tracking-[0.2em] mb-2">{label || payload[0].payload.clinicName}</p>
      <div className="space-y-1">
        <p className="text-lg font-black text-primary flex items-center gap-2">
          {payload[0].value.toLocaleString()} <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">EGP</span>
        </p>
        <p className="text-[11px] font-bold text-base-content/60 flex items-center gap-1.5 mt-1 pt-1 border-t border-neutral-light/30">
          <CheckCircle2 size={12} className="text-success" />
          {payload[0].payload.sessions} Sessions recorded
        </p>
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [filterType, setFilterType] = useState('yearly');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Compute combined filters for the hook
  const filters = useMemo(() => {
    const f = { filterType };
    if (filterType === 'yearly') {
      f.year = selectedYear;
      if (selectedMonth) f.month = selectedMonth;
    } else if (filterType === 'custom') {
      f.startDate = startDate;
      f.endDate = endDate;
    }
    return f;
  }, [filterType, selectedYear, selectedMonth, startDate, endDate]);

  const { data, isLoading, isFetching } = useEarningsHistory(filters);

  const yearlyTrend = data?.yearlyTrend || [];
  const monthlyBreakdown = data?.monthlyBreakdown || [];
  const summary = data?.summary || {};

  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  }, [currentYear]);

  const monthLabel = MONTH_NAMES[selectedMonth - 1];
  const totalMonthlyEarnings = monthlyBreakdown.reduce((sum, c) => sum + c.earnings, 0);

  const pieData = useMemo(() => {
    return monthlyBreakdown.map((clinic, idx) => ({
      name: clinic.clinicName,
      value: clinic.earnings,
      sessions: clinic.sessions,
      color: COLORS[idx % COLORS.length]
    }));
  }, [monthlyBreakdown]);

  // Derived labels for UI
  const getPeriodLabel = () => {
    if (filterType === 'all') return 'All-Time History';
    if (filterType === 'custom') return `${startDate || '...'} to ${endDate || '...'}`;
    return `${monthLabel} ${selectedYear}`;
  };

  return (
    <div className="max-w-full overflow-x-hidden space-y-8 animate-in fade-in duration-500">
      {/* Premium Header & Dynamic Subtitle */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-neutral-light/30">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full transition-all duration-300" />
            <h1 className="text-3xl sm:text-4xl font-black text-base-content tracking-tight uppercase italic transition-all duration-300">
              Earnings Overview
            </h1>
          </div>
          <p className="text-base-content/50 text-sm font-medium ml-5 flex items-center gap-2">
            Viewing: <span className="text-primary font-bold">{getPeriodLabel()}</span>
            {isFetching && <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-primary" />}
          </p>
        </div>

        {/* Multi-stage Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-base-200/50 p-2 rounded-2xl border border-neutral-light/50 backdrop-blur-sm">
          <div className="px-3 py-1.5 flex items-center gap-2 text-[10px] font-black uppercase text-base-content/40 tracking-widest sm:border-r border-neutral-light/30">
            <Filter size={12} />
            Range
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            {/* Primary Filter Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="select select-sm select-ghost font-black text-xs uppercase tracking-widest focus:ring-0 cursor-pointer bg-base-100/50"
            >
              <option value="yearly">Fixed Period</option>
              <option value="all">All-Time</option>
              <option value="custom">Custom Range</option>
            </select>

            {/* Contextual Secondary Controls */}
            {filterType === 'yearly' && (
              <div className="flex gap-1 animate-in slide-in-from-right-4 duration-300">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  className="select select-sm bg-transparent border-0 font-black text-xs uppercase tracking-widest focus:ring-0 cursor-pointer"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                  className="select select-sm bg-transparent border-0 font-black text-xs uppercase tracking-widest focus:ring-0 cursor-pointer"
                >
                  {MONTH_NAMES.map((month, idx) => (
                    <option key={idx} value={idx + 1}>{month}</option>
                  ))}
                </select>
              </div>
            )}

            {filterType === 'custom' && (
              <div className="flex gap-2 items-center animate-in slide-in-from-right-4 duration-300">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input input-xs bg-base-100 border-neutral-light/30 font-bold uppercase text-[9px] w-28" 
                />
                <span className="text-[10px] font-black opacity-30 text-base-content">to</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input input-xs bg-base-100 border-neutral-light/30 font-bold uppercase text-[9px] w-28" 
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : (
        <div className="space-y-8">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard 
              icon={DollarSign}
              label={filterType === 'yearly' ? `Gross Earnings ${selectedYear}` : 'Cumulative Payout'}
              value={`${summary.totalYearlyEarnings?.toLocaleString()} EGP`}
              subtext="Aggregated clinical revenue"
              colorClass="text-emerald-500"
              animationDelay={0}
            />
            <StatCard 
              icon={TrendingUp}
              label={filterType === 'yearly' ? `Total Sessions ${selectedYear}` : 'Cumulative Volume'}
              value={summary.totalYearlySessions}
              subtext="Documented patient sessions"
              colorClass="text-sky-500"
              animationDelay={0.1}
            />
            <StatCard 
              icon={Building2}
              label={filterType === 'yearly' ? `${monthLabel} Payout` : 'Period Breakpoint'}
              value={`${summary.totalMonthlyEarnings?.toLocaleString()} EGP`}
              subtext="Focus range earnings"
              colorClass="text-violet-500"
              animationDelay={0.2}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Timeline Trend Chart */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 border-neutral-light/50 h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <BarChart3 size={20} />
                    </div>
                    <h2 className="text-lg font-black text-base-content uppercase tracking-widest">
                      Fiscal Index <span className="opacity-30">Trend</span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <ArrowUpRight size={12} />
                    Range Metrics
                  </div>
                </div>

                {yearlyTrend.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-base-content/20 italic">
                    <PieIcon size={48} className="mb-4 opacity-5" />
                    <p>No activity detected in this period</p>
                  </div>
                ) : (
                  <div className="h-[380px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={yearlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.05} vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b', textTransform: 'uppercase' }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                          tickFormatter={(val) => `${val / 1000}k`}
                        />
                        <Tooltip content={<ModernTooltip />} cursor={{ stroke: '#0EA5E9', strokeWidth: 2, strokeDasharray: '5 5' }} />
                        <Area 
                          type="monotone" 
                          dataKey="earnings" 
                          stroke="#0EA5E9" 
                          strokeWidth={4} 
                          fillOpacity={1} 
                          fill="url(#colorEarnings)" 
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </div>

            {/* Monthly Clinic Distribution Donut */}
            <div className="lg:col-span-1">
              <Card className="p-6 border-neutral-light/50 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                    <PieIcon size={20} />
                  </div>
                  <h2 className="text-lg font-black text-base-content uppercase tracking-widest">
                    Source Share
                  </h2>
                </div>

                {monthlyBreakdown.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-base-content/20 italic text-center px-8">
                    <p>Insufficient clinical data for breakdown in this period</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <div className="h-[240px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                            animationBegin={300}
                            animationDuration={1000}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={4} />
                            ))}
                          </Pie>
                          <Tooltip content={<ModernTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-[10px] font-black uppercase text-base-content/30 tracking-[0.3em]">Range Total</p>
                        <p className="text-xl font-black text-base-content leading-none mt-1">
                          {summary.totalMonthlyEarnings >= 1000 ? `${(summary.totalMonthlyEarnings / 1000).toFixed(1)}k` : summary.totalMonthlyEarnings}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 space-y-4">
                      <p className="text-[10px] font-black uppercase text-base-content/40 tracking-[0.2em] border-b border-neutral-light/30 pb-2">Clinical Distribution Index</p>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {pieData.map((clinic, idx) => (
                          <div key={idx} className="group flex items-center justify-between p-2 rounded-xl transition-all hover:bg-base-200/50">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: clinic.color }} />
                              <div className="min-w-0">
                                <p className="text-xs font-black text-base-content truncate max-w-[120px] uppercase tracking-wide">{clinic.name}</p>
                                <p className="text-[9px] font-bold text-base-content/30 uppercase tracking-tighter">{clinic.sessions} Sessions</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[11px] font-black text-base-content">{clinic.value.toLocaleString()} <span className="text-[8px] opacity-40">EGP</span></p>
                              <p className="text-[10px] font-black text-primary opacity-60">{((clinic.value / summary.totalMonthlyEarnings) * 100).toFixed(0)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
