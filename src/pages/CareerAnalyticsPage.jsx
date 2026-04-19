import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { 
  TrendingUp, 
  Lightbulb, 
  Stethoscope, 
  Award, 
  Target,
  CheckCircle2,
  PieChart as PieIcon,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useTreatmentDistribution } from '../hooks/useAnalytics';
import { CardSkeleton } from '../components/Skeleton';
import Card from '../components/Card';


const COLORS = [
  '#0EA5E9', // Sky
  '#14B8A6', // Teal
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EF4444', // Red
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F97316', // Orange
];

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
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all ${colorClass.replace('text-', 'bg-').replace('500', '500/10').replace('600', '600/10')}`}>
          <Icon size={24} className={colorClass} />
        </div>
        <h3 className="text-sm font-bold text-base-content/50 uppercase tracking-widest mb-1">{label}</h3>
        <p className="text-4xl font-black text-base-content tracking-tight">
          {value}
        </p>
        <p className="text-[10px] uppercase font-black text-base-content/30 mt-2 tracking-widest">
          {subtext}
        </p>
      </div>
    </Card>
  </motion.div>
);

const ModernTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-base-100/95 backdrop-blur-md p-4 rounded-2xl border border-neutral-light/50 shadow-xl ring-1 ring-black/5">
      <p className="text-[10px] uppercase font-black text-base-content/40 tracking-[0.2em] mb-2">{payload[0].payload.category}</p>
      <div className="space-y-1">
        <p className="text-lg font-black text-primary flex items-center gap-2">
          {payload[0].value} <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Sessions</span>
        </p>
        <p className="text-[11px] font-bold text-base-content/60 flex items-center gap-1.5 mt-1 pt-1 border-t border-neutral-light/30">
          <CheckCircle2 size={12} className="text-success" />
          {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}% Weight
        </p>
      </div>
    </div>
  );
};

export default function CareerAnalyticsPage() {
  const currentYear = new Date().getFullYear();
  const [filterType, setFilterType] = useState('all');
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  }, [currentYear]);

  // Compute filters for the hook
  const filters = useMemo(() => {
    const f = { filterType };
    if (filterType === 'yearly') f.year = selectedYear;
    if (filterType === 'custom') {
      f.startDate = startDate;
      f.endDate = endDate;
    }
    return f;
  }, [filterType, selectedYear, startDate, endDate]);

  const { data: treatmentData, isLoading, isFetching } = useTreatmentDistribution(filters);

  const treatments = treatmentData?.treatmentDistribution || [];
  const totalTreatments = treatments.reduce((s, t) => s + t.count, 0);

  const topTreatment = treatments.length > 0
    ? treatments.reduce((max, t) => (t.count > max.count ? t : max))
    : null;
  const topPercentage = topTreatment && totalTreatments > 0
    ? Math.round((topTreatment.count / totalTreatments) * 100)
    : 0;

  // Derived labels for UI
  const getPeriodLabel = () => {
    if (filterType === 'all') return 'All-Time Professional History';
    if (filterType === 'custom') return `Custom Range: ${startDate || '...'} to ${endDate || '...'}`;
    return `Annual Review: ${selectedYear}`;
  };

  return (
    <div className="max-w-full overflow-x-hidden space-y-8 animate-in fade-in duration-500">
      {/* Premium Header & Filters Container */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-neutral-light/30">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-sky-500 rounded-full transition-all duration-300" />
            <h1 className="text-3xl sm:text-4xl font-black text-base-content tracking-tight uppercase italic transition-all duration-300">
              Career Portfolio
            </h1>
          </div>
          <p className="text-base-content/50 text-sm font-medium ml-5 flex items-center gap-2">
            Benchmarked against: <span className="text-primary font-bold">{getPeriodLabel()}</span>
            {isFetching && <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-primary" />}
          </p>
        </div>

        {/* Unified Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-base-200/50 p-2 rounded-2xl border border-neutral-light/50 backdrop-blur-sm self-start">
          <div className="px-3 py-1.5 flex items-center gap-2 text-[10px] font-black uppercase text-base-content/40 tracking-widest sm:border-r border-neutral-light/30">
            <Filter size={12} />
            Period
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="select select-sm select-ghost font-black text-xs uppercase tracking-widest focus:ring-0 cursor-pointer bg-base-100/50"
            >
              <option value="all">Full Career</option>
              <option value="yearly">Annual View</option>
              <option value="custom">Custom Range</option>
            </select>

            {filterType === 'yearly' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="select select-sm bg-transparent border-0 font-black text-xs uppercase tracking-widest focus:ring-0 cursor-pointer animate-in slide-in-from-right-4 duration-300"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
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
        <CardSkeleton count={2} />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <StatCard 
              icon={Stethoscope}
              label={filterType === 'all' ? 'Life-Time Volume' : 'Period Case Volume'}
              value={totalTreatments}
              subtext="Total Clinical Sessions"
              colorClass="text-emerald-500"
              animationDelay={0}
            />
            <StatCard 
              icon={Award}
              label={filterType === 'all' ? 'Expertise Index' : 'Active Domains'}
              value={treatments.length}
              subtext="Unique Treatment Domains"
              colorClass="text-sky-500"
              animationDelay={0.1}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 border-neutral-light/50 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <PieIcon size={20} />
                    </div>
                    <h2 className="text-lg font-black text-base-content uppercase tracking-widest">
                      Expertise Distribution
                    </h2>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-sky-50 dark:bg-sky-900/20 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Target size={12} />
                    Range Indexed
                  </div>
                </div>

                {treatments.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-24 text-base-content/20 italic">
                    <p>No treatments indexed for this period</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col lg:flex-row items-center gap-8">
                    <div className="h-[320px] w-full lg:w-1/2 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={treatments.map((t) => ({
                              ...t,
                              total: totalTreatments,
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="count"
                            stroke="none"
                            animationBegin={300}
                            animationDuration={1000}
                          >
                            {treatments.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={6} />
                            ))}
                          </Pie>
                          <Tooltip content={<ModernTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-[10px] font-black uppercase text-base-content/30 tracking-[0.3em]">Cases</p>
                        <p className="text-2xl font-black text-base-content leading-none mt-1">
                          {totalTreatments}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                          <Lightbulb size={64} className="text-primary" />
                        </div>
                        <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Award size={18} />
                          Expertise Spotlight
                        </h3>
                        {topTreatment ? (
                          <div className="space-y-2">
                            <p className="text-2xl font-black text-base-content uppercase leading-tight italic">
                              {topTreatment.category}
                            </p>
                            <p className="text-sm text-base-content/60 font-medium leading-relaxed">
                              Representing <span className="text-primary font-black">{topPercentage}%</span> of clinical volume in this range.
                            </p>
                            <div className="pt-2">
                              <button className="text-[10px] font-black uppercase text-primary flex items-center gap-1 hover:gap-2 transition-all">
                                Analyze Domain Benchmarks <ChevronRight size={12} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-base-content/50 italic font-medium">Select a period with activity to identify expertise.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6 border-neutral-light/50 h-full">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Target size={20} />
                  </div>
                  <h2 className="text-lg font-black text-base-content uppercase tracking-widest">
                    Domain Index
                  </h2>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {treatments.map((t, i) => (
                    <div key={t.category} className="group flex items-center justify-between p-3 rounded-xl transition-all hover:bg-base-200/50 border border-transparent hover:border-neutral-light/30">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-base-content truncate max-w-[140px] uppercase tracking-wide italic">{t.category}</p>
                          <p className="text-[9px] font-bold text-base-content/30 uppercase tracking-tighter">
                            {((t.count / totalTreatments) * 100).toFixed(1)}% Weight
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-black text-base-content">{t.count}</p>
                        <p className="text-[9px] font-black text-primary opacity-60 uppercase tracking-tighter">Cases</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
