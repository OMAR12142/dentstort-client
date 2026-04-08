import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { motion } from 'framer-motion';
import { Search, Users, ShieldCheck, Ban, CheckCircle } from 'lucide-react';
import { useAdminDentists, useToggleDentistStatus } from '../../hooks/useAdmin';
import Card from '../../components/Card';
import { TableRowSkeleton } from '../../components/Skeleton';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, error } = useAdminDentists(search);
  const { mutate: toggleStatus, isPending: isToggling } =
    useToggleDentistStatus();

  // Track which dentist is currently being toggled (for button loading state)
  const [togglingId, setTogglingId] = useState(null);

  const dentists = data?.dentists || [];

  const handleToggle = (id) => {
    setTogglingId(id);
    toggleStatus(id, {
      onSettled: () => setTogglingId(null),
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-base-content">
          Dentists Management
        </h1>
        <p className="text-xs sm:text-sm text-base-content/70 mt-0.5">
          Browse, search, and manage all registered dentists on the platform.
        </p>
      </div>

      {/* ── Search Bar ── */}
      <div className="relative max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full pl-10 pr-4 py-2.5 bg-base-200 border-neutral-light text-sm text-base-content placeholder:text-base-content/40 focus:border-primary focus:outline-none rounded-lg"
        />
      </div>

      {/* ── Error state ── */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShieldCheck size={48} className="text-error mb-4" />
          <h2 className="text-xl font-bold text-base-content mb-2">
            Failed to load dentists
          </h2>
          <p className="text-sm text-base-content/60 max-w-md">
            {error?.response?.data?.message ||
              error?.message ||
              'Something went wrong.'}
          </p>
        </div>
      )}

      {/* ── Data Table ── */}
      {!isError && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto min-w-0">
              <table className="table w-full">
                {/* ── Table Head ── */}
                <thead>
                  <tr className="border-b border-neutral-light bg-base-200/60">
                    <th className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-4 py-3">
                      Name
                    </th>
                    <th className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-4 py-3">
                      Email
                    </th>
                    <th className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                      Phone
                    </th>
                    <th className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-4 py-3 text-center">
                      Patients
                    </th>
                    <th className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-4 py-3 text-center">
                      Sessions
                    </th>
                    <th className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                      Status
                    </th>
                    <th className="text-xs font-semibold text-base-content/70 uppercase tracking-wider px-4 py-3 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* ── Table Body ── */}
                <tbody className="divide-y divide-neutral-light">
                  {isLoading ? (
                    <TableRowSkeleton rows={6} cols={7} />
                  ) : dentists.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-12 text-base-content/60"
                      >
                        <Users
                          size={36}
                          className="mx-auto mb-3 opacity-30"
                        />
                        <p className="text-sm">
                          {search
                            ? 'No dentists match your search.'
                            : 'No dentists registered yet.'}
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
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className={`transition-colors ${
                            isSuspended
                              ? 'bg-error/5 hover:bg-error/10'
                              : 'hover:bg-base-100/60'
                          }`}
                        >
                          {/* Name */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                  isSuspended
                                    ? 'bg-error/10 text-error'
                                    : 'bg-primary/10 text-primary'
                                }`}
                              >
                                {dentist.name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <span
                                className={`text-sm font-medium truncate max-w-[140px] sm:max-w-none ${
                                  isSuspended
                                    ? 'text-base-content/40 line-through'
                                    : 'text-base-content'
                                }`}
                              >
                                {dentist.name}
                              </span>
                            </div>
                          </td>

                          {/* Email */}
                          <td
                            className={`px-4 py-3 text-sm truncate max-w-[180px] ${
                              isSuspended
                                ? 'text-base-content/40'
                                : 'text-base-content/70'
                            }`}
                          >
                            {dentist.email}
                          </td>

                          {/* Phone */}
                          <td
                            className={`px-4 py-3 text-sm hidden sm:table-cell ${
                              isSuspended
                                ? 'text-base-content/40'
                                : 'text-base-content/70'
                            }`}
                          >
                            {dentist.phone || '—'}
                          </td>

                          {/* Patient count */}
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-semibold ${
                                isSuspended
                                  ? 'bg-base-100 text-base-content/40'
                                  : 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400'
                              }`}
                            >
                              {dentist.patientCount ?? 0}
                            </span>
                          </td>

                          {/* Session count */}
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-semibold ${
                                isSuspended
                                  ? 'bg-base-100 text-base-content/40'
                                  : 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400'
                              }`}
                            >
                              {dentist.sessionCount ?? 0}
                            </span>
                          </td>

                          {/* Status badge */}
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                isSuspended
                                  ? 'bg-error/10 text-error'
                                  : 'bg-success/10 text-success'
                              }`}
                            >
                              {isSuspended ? (
                                <>
                                  <Ban size={12} />
                                  Suspended
                                </>
                              ) : (
                                <>
                                  <CheckCircle size={12} />
                                  Active
                                </>
                              )}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleToggle(dentist._id)}
                              disabled={isToggling}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                                isSuspended
                                  ? 'border-success/30 text-success hover:bg-success/10'
                                  : 'border-error/30 text-error hover:bg-error/10'
                              } ${
                                isThisToggling ? 'opacity-50 cursor-wait' : ''
                              }`}
                            >
                              {isThisToggling ? (
                                <span className="loading loading-spinner loading-xs" />
                              ) : isSuspended ? (
                                <>
                                  <CheckCircle size={14} />
                                  Activate
                                </>
                              ) : (
                                <>
                                  <Ban size={14} />
                                  Suspend
                                </>
                              )}
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Footer with count ── */}
            {!isLoading && dentists.length > 0 && (
              <div className="px-4 py-3 border-t border-neutral-light bg-base-200/40 text-xs text-base-content/60">
                Showing {dentists.length} dentist
                {dentists.length !== 1 ? 's' : ''}
                {search && ` matching "${search}"`}
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  );
}
