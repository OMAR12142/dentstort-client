import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Users, 
  ShieldCheck, 
  Ban, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useAdminDentists, useToggleDentistStatus } from '../../hooks/useAdmin';
import Card from '../../components/Card';
import { TableRowSkeleton } from '../../components/Skeleton';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading, isFetching, isError, error } = useAdminDentists({ search, page, limit });
  const { mutate: toggleStatus, isPending: isToggling } = useToggleDentistStatus();

  const [togglingId, setTogglingId] = useState(null);

  const dentists = data?.dentists || [];
  const totalDentists = data?.totalDentists || 0;
  const totalPages = data?.totalPages || 1;

  const handleToggle = (id) => {
    setTogglingId(id);
    toggleStatus(id, {
      onSettled: () => setTogglingId(null),
    });
  };

  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h1 className="text-xl sm:text-2xl font-black text-base-content uppercase tracking-tight italic">
              Dentist Registry
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-base-content/50 font-medium ml-4 mt-0.5">
            Platform-wide user management and operational status control.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-full text-[10px] font-black uppercase text-primary tracking-widest self-start">
          <Users size={12} />
          {totalDentists} Active Professionals
        </div>
      </div>

      {/* ── Unified Search & Info Bar ── */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="relative flex-1 max-w-md group">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 transition-colors group-focus-within:text-primary pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-sm w-full pl-10 pr-4 py-5 bg-base-200/50 border-neutral-light/50 text-sm font-medium focus:border-primary focus:ring-0 focus:outline-none rounded-xl transition-all"
          />
          {isFetching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <span className="loading loading-spinner loading-xs opacity-20" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-[10px] font-black uppercase text-base-content/30 tracking-[0.2em] px-2">
          <Filter size={12} />
          {search ? 'Filtered View' : 'Global View'}
        </div>
      </div>

      {/* ── Error state ── */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-base-200/30 rounded-3xl border border-dashed border-error/20">
          <ShieldCheck size={48} className="text-error opacity-20 mb-4" />
          <h2 className="text-lg font-black text-base-content uppercase tracking-widest mb-2">
            Registry Sync Failed
          </h2>
          <p className="text-xs font-medium text-base-content/50 max-w-sm">
            {error?.response?.data?.message || error?.message || 'Technical error during list retrieval.'}
          </p>
        </div>
      )}

      {/* ── Data Table ── */}
      {!isError && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-0 overflow-hidden border-neutral-light/50 bg-base-100/50 backdrop-blur-sm">
            <div className="overflow-x-auto min-w-0">
              <table className="table w-full">
                {/* ── Table Head ── */}
                <thead>
                  <tr className="border-b border-neutral-light/50 bg-base-200/40">
                    <th className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em] px-6 py-4">
                      Professional
                    </th>
                    <th className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em] px-6 py-4 hidden sm:table-cell">
                      Contact
                    </th>
                    <th className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em] px-6 py-4 text-center">
                      Metrics
                    </th>
                    <th className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em] px-6 py-4 hidden md:table-cell">
                      Status
                    </th>
                    <th className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.2em] px-6 py-4 text-center">
                      Governance
                    </th>
                  </tr>
                </thead>

                {/* ── Table Body ── */}
                <tbody className="divide-y divide-neutral-light/30">
                  {isLoading ? (
                    <TableRowSkeleton rows={limit} cols={5} />
                  ) : dentists.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-24 text-base-content/30">
                        <Users size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="text-sm font-black uppercase tracking-widest italic">
                          {search ? 'Zero matches found' : 'No dentists registered'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    dentists.map((dentist, idx) => {
                      const isSuspended = dentist.status === 'suspended';
                      const isThisToggling = togglingId === dentist._id;

                      return (
                        <motion.tr
                          key={dentist._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`group transition-all ${
                            isSuspended ? 'bg-error/[0.02] grayscale-[0.4]' : 'hover:bg-base-200/30'
                          }`}
                        >
                          {/* Professional */}
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => navigate(`/admin/dentists/${dentist._id}`)}
                              className="flex items-center gap-4 text-left focus:outline-none"
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                                isSuspended ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary group-hover:scale-110'
                              }`}>
                                {dentist.name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-black uppercase tracking-tight transition-colors ${
                                  isSuspended ? 'text-base-content/40 line-through' : 'text-base-content group-hover:text-primary'
                                }`}>
                                  {dentist.name}
                                </p>
                                <p className="text-[10px] font-bold text-base-content/30 block sm:hidden">
                                  {dentist.email}
                                </p>
                              </div>
                            </button>
                          </td>

                          {/* Contact */}
                          <td className="px-6 py-4 hidden sm:table-cell">
                            <p className={`text-xs font-medium ${isSuspended ? 'text-base-content/30' : 'text-base-content/60'}`}>
                              {dentist.email}
                            </p>
                            <p className="text-[10px] font-bold text-base-content/30 mt-0.5">
                              {dentist.phone || 'NO PHONE INDEXED'}
                            </p>
                          </td>

                          {/* Metrics */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-3">
                              <div className="flex flex-col items-center">
                                <span className={`text-xs font-black ${isSuspended ? 'text-base-content/30' : 'text-sky-600'}`}>
                                  {dentist.patientCount ?? 0}
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-tighter opacity-30 italic">Patients</span>
                              </div>
                              <div className="w-px h-4 bg-neutral-light/50" />
                              <div className="flex flex-col items-center">
                                <span className={`text-xs font-black ${isSuspended ? 'text-base-content/30' : 'text-primary'}`}>
                                  {dentist.sessionCount ?? 0}
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-tighter opacity-30 italic">Sessions</span>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              isSuspended ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
                            }`}>
                              {isSuspended ? <Ban size={10} /> : <CheckCircle size={10} />}
                              {isSuspended ? 'Suspended' : 'Active'}
                            </div>
                          </td>

                          {/* Governance (Actions) */}
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleToggle(dentist._id)}
                              disabled={isToggling}
                              className={`btn btn-xs rounded-lg font-black uppercase tracking-tighter transition-all ${
                                isSuspended
                                  ? 'bg-success/10 text-success hover:bg-success hover:text-white border-0'
                                  : 'bg-error/5 text-error hover:bg-error hover:text-white border-0'
                              } ${isThisToggling ? 'loading' : ''}`}
                            >
                              {isSuspended ? 'Activate' : 'Suspend'}
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Premium Pagination Footer ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-neutral-light/50 bg-base-200/20 gap-4">
              <div className="text-[10px] font-black uppercase text-base-content/40 tracking-widest">
                Showing <span className="text-base-content font-black">{dentists.length}</span> of <span className="text-base-content font-black">{totalDentists}</span> Result Index
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1 || isFetching}
                  className="btn btn-square btn-ghost btn-xs disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex items-center bg-base-100 rounded-lg border border-neutral-light/50 p-0.5">
                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    // Only show first, last, and around current page for massive sets
                    if (totalPages > 5 && p > 1 && p < totalPages && Math.abs(p - page) > 1) {
                      if (p === 2 || p === totalPages - 1) return <span key={p} className="px-1 opacity-30 text-[10px]">...</span>;
                      return null;
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-md text-[10px] font-black transition-all ${
                          page === p ? 'bg-primary text-white shadow-sm' : 'hover:bg-base-200 text-base-content/60'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages || isFetching}
                  className="btn btn-square btn-ghost btn-xs disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

