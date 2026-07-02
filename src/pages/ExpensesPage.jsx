import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  Plus,
  Filter,
  Trash2,
  X,
  Loader2,
  Package,
  Users,
  Coffee,
  Building2,
  CalendarDays,
  DollarSign,
  TrendingDown,
  AlertCircle,
  ArrowRight,
  Pencil,
  FlaskConical,
  CheckCircle2,
  Wallet,
} from 'lucide-react';
import { useExpenseSummary, useCreateExpense, useUpdateExpense, useDeleteExpense, useExpenses } from '../hooks/useExpenses';
import { useClinics } from '../hooks/useClinics';
import Card from '../components/Card';
import SEO from '../components/common/SEO';

// ════════════════════════════════════════════════
//  CONSTANTS
// ════════════════════════════════════════════════
const CATEGORIES = ['Material', 'Salaries', 'Lab', 'Other'];

const CATEGORY_CONFIG = {
  Material: { icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', badge: 'bg-blue-500/10 text-blue-600' },
  Salaries: { icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', badge: 'bg-emerald-500/10 text-emerald-600' },
  Lab: { icon: FlaskConical, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', badge: 'bg-purple-500/10 text-purple-600' },
  Other: { icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', badge: 'bg-amber-500/10 text-amber-600' },
};

const TIMEFRAME_OPTIONS = [
  { value: 'monthly', label: 'This Month' },
  { value: 'yearly', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

// ════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════
export default function ExpensesPage() {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('monthly');
  const [filterClinic, setFilterClinic] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: clinicsData } = useClinics();
  const clinics = Array.isArray(clinicsData) ? clinicsData : clinicsData?.clinics || [];

  const { data: summary, isLoading: summaryLoading } = useExpenseSummary(timeframe, filterClinic || undefined);
  const { mutate: deleteExpenseFn } = useDeleteExpense();

  // Fetch recent 5 expenses for the quick preview
  const recentFilters = useMemo(() => {
    const f = { page: 1, limit: 5 };
    if (filterClinic) f.clinic_id = filterClinic;
    if (filterCategory) f.category = filterCategory;
    const now = new Date();
    if (timeframe === 'monthly') {
      f.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      f.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (timeframe === 'yearly') {
      f.startDate = `${now.getFullYear()}-01-01`;
      f.endDate = `${now.getFullYear()}-12-31`;
    }
    return f;
  }, [filterClinic, filterCategory, timeframe]);

  const { data: recentData, isLoading: recentLoading } = useExpenses(recentFilters);
  const recentExpenses = recentData?.expenses || [];
  const totalRecords = recentData?.pagination?.totalItems || 0;

  const handleDelete = (id) => {
    deleteExpenseFn(id, { onSuccess: () => setDeleteConfirm(null) });
  };

  const totalExpenses = summary?.totalExpenses || 0;

  return (
    <div className="max-w-full overflow-x-hidden space-y-8 animate-in fade-in duration-500 pb-24 sm:pb-8">
      <SEO title="Expenses | DentStory" />

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-neutral-light/30">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-error rounded-full" />
            <h1 className="text-3xl sm:text-4xl font-black text-base-content tracking-tight uppercase italic">
              Expenses
            </h1>
          </div>
          <p className="text-base-content/50 text-sm font-medium ml-5">
            Track your clinic spending across materials, salaries, and more.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/expenses/records')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-base-200 text-base-content text-sm font-bold hover:bg-base-300 transition-all border border-base-content/10 active:scale-95"
          >
            <Receipt size={18} />
            View All Records
          </button>
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-error text-white text-sm font-bold hover:bg-error/90 transition-all shadow-lg shadow-error/20 active:scale-95"
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-base-200/50 p-2 rounded-2xl border border-slate-200 dark:border-neutral-light/50 shadow-sm">
        <div className="px-3 py-1.5 flex items-center gap-2 text-[10px] font-black uppercase text-base-content/40 tracking-widest sm:border-r border-slate-200 dark:border-neutral-light/30">
          <Filter size={12} />
          Filters
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={timeframe}
            onChange={(e) => { setTimeframe(e.target.value); setPage(1); }}
            className="select select-sm font-black text-xs uppercase tracking-widest focus:ring-0 cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-base-200 dark:hover:bg-base-300 transition-colors border-none"
          >
            {TIMEFRAME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={filterClinic}
            onChange={(e) => { setFilterClinic(e.target.value); setPage(1); }}
            className="select select-sm font-bold text-xs focus:ring-0 cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-base-200 dark:hover:bg-base-300 transition-colors border-none"
          >
            <option value="">All Clinics</option>
            {clinics.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            className="select select-sm font-bold text-xs focus:ring-0 cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-base-200 dark:hover:bg-base-300 transition-colors border-none"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={Wallet}
          label="Total Expenses"
          value={totalExpenses}
          colorClass="text-indigo-500"
          loading={summaryLoading}
          delay={0}
          percentage={100}
        />
        {CATEGORIES.map((cat, i) => {
          const catData = (summary?.byCategory || []).find((c) => c.category === cat);
          const config = CATEGORY_CONFIG[cat];
          const val = catData?.total || 0;
          const percentage = totalExpenses > 0 ? Math.round((val / totalExpenses) * 100) : 0;
          return (
            <SummaryCard
              key={cat}
              icon={config.icon}
              label={cat}
              value={catData?.total || 0}
              colorClass={config.color}
              loading={summaryLoading}
              delay={0.05 * (i + 1)}
            />
          );
        })}
      </div>

      {/* ── Recent Expenses + View All ── */}
      <div className="bg-white dark:bg-base-200 border border-slate-200 dark:border-base-content/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-base-content/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
              <Receipt size={16} className="text-error" />
            </div>
            <h2 className="text-base font-bold text-base-content">Recent Expenses</h2>
          </div>
          {totalRecords > 0 && (
            <span className="text-xs font-bold text-base-content/40">{totalRecords} total</span>
          )}
        </div>

        {recentLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : recentExpenses.length === 0 ? (
          <div className="text-center py-16 px-4 bg-gradient-to-b from-base-200 to-base-100">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 bg-error/20 rounded-full animate-ping opacity-50" />
              <div className="relative w-full h-full rounded-full bg-base-100 shadow-xl border border-base-content/5 flex items-center justify-center">
                <Receipt size={32} className="text-error" />
              </div>
            </div>
            <h3 className="text-lg font-black text-base-content tracking-tight mb-2">Track Your Impact</h3>
            <p className="text-sm font-medium text-base-content/50 max-w-sm mx-auto mb-6 leading-relaxed">
              Log your materials, salaries, and operating costs to unlock accurate profit margins and financial insights.
            </p>
            <button
              onClick={() => setAddModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-error text-white text-sm font-bold hover:bg-error/90 transition-all shadow-lg shadow-error/30 hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Log First Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-base-content/5">
            {recentExpenses.map((exp, index) => {
              const config = CATEGORY_CONFIG[exp.category] || CATEGORY_CONFIG.Other;
              const CatIcon = config.icon;
              return (
                <motion.div
                  key={exp._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-base-100/50 transition-colors group relative"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-error/50 transition-colors" />
                  <div className={`w-9 h-9 rounded-lg ${config.bg} ${config.border} border flex items-center justify-center shrink-0`}>
                    <CatIcon size={16} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${config.badge}`}>
                        {exp.category}
                      </span>
                      {exp.clinic_id?.name && (
                        <span className="text-[10px] font-medium text-base-content/40 flex items-center gap-1">
                          <Building2 size={9} />
                          {exp.clinic_id.name}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-base-content truncate">{exp.description || '—'}</p>
                    <p className="text-[11px] text-base-content/40 font-medium mt-0.5 flex items-center gap-1">
                      <CalendarDays size={10} />
                      {new Date(exp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-error">
                      {exp.amount.toLocaleString()} <span className="text-[10px] font-bold opacity-50">EGP</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => setEditModal(exp)}
                      className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(exp._id)}
                      className="w-7 h-7 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* View All Records Button */}
        {totalRecords > 0 && (
          <button
            onClick={() => navigate('/expenses/records')}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 border-t border-base-content/5 text-sm font-bold text-error hover:bg-error/5 transition-colors group"
          >
            View All {totalRecords} Records
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* ── Add Expense Modal ── */}
      <AnimatePresence>
        {addModal && (
          <ExpenseFormModal
            clinics={clinics}
            onClose={() => setAddModal(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Edit Expense Modal ── */}
      <AnimatePresence>
        {editModal && (
          <ExpenseFormModal
            clinics={clinics}
            expense={editModal}
            onClose={() => setEditModal(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Delete Confirm Modal ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-base-neutral/80 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-base-100 rounded-2xl shadow-xl max-w-sm w-full z-10 border border-neutral-light/50 p-6 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-error" />
              </div>
              <h3 className="font-bold text-lg mb-2">Remove Expense?</h3>
              <p className="text-sm text-base-content/70 mb-6">This expense will be removed from your records and profit calculations.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 rounded-xl font-semibold hover:bg-base-200 transition-colors text-base-content/70">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 rounded-xl bg-error text-white font-semibold hover:bg-error/90 transition-colors">Remove</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* ── Mobile FAB ── */}
      <div className="sm:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setAddModal(true)}
          className="w-14 h-14 rounded-full bg-error text-white shadow-xl shadow-error/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
//  SUMMARY CARD
// ════════════════════════════════════════════════
function SummaryCard({ icon: Icon, label, value, colorClass, loading, delay = 0, percentage = null }) {
  const isTotal = label === "Total Expenses";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-neutral-light/50 hover:border-primary/30 bg-white dark:bg-base-100 shadow-sm">
        <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-300 group-hover:scale-110 transform ${colorClass}`}>
          <Icon size={120} />
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${colorClass.replace('text-', 'bg-').replace(/\d+/, '500/15')}`}>
              <Icon size={24} className={colorClass} />
            </div>
            {percentage !== null && !isTotal && (
              <div className="flex items-center gap-1 bg-base-content/5 px-2 py-1 rounded-lg">
                <span className="text-[10px] font-black text-base-content/60">{percentage}%</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-[11px] font-black text-base-content/50 uppercase tracking-widest mb-1">{label}</h3>
            {loading ? (
              <div className="h-9 w-24 bg-base-200 rounded-lg animate-pulse" />
            ) : (
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-black text-base-content tracking-tighter">
                  {value.toLocaleString()}
                </p>
                <span className="text-xs font-bold text-base-content/40">EGP</span>
              </div>
            )}
          </div>

          {/* Progress Bar for categories */}
          {percentage !== null && !isTotal && !loading && (
            <div className="mt-4 w-full h-1.5 bg-base-content/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
                className={`h-full rounded-full ${colorClass.replace('text-', 'bg-')}`} 
              />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// ════════════════════════════════════════════════
//  ADD / EDIT EXPENSE MODAL
// ════════════════════════════════════════════════
function ExpenseFormModal({ clinics, expense, onClose }) {
  const isEdit = !!expense;
  const { mutate: createFn, isPending: isCreating } = useCreateExpense();
  const { mutate: updateFn, isPending: isUpdating } = useUpdateExpense();
  const isPending = isCreating || isUpdating;

  const [category, setCategory] = useState(expense?.category || '');
  const [amount, setAmount] = useState(expense?.amount || '');
  const [description, setDescription] = useState(expense?.description || '');
  const [clinicId, setClinicId] = useState(expense?.clinic_id?._id || expense?.clinic_id || '');
  const [date, setDate] = useState(
    expense?.date
      ? new Date(expense.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!clinicId) return setError('Please select a clinic');
    if (!category) return setError('Please select a category');
    if (!amount || Number(amount) <= 0) return setError('Please enter a valid amount greater than zero');

    const payload = {
      clinic_id: clinicId,
      category,
      amount: Number(amount),
      description: description.trim(),
      date,
    };

    if (isEdit) {
      updateFn(
        { id: expense._id, data: payload },
        { onSuccess: () => onClose() }
      );
    } else {
      createFn(payload, { onSuccess: () => onClose() });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-base-neutral/80 backdrop-blur-sm cursor-pointer"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative bg-base-100 rounded-2xl shadow-xl max-w-md w-full z-10 border border-neutral-light/50 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-content/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-error/10 flex items-center justify-center">
              <Receipt size={18} className="text-error" />
            </div>
            <h2 className="text-lg font-bold text-base-content">{isEdit ? 'Edit Expense' : 'Add Expense'}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-base-200 transition-colors text-base-content/50">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Clinic */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-base-content flex items-center gap-2">
              <Building2 size={14} className="text-primary" /> Clinic
            </label>
            <select
              value={clinicId}
              onChange={(e) => setClinicId(e.target.value)}
              className="w-full bg-base-200 border border-base-content/10 rounded-xl py-3 px-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="">Select clinic...</option>
              {clinics.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-base-content">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                const CatIcon = config.icon;
                const isSelected = category === cat;
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-bold ${isSelected
                      ? `${config.bg} ${config.border} ${config.color} ring-2 ring-offset-1 ring-offset-base-100 ${config.border.replace('border-', 'ring-')}`
                      : 'border-base-content/10 text-base-content/50 hover:border-base-content/20'
                      }`}
                  >
                    <CatIcon size={20} />
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-base-content flex items-center gap-2">
                <DollarSign size={14} className="text-error" /> Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full bg-base-200 border border-base-content/10 rounded-xl py-3 pl-10 pr-4 text-lg font-black text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-base-content/30">£</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-base-content flex items-center gap-2">
                <CalendarDays size={14} className="text-amber-500" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-base-200 border border-base-content/10 rounded-xl py-3 px-4 text-sm font-medium text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all h-[52px]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-base-content">Description <span className="text-base-content/30 font-medium">(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What was this expense for?"
              className="w-full bg-base-200 border border-base-content/10 rounded-xl py-3 px-4 text-sm text-base-content focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-error text-xs font-bold bg-error/5 p-3 rounded-xl">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-sm hover:bg-base-200 transition-colors text-base-content/60 border border-base-content/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-3 rounded-xl bg-error text-white font-bold text-sm hover:bg-error/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-error/20 flex items-center justify-center gap-2"
            >
              {isPending ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              {isEdit ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
