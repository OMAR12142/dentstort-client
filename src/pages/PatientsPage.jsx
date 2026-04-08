import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
  FileText,
  Filter,
  AlertCircle,
  MessageCircle,
  Pencil,
  Building2,
} from 'lucide-react';
import { usePatients } from '../hooks/usePatients';
import { useClinics } from '../hooks/useClinics';
import PatientsListSkeleton from '../components/skeletons/PatientsListSkeleton';
import ErrorState from '../components/common/ErrorState';
import Badge from '../components/Badge';
import Card from '../components/Card';
import PatientModal from '../components/PatientModal';

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'bg-success/10 text-success border border-success/20';
    case 'On-Hold': return 'bg-warning/10 text-warning-content border border-warning/20';
    case 'Dropped': return 'bg-secondary/10 text-secondary border border-secondary/20';
    case 'Active':
    default: return 'bg-info/10 text-info border border-info/20';
  }
};

export default function PatientsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [viewMode, setViewMode] = useState('card');
  const [sortBy, setSortBy] = useState('name');
  const [ageFilter, setAgeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('All Patients');
  const [clinicFilter, setClinicFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { data: clinicsData } = useClinics();
  const clinics = Array.isArray(clinicsData) ? clinicsData : clinicsData?.clinics || [];

  const getWhatsAppLink = (phone) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  // Reset to page 1 when filters change
  const hasFilters = Boolean(search || statusFilter !== 'All Patients' || ageFilter !== 'all' || clinicFilter);
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, ageFilter, clinicFilter]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && viewMode === 'table') {
        setViewMode('card');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  const limit = viewMode === 'card' ? (isMobile ? 8 : 12) : 10;
  const { data, isLoading, isError, error, refetch } = usePatients({ page, limit, clinic_id: clinicFilter });
  const patients = data?.patients || [];
  const totalPages = data?.totalPages || 1;
  const totalPatients = data?.totalPatients || 0;

  let filtered = search
    ? patients.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search)
    )
    : patients;

  filtered = filtered.filter((p) => {
    if (statusFilter === 'All Patients') return true;
    return (p.status || 'Active') === statusFilter;
  });

  filtered = filtered.filter((p) => {
    if (ageFilter === 'all') return true;
    if (ageFilter === 'child') return p.age && p.age < 13;
    if (ageFilter === 'teen') return p.age && p.age >= 13 && p.age < 18;
    if (ageFilter === 'adult') return p.age && p.age >= 18 && p.age < 60;
    if (ageFilter === 'senior') return p.age && p.age >= 60;
    return true;
  });

  filtered = filtered.sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'age') return (a.age || 0) - (b.age || 0);
    return 0;
  });

  const stats = useMemo(() => ({
    total: totalPatients,
    withHistory: patients.filter((p) => p.medical_history?.length > 0).length,
    withPhone: patients.filter((p) => p.phone).length,
    avgAge: patients.length > 0
      ? Math.round(patients.reduce((sum, p) => sum + (p.age || 0), 0) / patients.length)
      : 0,
  }), [patients, totalPatients]);

  if (isLoading) return <PatientsListSkeleton />;
  if (isError) return <ErrorState error={error} refetch={refetch} />;

  return (
    <div className="flex flex-col gap-6 w-full overflow-x-hidden pb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Patients</h1>
          <p className="text-base-content/70 text-sm mt-0.5">
            Manage and track all your patient records
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full">
        <div className="bg-base-200 rounded-xl p-4 sm:p-5 border border-neutral-light overflow-hidden">
          <p className="text-[10px] sm:text-xs text-secondary font-semibold uppercase tracking-wider leading-tight whitespace-normal">Total Patients</p>
          <p className="text-2xl sm:text-3xl font-bold text-primary mt-2">{stats.total}</p>
        </div>

        <div className="bg-base-200 rounded-xl p-4 sm:p-5 border border-neutral-light overflow-hidden">
          <p className="text-[10px] sm:text-xs text-secondary font-semibold uppercase tracking-wider leading-tight whitespace-normal">With History</p>
          <p className="text-2xl sm:text-3xl font-bold text-base-content mt-2">{stats.withHistory}</p>
        </div>

        <div className="bg-base-200 rounded-xl p-4 sm:p-5 border border-neutral-light overflow-hidden">
          <p className="text-[10px] sm:text-xs text-secondary font-semibold uppercase tracking-wider leading-tight whitespace-normal">Avg Age</p>
          <div className="flex items-baseline gap-1 mt-2">
            <p className="text-2xl sm:text-3xl font-bold text-base-content">{stats.avgAge}</p>
            <span className="text-xs sm:text-sm text-secondary font-medium">Yrs</span>
          </div>
        </div>

        <div className="bg-base-200 rounded-xl p-4 sm:p-5 border border-neutral-light overflow-hidden">
          <p className="text-[10px] sm:text-xs text-secondary font-semibold uppercase tracking-wider leading-tight whitespace-normal">With Phone</p>
          <p className="text-2xl sm:text-3xl font-bold text-base-content mt-2">{stats.withPhone}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 w-full">
        <label className="input input-bordered rounded-lg flex items-center gap-2 bg-base-200 w-full border-neutral-light">
          <Search size={16} className="text-base-content/50 shrink-0" />
          <input
            placeholder="Search by name or phone…"
            className="grow w-full min-w-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-base-content/50 hover:text-base-content transition-colors shrink-0">
              ✕
            </button>
          )}
        </label>

        <div className="flex flex-col sm:flex-row justify-between items-stretch gap-3 w-full">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn btn-sm rounded-lg gap-1 transition-all w-full sm:w-auto ${showFilters ? 'bg-primary/10 text-primary border-primary/20' : 'btn-ghost text-secondary'
                }`}
            >
              <Filter size={16} />
              <span>Filter</span>
            </button>

            {/* Clinic filter dropdown */}
            <div className="relative flex items-center w-full sm:w-auto">
              <Building2 size={14} className="absolute left-3 text-base-content/50 pointer-events-none" />
              <select
                value={clinicFilter}
                onChange={(e) => setClinicFilter(e.target.value)}
                className={`select select-sm select-bordered rounded-lg bg-base-200 border-neutral-light pl-8 w-full sm:w-auto focus:border-primary transition-all ${
                  clinicFilter ? 'border-primary text-primary' : ''
                }`}
              >
                <option value="">All Clinics</option>
                {clinics.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="select select-sm select-bordered rounded-lg bg-base-200 border-neutral-light w-full sm:w-auto focus:border-primary"
            >
              <option value="name">Sort: Name (A-Z)</option>
              <option value="age">Sort: Age (Low to High)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="join bg-base-200/50 p-1 rounded-lg border border-neutral-light hidden md:flex">
              <button
                onClick={() => setViewMode('table')}
                className={`btn btn-sm join-item border-none ${viewMode === 'table' ? 'bg-base-100 shadow-sm text-primary' : 'btn-ghost text-secondary hover:bg-transparent'
                  }`}
                title="Table view"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`btn btn-sm join-item border-none ${viewMode === 'card' ? 'bg-base-100 shadow-sm text-primary' : 'btn-ghost text-secondary hover:bg-transparent'
                  }`}
                title="Card view"
              >
                <Grid3x3 size={16} />
              </button>
            </div>

            <button
              onClick={() => setShowAdd(true)}
              className="btn btn-primary text-white border-0 gap-2 rounded-lg px-6 w-full sm:w-auto shadow-sm font-semibold"
            >
              <Plus size={20} />
              <span>Add Patient</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {['all', 'child', 'teen', 'adult', 'senior'].map((filter) => (
                  <label key={filter} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="ageFilter"
                      value={filter}
                      checked={ageFilter === filter}
                      onChange={(e) => setAgeFilter(e.target.value)}
                      className="radio radio-sm radio-primary shrink-0"
                    />
                    <span className="text-sm capitalize">
                      {filter === 'all' ? 'All Ages' : filter}
                    </span>
                  </label>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Filtering Tabs - بدون تمرير أفقي، الأزرار تلف للداخل */}
      <div className="flex flex-wrap items-center gap-2 pb-2 mb-2 border-b border-neutral-light">
        {['All Patients', 'Active', 'On-Hold', 'Completed', 'Dropped'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-all ${statusFilter === tab
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-secondary hover:bg-base-200'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <Card className="text-center py-12 w-full">
          <AlertCircle size={48} className="mx-auto mb-4 text-base-content/30" />
          <p className="text-lg font-medium text-base-content mb-2">No patients found</p>
          <p className="text-sm text-base-content/60 mb-6">
            {search ? 'Try adjusting your search' : 'Start by adding your first patient'}
          </p>
          {!search && (
            <button onClick={() => setShowAdd(true)} className="btn btn-sm rounded-lg text-white border-0 bg-primary">
              <Plus size={16} /> Add Patient
            </button>
          )}
        </Card>
      ) : viewMode === 'table' ? (
        <div className="w-full overflow-x-auto pb-4">
          <div className="min-w-[640px]">
            <Card className="!p-0">
              <table className="table w-full table-sm">
                <thead>
                  <tr className="text-xs text-base-content/70 uppercase tracking-wider">
                    <th className="font-semibold px-4 py-3">Name</th>
                    <th className="font-semibold px-4 py-3">Age</th>
                    <th className="font-semibold px-4 py-3">Phone</th>
                    <th className="font-semibold px-4 py-3">Medical History</th>
                    <th className="font-semibold text-center px-4 py-3 w-20">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-base-100 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/patients/${p._id}`} className="font-semibold text-base-content hover:text-primary transition-colors break-words line-clamp-2 max-w-[150px] sm:max-w-none">
                            {p.name}
                          </Link>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full whitespace-nowrap shrink-0 ${getStatusColor(p.status)}`}>
                            {p.status || 'Active'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-base-content/70">{p.age ? `${p.age} yrs` : '—'}</td>
                      <td className="px-4 py-3 text-base-content/70 text-sm">
                        {p.phone ? (
                          <code className="bg-base-100 px-2 py-1 rounded text-xs break-all">{p.phone}</code>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(p.medical_history || []).length > 0 ? (
                            (p.medical_history || []).slice(0, 2).map((h) => <Badge key={h} label={h} size="sm" />)
                          ) : (
                            <span className="text-xs text-base-content/50">No history</span>
                          )}
                          {(p.medical_history || []).length > 2 && (
                            <span className="text-xs bg-base-100 px-2 py-0.5 rounded-full text-base-content/60">
                              +{(p.medical_history || []).length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {p.phone && (
                            <a
                              href={getWhatsAppLink(p.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-base-content/40 hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-all duration-200"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle size={18} />
                            </a>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingPatient(p); }}
                            className="p-1.5 text-base-content/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                            title="Edit Patient"
                          >
                            <Pencil size={16} />
                          </button>
                          <Link to={`/patients/${p._id}`} className="btn btn-xs btn-ghost rounded-lg">View</Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 w-full">
          {filtered.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="w-full"
            >
              <Card className="hover:border-primary/30 transition-all group h-full flex flex-col">
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <Link to={`/patients/${p._id}`} className="block group-hover:text-primary transition-colors">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-base-content break-words">{p.name}</h3>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full whitespace-nowrap shrink-0 ${getStatusColor(p.status)}`}>
                          {p.status || 'Active'}
                        </span>
                      </div>
                    </Link>
                    <p className="text-xs text-base-content/50 break-words">{p.phone || 'No phone'}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{p.name?.[0]?.toUpperCase()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-neutral-light">
                  {p.age && (
                    <div>
                      <p className="text-xs text-base-content/60">Age</p>
                      <p className="font-semibold text-base-content">{p.age} yrs</p>
                    </div>
                  )}
                </div>

                {p.medical_history?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-base-content/60 mb-2 font-medium">Medical History</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.medical_history.slice(0, 3).map((h) => <Badge key={h} label={h} size="sm" />)}
                      {p.medical_history.length > 3 && (
                        <span className="text-xs bg-base-100 px-2 py-1 rounded-full text-base-content/60">
                          +{p.medical_history.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 w-full mt-auto pt-2">
                  {p.phone && (
                    <a
                      href={getWhatsAppLink(p.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline rounded-lg justify-center gap-2 text-base-content/60 hover:text-[#25D366] border-neutral-light hover:border-[#25D366] hover:bg-[#25D366]/10 transition-all"
                    >
                      <MessageCircle size={16} />
                    </a>
                  )}
                  <button
                    onClick={() => setEditingPatient(p)}
                    className="btn btn-sm btn-outline rounded-lg justify-center gap-2 border-neutral-light hover:border-primary hover:bg-primary/10 hover:text-primary transition-all"
                    title="Edit"
                  >
                    <Pencil size={15} /> <span className="hidden min-[380px]:inline">Edit</span>
                  </button>
                  <Link
                    to={`/patients/${p._id}`}
                    className="flex-1 btn btn-sm btn-ghost rounded-lg justify-center gap-2 text-primary hover:bg-primary/10"
                  >
                    <FileText size={16} /> <span className="hidden min-[380px]:inline ml-1">View</span>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination - Only show when no filters are active */}
      {!hasFilters && totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4 w-full">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-sm btn-ghost rounded-lg"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex flex-wrap gap-1 justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 2), Math.min(totalPages, page + 1))
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`btn btn-sm rounded-lg min-w-[40px] font-medium transition-all ${p === page ? 'bg-primary text-white border-primary' : 'btn-ghost hover:bg-base-100'
                    }`}
                >
                  {p}
                </button>
              ))}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-sm btn-ghost rounded-lg"
          >
            <ChevronRight size={16} />
          </button>

          <span className="text-xs text-base-content/60 whitespace-nowrap">
            Page {page} of {totalPages}
          </span>
        </div>
      )}

      {/* Add Patient */}
      <PatientModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        patientToEdit={null}
      />
      {/* Edit Patient */}
      <PatientModal
        open={!!editingPatient}
        onClose={() => setEditingPatient(null)}
        patientToEdit={editingPatient}
      />
    </div>
  );
}