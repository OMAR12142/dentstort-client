import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Receipt,
  Plus,
  Filter,
  Pencil,
  Trash2,
  X,
  Loader2,
  Package,
  Users,
  Coffee,
  Building2,
  CalendarDays,
  DollarSign,
  ChevronDown,
  AlertCircle,
  ArrowLeft,
  Search,
  FlaskConical,
  CheckCircle2,
} from 'lucide-react';
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '../hooks/useExpenses';
import { useClinics } from '../hooks/useClinics';
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
//  EXPENSE RECORDS PAGE
// ════════════════════════════════════════════════
export default function ExpenseRecordsPage() {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('all');
  const [filterClinic, setFilterClinic] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 100;

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data: clinicsData } = useClinics();
  const clinics = Array.isArray(clinicsData) ? clinicsData : clinicsData?.clinics || [];

  // Build expense list filters
  const listFilters = useMemo(() => {
    const f = { page, limit };
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
  }, [page, filterClinic, filterCategory, timeframe]);

  const { data: expenseData, isLoading } = useExpenses(listFilters);
  const { mutate: deleteExpenseFn } = useDeleteExpense();

  const expenses = expenseData?.expenses || [];
  const pagination = expenseData?.pagination || {};

  // Track which month groups are collapsed
  const [collapsedMonths, setCollapsedMonths] = useState({});

  const toggleMonth = (key) =>
    setCollapsedMonths((prev) => ({ ...prev, [key]: !prev[key] }));

  // Filter by search query (client-side on loaded expenses)
  const filteredExpenses = useMemo(() => {
    if (!searchQuery.trim()) return expenses;
    const q = searchQuery.toLowerCase();
    return expenses.filter(
      (exp) =>
        (exp.description || '').toLowerCase().includes(q) ||
        (exp.category || '').toLowerCase().includes(q) ||
        (exp.clinic_id?.name || '').toLowerCase().includes(q) ||
        String(exp.amount).includes(q)
    );
  }, [expenses, searchQuery]);

  // Group filtered expenses by month/year
  const groupedExpenses = useMemo(() => {
    const groups = {};
    filteredExpenses.forEach((exp) => {
      const d = new Date(exp.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) {
        groups[key] = {
          key,
          label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          month: d.getMonth(),
          year: d.getFullYear(),
          items: [],
          total: 0,
        };
      }
      groups[key].items.push(exp);
      groups[key].total += exp.amount || 0;
    });
    return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
  }, [filteredExpenses]);

  // Grand total of all visible expenses
  const grandTotal = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    [filteredExpenses]
  );

  const handleDelete = (id) => {
    deleteExpenseFn(id, { onSuccess: () => setDeleteConfirm(null) });
  };

  return (
    <div className="max-w-full overflow-x-hidden space-y-6 animate-in fade-in duration-500">
      <SEO title="Expense Records | DentStory" />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-neutral-light/30">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/expenses')}
              className="w-9 h-9 rounded-xl bg-base-200 border border-base-content/10 flex items-center justify-center hover:bg-base-300 transition-colors"
              title="Back to Expenses"
            >
              <ArrowLeft size={16} className="text-base-content/60" />
            </button>
            <div className="w-2 h-8 bg-error rounded-full" />
            <h1 className="text-2xl sm:text-3xl font-black text-base-content tracking-tight uppercase italic">
              Expense Records
            </h1>
          </div>
          <p className="text-base-content/50 text-sm font-medium ml-14">
            Full history of all your expense records, organized by month.
          </p>
        </div>

        <button
          onClick={() => setAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-error text-white text-sm font-bold hover:bg-error/90 transition-all shadow-lg shadow-error/20 active:scale-95"
        >
          <Plus size={16} />
          Add Expense
        </button>
      </div>

      {/* ── Filters + Search Bar ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white dark:bg-base-200/50 p-2 rounded-2xl border border-slate-200 dark:border-neutral-light/50 shadow-sm">
          <div className="px-3 py-1.5 flex items-center gap-2 text-[10px] font-black uppercase text-base-content/40 tracking-widest sm:border-r border-slate-200 dark:border-neutral-light/30">
            <Filter size={12} />
            Filters
          </div>
          <div className="flex flex-wrap gap-2 items-center flex-1">
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

            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expenses..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-base-200 border border-slate-200 dark:border-base-content/10 text-xs font-medium text-base-content placeholder:text-base-content/30 focus:outline-none focus:ring-2 focus:ring-error/20 focus:border-error/30 transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── Stats Strip ── */}
        <div className="flex flex-wrap items-center gap-4 px-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-base-content/30">Total</span>
            <span className="text-sm font-black text-error">{grandTotal.toLocaleString()} <span className="text-[10px] font-bold opacity-50">EGP</span></span>
          </div>
          <div className="w-px h-4 bg-base-content/10" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-base-content/30">Records</span>
            <span className="text-sm font-bold text-base-content/70">{filteredExpenses.length}</span>
          </div>
          <div className="w-px h-4 bg-base-content/10" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-base-content/30">Months</span>
            <span className="text-sm font-bold text-base-content/70">{groupedExpenses.length}</span>
          </div>
          {pagination.totalItems > limit && (
            <>
              <div className="w-px h-4 bg-base-content/10" />
              <span className="text-[10px] font-bold text-base-content/40">
                Showing {filteredExpenses.length} of {pagination.totalItems}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Records List ── */}
      <div className="bg-base-200 border border-base-content/10 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-20 px-4 bg-gradient-to-b from-base-200 to-base-100">
            <div className="relative w-24 h-24 mx-auto mb-5">
              <div className="absolute inset-0 bg-base-content/5 rounded-full animate-pulse" />
              <div className="relative w-full h-full rounded-full bg-base-100 shadow-xl border border-base-content/5 flex items-center justify-center">
                <Search size={36} className="text-base-content/20" />
              </div>
            </div>
            <h3 className="text-xl font-black text-base-content tracking-tight mb-2">
              {searchQuery ? 'No matching records' : 'No records found'}
            </h3>
            <p className="text-sm font-medium text-base-content/50 max-w-sm mx-auto mb-8 leading-relaxed">
              {searchQuery
                ? `We couldn't find any expenses matching "${searchQuery}". Try adjusting your filters or search term.`
                : 'Your expense history is currently empty. Start logging expenses to see them organized here.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-error text-white text-sm font-bold hover:bg-error/90 transition-all shadow-lg shadow-error/30 hover:-translate-y-0.5"
              >
                <Plus size={18} />
                Add First Expense
              </button>
            )}
          </div>
        ) : (
          <div>
            {groupedExpenses.map((group) => {
              const isCollapsed = collapsedMonths[group.key];
              return (
                <div key={group.key}>
                  {/* ── Month Header ── */}
                  <button
                    type="button"
                    onClick={() => toggleMonth(group.key)}
                    className="w-full flex items-center justify-between gap-3 px-6 py-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent hover:from-primary/20 hover:via-primary/10 transition-all cursor-pointer border-b border-primary/20 sticky top-0 z-[2] backdrop-blur-md shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shadow-inner">
                        <CalendarDays size={18} className="text-primary" />
                      </div>
                      <span className="text-base font-black text-primary tracking-tight">
                        {group.label}
                      </span>
                      <span className="text-[10px] font-bold text-primary/70 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                        {group.items.length} {group.items.length === 1 ? 'record' : 'records'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-primary">
                        {group.total.toLocaleString()} <span className="text-xs font-bold opacity-60">EGP</span>
                      </span>
                      <ChevronDown
                        size={18}
                        className={`text-primary/60 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
                      />
                    </div>
                  </button>

                  {/* ── Month Items ── */}
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        key={`items-${group.key}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="divide-y divide-base-content/5">
                          {group.items.map((exp) => {
                            const config = CATEGORY_CONFIG[exp.category] || CATEGORY_CONFIG.Other;
                            const CatIcon = config.icon;
                            return (
                              <motion.div
                                key={exp._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-4 px-6 py-4 hover:bg-base-100/50 transition-colors group"
                              >
                                {/* Category Icon */}
                                <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center shrink-0`}>
                                  <CatIcon size={18} className={config.color} />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${config.badge}`}>
                                      {exp.category}
                                    </span>
                                    {exp.clinic_id?.name && (
                                      <span className="text-[10px] font-medium text-base-content/40 flex items-center gap-1">
                                        <Building2 size={10} />
                                        {exp.clinic_id.name}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm font-semibold text-base-content truncate">
                                    {exp.description || '—'}
                                  </p>
                                  <p className="text-[11px] text-base-content/40 font-medium mt-0.5 flex items-center gap-1">
                                    <CalendarDays size={10} />
                                    {new Date(exp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>

                                {/* Amount */}
                                <div className="text-right shrink-0">
                                  <p className="text-base font-black text-error">
                                    {exp.amount.toLocaleString()} <span className="text-[10px] font-bold opacity-50">EGP</span>
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                                  <button
                                    onClick={() => setEditModal(exp)}
                                    className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
                                    title="Edit"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(exp._id)}
                                    className="w-8 h-8 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-base-content/5">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-base-content/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-base-100 transition-colors"
            >
              Prev
            </button>
            <div className="flex gap-1">
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-xl text-[10px] font-bold transition-all ${page === i + 1 ? 'bg-error text-white shadow-md' : 'text-base-content/50 hover:bg-base-100'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-base-content/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-base-100 transition-colors"
            >
              Next
            </button>
          </div>
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
    </div>
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
