import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ListChecks, Plus, Check, X, Pencil, Trash2, CheckCircle, CircleDashed, GripVertical } from 'lucide-react';
import { usePatient, useUpdatePatient } from '../hooks/usePatients';
import Card from '../components/Card';

export default function TreatmentPlanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: patient, isLoading } = usePatient(id);
  const { mutate: updatePatient, isPending: isUpdating } = useUpdatePatient();

  const [newPlanItem, setNewPlanItem] = useState('');
  const [editingPlanIndex, setEditingPlanIndex] = useState(null);
  const [editPlanText, setEditPlanText] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-20">
        <p className="text-base-content/50">Patient not found.</p>
        <button onClick={() => navigate(-1)} className="btn btn-sm btn-ghost mt-4">Go Back</button>
      </div>
    );
  }

  const plan = patient.treatment_plan || [];
  const completedCount = plan.filter(i => i.isCompleted).length;
  const pendingCount = plan.length - completedCount;
  const progressPercent = plan.length > 0 ? Math.round((completedCount / plan.length) * 100) : 0;

  // ── Handlers ──────────────────────────────
  const handleTogglePlanItem = (idx) => {
    const newPlan = plan.map((item, i) =>
      i === idx ? { ...item, isCompleted: !item.isCompleted } : item
    );
    updatePatient({ id: patient._id, data: { treatment_plan: newPlan } });
  };

  const handleDeletePlanItem = (idx) => {
    if (!window.confirm("Remove this step from the treatment plan?")) return;
    const newPlan = plan.filter((_, i) => i !== idx);
    updatePatient({ id: patient._id, data: { treatment_plan: newPlan } });
  };

  const handleAddPlanItem = (e) => {
    e.preventDefault();
    if (!newPlanItem.trim()) return;
    const newPlan = [...plan, { text: newPlanItem.trim(), isCompleted: false }];
    updatePatient({ id: patient._id, data: { treatment_plan: newPlan } });
    setNewPlanItem('');
  };

  const handleStartEditPlanItem = (idx, text) => {
    setEditingPlanIndex(idx);
    setEditPlanText(text);
  };

  const handleSaveEditPlanItem = (idx) => {
    if (!editPlanText.trim()) return;
    const newPlan = plan.map((item, i) =>
      i === idx ? { ...item, text: editPlanText.trim() } : item
    );
    updatePatient({ id: patient._id, data: { treatment_plan: newPlan } });
    setEditingPlanIndex(null);
  };

  const handleClearCompleted = () => {
    if (!window.confirm("Remove all completed steps?")) return;
    const newPlan = plan.filter(item => !item.isCompleted);
    updatePatient({ id: patient._id, data: { treatment_plan: newPlan } });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ───────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/patients/${id}`)}
          className="w-10 h-10 rounded-xl bg-base-200 hover:bg-primary/10 flex items-center justify-center text-base-content/60 hover:text-primary transition-all shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-black text-base-content tracking-tight break-all [overflow-wrap:anywhere]">
            Treatment Plan
          </h1>
          <p className="text-sm text-base-content/50 break-all [overflow-wrap:anywhere]">
            {patient.name}
          </p>
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Steps */}
        <Card className="p-4 lg:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
              <ListChecks size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-black text-base-content">{plan.length}</p>
              <p className="text-[10px] lg:text-xs uppercase font-bold text-base-content/40 tracking-wider">Total Steps</p>
            </div>
          </div>
        </Card>

        {/* Completed */}
        <Card className="p-4 lg:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
              <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</p>
              <p className="text-[10px] lg:text-xs uppercase font-bold text-base-content/40 tracking-wider">Completed</p>
            </div>
          </div>
        </Card>

        {/* Pending */}
        <Card className="p-4 lg:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
              <CircleDashed size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-black text-amber-600 dark:text-amber-400">{pendingCount}</p>
              <p className="text-[10px] lg:text-xs uppercase font-bold text-base-content/40 tracking-wider">Pending</p>
            </div>
          </div>
        </Card>

        {/* Progress */}
        <Card className="p-4 lg:p-5">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 lg:w-12 lg:h-12 shrink-0">
              {/* Circular progress */}
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-base-300" />
                <circle
                  cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3"
                  strokeDasharray={`${progressPercent * 0.942} 100`}
                  strokeLinecap="round"
                  className="text-primary transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] lg:text-[10px] font-black text-primary">
                {progressPercent}%
              </span>
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-black text-base-content">{progressPercent}<span className="text-sm text-base-content/30">%</span></p>
              <p className="text-[10px] lg:text-xs uppercase font-bold text-base-content/40 tracking-wider">Progress</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Progress Bar (wide) ────────────────── */}
      {plan.length > 0 && (
        <div className="px-1">
          <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-primary to-emerald-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Treatment Plan List ────────────────── */}
      <Card className="p-0 overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-neutral-light/30">
          <h2 className="text-base font-bold text-base-content flex items-center gap-2">
            <ListChecks size={18} className="text-indigo-500" />
            Plan Steps
          </h2>
          {completedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="btn btn-xs btn-ghost text-error/50 hover:text-error hover:bg-error/10 rounded-lg gap-1"
            >
              <Trash2 size={12} />
              Clear {completedCount} done
            </button>
          )}
        </div>

        {/* Step list */}
        <div className="divide-y divide-neutral-light/20">
          {plan.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mx-auto mb-4">
                <ListChecks size={32} className="text-indigo-300 dark:text-indigo-600" />
              </div>
              <p className="text-base font-semibold text-base-content/50">No treatment steps yet</p>
              <p className="text-sm text-base-content/30 mt-1">Add your first step using the input below</p>
            </div>
          ) : (
            plan.map((item, idx) => (
              <div
                key={idx}
                className={`group flex items-start gap-3 sm:gap-4 px-5 sm:px-6 py-4 transition-colors ${item.isCompleted
                  ? 'bg-base-200/30'
                  : 'hover:bg-primary/[0.02]'
                  }`}
              >
                {editingPlanIndex === idx ? (
                  /* ── Edit Mode ── */
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 py-0.5">
                    <div className="flex items-center gap-2 text-base-content/30 shrink-0">
                      <span className="text-xs font-mono font-bold w-6 text-center">{idx + 1}</span>
                    </div>
                    <input
                      autoFocus
                      className="input input-bordered input-sm lg:input-md flex-1 rounded-lg min-w-0 border-indigo-300 focus:border-indigo-500"
                      value={editPlanText}
                      onChange={(e) => setEditPlanText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEditPlanItem(idx);
                        else if (e.key === 'Escape') setEditingPlanIndex(null);
                      }}
                    />
                    <div className="flex gap-1.5 justify-end shrink-0">
                      <button
                        onClick={() => handleSaveEditPlanItem(idx)}
                        className="btn btn-sm bg-success/10 text-success hover:bg-success hover:text-white border-0 rounded-lg px-3"
                        title="Save"
                      >
                        <Check size={14} />
                        <span className="hidden lg:inline text-xs">Save</span>
                      </button>
                      <button
                        onClick={() => setEditingPlanIndex(null)}
                        className="btn btn-sm btn-ghost text-base-content/40 hover:text-error rounded-lg"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Display Mode ── */
                  <>
                    {/* Step number */}
                    <span className={`text-xs font-mono font-bold w-6 text-center mt-1 shrink-0 ${item.isCompleted ? 'text-base-content/20' : 'text-base-content/30'
                      }`}>
                      {idx + 1}
                    </span>

                    {/* Checkbox */}
                    <button
                      onClick={() => handleTogglePlanItem(idx)}
                      className={`mt-0.5 shrink-0 w-6 h-6 lg:w-7 lg:h-7 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${item.isCompleted
                        ? 'bg-success border-success text-white scale-95'
                        : 'border-base-content/15 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                        }`}
                    >
                      {item.isCompleted && <Check size={14} strokeWidth={3} />}
                    </button>

                    {/* Text */}
                    <div className="min-w-0 flex-1 py-0.5 cursor-pointer" onClick={() => handleTogglePlanItem(idx)}>
                      <p className={`text-sm lg:text-base break-all [overflow-wrap:anywhere] leading-relaxed transition-all ${item.isCompleted
                        ? 'text-base-content/30  decoration-2 decoration-base-content/15'
                        : 'text-base-content font-medium'
                        }`}>
                        {item.text}
                      </p>
                    </div>

                    {/* Actions - visible on hover on desktop, always visible on mobile */}
                    <div className="flex items-center gap-0.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStartEditPlanItem(idx, item.text); }}
                        className="p-2 rounded-lg text-base-content/25 hover:text-primary hover:bg-primary/5 transition-all"
                        title="Edit step"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeletePlanItem(idx); }}
                        className="p-2 rounded-lg text-base-content/25 hover:text-error hover:bg-error/5 transition-all"
                        title="Delete step"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* ── Add Step Form ── */}
        <div className="px-5 sm:px-6 py-4 border-t border-neutral-light/30 bg-base-200/30">
          <form onSubmit={handleAddPlanItem} className="flex gap-3">
            <div className="flex items-center gap-2 text-base-content/20 shrink-0">
              <Plus size={16} />
            </div>
            <input
              type="text"
              className="input input-sm lg:input-md input-bordered flex-1 rounded-xl focus:border-indigo-400 min-w-0 bg-base-100"
              placeholder="Add new step (e.g. Scaling, Upper Right Molar Fill, Crown Prep...)"
              value={newPlanItem}
              onChange={(e) => setNewPlanItem(e.target.value)}
              disabled={isUpdating}
            />
            <button
              type="submit"
              disabled={!newPlanItem.trim() || isUpdating}
              className="btn btn-sm lg:btn-md bg-primary cursor-pointer text-white border-0 rounded-xl px-4 lg:px-6 gap-1.5"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Step</span>
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
