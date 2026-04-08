import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Legend,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useTreatmentDistribution } from '../hooks/useAnalytics';
import { CardSkeleton } from '../components/Skeleton';
import Card from '../components/Card';

// Extended color palette to support all 9 treatment categories
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

const CustomTooltipPie = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-base-200 rounded-lg border border-neutral-light px-4 py-3">
      <p className="text-sm font-semibold text-base-content">{payload[0].payload.category}</p>
      <p className="text-sm text-primary font-bold">{payload[0].value} sessions</p>
      <p className="text-xs text-base-content/50">
        {((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%
      </p>
    </div>
  );
};

export default function CareerAnalyticsPage() {
  const { data: treatmentData, isLoading } = useTreatmentDistribution();

  const treatments = treatmentData?.treatmentDistribution || [];
  const totalTreatments = treatments.reduce((s, t) => s + t.count, 0);

  const topTreatment = treatments.length > 0
    ? treatments.reduce((max, t) => (t.count > max.count ? t : max))
    : null;
  const topPercentage = topTreatment
    ? Math.round((topTreatment.count / totalTreatments) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-base-content">Career Analytics</h1>
        <p className="text-base-content/70 text-sm mt-0.5">
          Track your treatment specializations and build your expertise.
        </p>
      </div>

      {isLoading ? (
        <CardSkeleton count={1} />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Card className="hover:border-primary/30 transition-colors">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <TrendingUp size={22} className="text-primary" />
              </div>
              <p className="text-3xl font-bold text-base-content">{totalTreatments}</p>
              <p className="text-sm text-base-content/70 mt-1">Total Sessions</p>
            </Card>

            <Card className="hover:border-primary/30 transition-colors">
              <div className="w-11 h-11 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center mb-3">
                <TrendingUp size={22} className="text-sky-500" />
              </div>
              <p className="text-3xl font-bold text-base-content">{treatments.length}</p>
              <p className="text-sm text-base-content/70 mt-1">Treatment Types</p>
            </Card>
          </div>

          {/* Treatment Distribution Chart */}
          <Card>
            <h2 className="text-lg font-bold text-base-content mb-2">
              Treatment Distribution
            </h2>

            {topTreatment && (
              <div className="mb-4 p-3 rounded-lg bg-primary/10 dark:bg-primary/5 border border-primary/20">
                <p className="text-sm text-base-content">
                  💡 <span className="font-semibold">{topTreatment.category}</span> is your specialty ({topPercentage}% of sessions).
                  Consider furthering your expertise with advanced courses!
                </p>
              </div>
            )}

            {treatments.length === 0 ? (
              <div className="text-center py-12 text-base-content/50">
                No treatment data available yet. Start logging sessions to see your treatment distribution!
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center min-h-[350px]">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart margin={{ top: 5, right: 30, left: 30, bottom: 80 }}>
                      <Pie
                        data={treatments.map((t) => ({
                          ...t,
                          total: totalTreatments,
                        }))}
                        cx="50%"
                        cy="40%"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="category"
                      >
                        {treatments.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltipPie />} />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ paddingTop: '20px', overflow: 'visible' }}
                        formatter={(value, entry) => `${entry.payload.category} (${entry.payload.count})`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </Card>

          {/* Detailed Breakdown */}
          {treatments.length > 0 && (
            <Card>
              <h2 className="text-lg font-bold text-base-content mb-4">Breakdown by Treatment Type ({treatments.length} categories)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {treatments.map((t, i) => (
                  <div key={t.category} className="flex items-center justify-between p-3 rounded-lg bg-base-100/50 border border-neutral-light/50 hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        title={`Color for ${t.category}`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-base-content truncate">{t.category}</p>
                        <p className="text-xs text-base-content/50">
                          {((t.count / totalTreatments) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-primary shrink-0 ml-2">
                      {t.count}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
