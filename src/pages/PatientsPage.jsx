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
<<<<<<< Updated upstream
=======
  Info,
  X,
  CalendarDays,
  Phone,
  Calendar,
  Trash2,
  Clock,
  ArrowUpDown,
>>>>>>> Stashed changes
} from 'lucide-react';
import { usePatients, useDeletePatient } from '../hooks/usePatients';
import { useClinics } from '../hooks/useClinics';
import { calculateAge } from '../utils/dateUtils';
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
  const [sortBy, setSortBy] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('All Patients');
  const [clinicFilter, setClinicFilter] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);

  const { data: clinicsData } = useClinics();
  const clinics = Array.isArray(clinicsData) ? clinicsData : clinicsData?.clinics || [];

  const getWhatsAppLink = (phone) => {
    if (!phone) return null;
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('01')) {
      cleanPhone = '2' + cleanPhone;
    }
    return `https://api.whatsapp.com/send/?phone=${cleanPhone}`;
  };

  // Reset to page 1 when filters change
  const hasFilters = Boolean(search || statusFilter !== 'All Patients' || clinicFilter || dateFrom || dateTo);
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, clinicFilter, dateFrom, dateTo]);

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
  const { mutate: deletePatient, isPending: isDeleting } = useDeletePatient();
  const patients = data?.patients || [];
  const totalPages = data?.totalPages || 1;
  const totalPatients = data?.totalPatients || 0;

  const handleDeletePatient = (e, patient) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete patient "${patient.name}"? This action cannot be undone.`)) {
      deletePatient(patient._id);
    }
  };

  // Text search — name, phone, address, job, insurance, medical fields only
  let filtered = search
<<<<<<< Updated upstream
    ? patients.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search)
    )
=======
    ? patients.filter((p) => {
      const term = search.toLowerCase();
      if (p.name?.toLowerCase().includes(term)) return true;
      if (p.phone?.toLowerCase().includes(term)) return true;
      if (p.phone2?.toLowerCase().includes(term)) return true;
      if (p.address?.toLowerCase().includes(term)) return true;
      if (p.job?.toLowerCase().includes(term)) return true;
      if (p.insuranceCompany?.toLowerCase().includes(term)) return true;
      if (p.medical_history?.some((h) => h.toLowerCase().includes(term))) return true;
      return false;
    })
>>>>>>> Stashed changes
    : patients;

  // Date filter — specific date or date range
  if (dateFrom || dateTo) {
    filtered = filtered.filter((p) => {
      if (!p.createdAt) return false;
      const created = new Date(p.createdAt);
      // Normalize to start of day for comparison
      created.setHours(0, 0, 0, 0);

      if (dateFrom && dateTo) {
        const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
        const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
        return created >= from && created <= to;
      }
      if (dateFrom) {
        const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
        // If only "from" is set, match that exact day
        const endOfDay = new Date(dateFrom); endOfDay.setHours(23, 59, 59, 999);
        return created >= from && created <= endOfDay;
      }
      if (dateTo) {
        const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
        return created <= to;
      }
      return true;
    });
  }

  filtered = filtered.filter((p) => {
    if (statusFilter === 'All Patients') return true;
    return (p.status || 'Active') === statusFilter;
  });


  filtered = filtered.sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'age') {
      const ageA = a.dateOfBirth ? calculateAge(a.dateOfBirth) : (a.age || 0);
      const ageB = b.dateOfBirth ? calculateAge(b.dateOfBirth) : (b.age || 0);
      return ageA - ageB;
    }
    return 0;
  });

  const stats = useMemo(() => ({
    total: totalPatients,
  }), [totalPatients]);

  if (isLoading) return <PatientsListSkeleton />;
  if (isError) return <ErrorState error={error} refetch={refetch} />;

  return (
    <div className="flex flex-col gap-6 w-full overflow-x-hidden pb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-base-content">Patients</h1>
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold">
              Total Patients: {stats.total}
            </span>
          </div>
          <p className="text-base-content/70 text-sm mt-0.5">
            Manage and track all your patient records
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 w-full">
        {/* Text Search */}
        <label className="input input-bordered rounded-lg flex items-center gap-2 bg-base-200 w-full border-neutral-light">
          <Search size={16} className="text-base-content/50 shrink-0" />
          <input
<<<<<<< Updated upstream
            placeholder="Search by name or phone…"
=======
            placeholder="Search by name, phone, address, job, insurance…"
>>>>>>> Stashed changes
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

        {/* Date Filter — always visible */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 p-4 bg-base-200 rounded-xl border border-neutral-light">
          <div className="flex items-center gap-1.5 text-base-content/60 shrink-0 self-center sm:self-end sm:pb-2">
            <CalendarDays size={16} />
            <span className="text-xs font-semibold">Date</span>
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-xs font-semibold text-base-content/60 mb-1 block">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input input-sm input-bordered w-full rounded-lg bg-base-100"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-xs font-semibold text-base-content/60 mb-1 block">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || undefined}
              className="input input-sm input-bordered w-full rounded-lg bg-base-100"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="btn btn-sm btn-ghost text-error rounded-lg gap-1 shrink-0"
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-stretch gap-3 w-full">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Clinic filter dropdown */}
            <div className="relative flex items-center w-full sm:w-auto min-w-[160px]">
              <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors ${clinicFilter ? 'text-primary' : 'text-base-content/40'}`}>
                <Building2 size={16} />
              </div>
              <select
                value={clinicFilter}
                onChange={(e) => setClinicFilter(e.target.value)}
<<<<<<< Updated upstream
                className={`select select-sm select-bordered rounded-lg bg-base-200 border-neutral-light pl-8 w-full sm:w-auto focus:border-primary transition-all ${
                  clinicFilter ? 'border-primary text-primary' : ''
                }`}
=======
                className={`select select-sm h-10 select-bordered rounded-xl bg-base-100/50 hover:bg-base-200/50 border-neutral-light/50 pl-10 pr-8 w-full font-semibold focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm appearance-none cursor-pointer ${clinicFilter ? 'border-primary text-primary bg-primary/5' : 'text-base-content/70'
                  }`}
>>>>>>> Stashed changes
              >
                <option value="">All Clinics</option>
                {clinics.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Sort filter */}
            <div className="relative flex items-center w-full sm:w-auto min-w-[190px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-base-content/40">
                <ArrowUpDown size={16} />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select select-sm h-10 select-bordered rounded-xl bg-base-100/50 hover:bg-base-200/50 border-neutral-light/50 pl-10 pr-8 w-full font-semibold focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm appearance-none cursor-pointer text-base-content/70"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="age">Sort: Age (Low to High)</option>
              </select>
            </div>
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
                    <th className="font-semibold px-4 py-3">Medical History & Drugs</th>
                    <th className="font-semibold px-4 py-3">Added On</th>
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
                      <td className="px-4 py-3 text-base-content/70">
                        {p.dateOfBirth || p.age != null ? `${p.dateOfBirth ? calculateAge(p.dateOfBirth) : p.age} yrs` : '—'}
                      </td>
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
                      <td className="px-4 py-3 text-base-content/60 text-xs whitespace-nowrap">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
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
<<<<<<< Updated upstream
                          <Link to={`/patients/${p._id}`} className="btn btn-xs btn-ghost rounded-lg">View</Link>
=======
                          <button
                            onClick={(e) => handleDeletePatient(e, p)}
                            disabled={isDeleting}
                            className="p-1.5 text-base-content/40 hover:text-error hover:bg-error/10 rounded-lg transition-all duration-200"
                            title="Delete Patient"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setViewingPatient(p); }}
                            className="p-1.5 text-base-content/40 hover:text-sky-500 hover:bg-sky-500/10 rounded-lg transition-all duration-200"
                            title="Quick Info"
                          >
                            <Info size={16} />
                          </button>
                          <Link to={`/patients/${p._id}`} className="btn btn-xs btn-ghost rounded-lg">Profile</Link>
>>>>>>> Stashed changes
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
              <Card className="hover:border-primary/50 transition-all duration-300 group h-full flex flex-col p-0 overflow-hidden border-neutral-light/30">
                <div className="flex flex-1">
                  {/* Status Vertical Bar */}
                  <div className={`w-1.5 ${getStatusColor(p.status).split(' ')[0].replace('/10', '')} shrink-0 opacity-80`} />

                  <div className="flex-1 p-5 flex flex-col">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-4 gap-4">
                      <div className="flex-1 min-w-0">
                        <Link to={`/patients/${p._id}`} className="block group-hover:text-primary transition-colors min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5 min-w-0">
                            <h3 className="font-bold text-lg text-base-content tracking-tight leading-tight break-words min-w-0 flex-1">{p.name}</h3>
                            <span className={`px-2 py-0.5 text-[9px] uppercase font-black rounded-md whitespace-nowrap shrink-0 tracking-wider ring-1 ring-inset ring-current/20 ${getStatusColor(p.status)}`}>
                              {p.status || 'Active'}
                            </span>
                          </div>
                        </Link>
                        <div className="flex flex-col gap-1.5 mt-2">
                          <div className="flex items-center gap-1.5 text-xs text-base-content/50 group-hover:text-base-content/70 transition-colors">
                            <Phone size={12} className="shrink-0" />
                            <span className="font-semibold">{p.phone || 'No phone'}</span>
                            {p.phone2 && <span className="opacity-50 text-[10px]">• {p.phone2}</span>}
                          </div>
                          {p.createdAt && (
                            <div className="flex items-center gap-1.5 text-xs text-base-content/40 transition-colors">
                              <Clock size={12} className="shrink-0" />
                              <span>Joined {new Date(p.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                            </div>
                          )}
                        </div>
                      </div>
<<<<<<< Updated upstream
                    </Link>
                    <p className="text-xs text-base-content/50 break-words">{p.phone || 'No phone'}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{p.name?.[0]?.toUpperCase()}</span>
                  </div>
                </div>
=======
                    </div>
>>>>>>> Stashed changes

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-5 p-3 rounded-xl bg-base-100/40 border border-neutral-light/20">
                      <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-success/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-success/20 transition-all hover:scale-[1.02]">
                        <Calendar className="text-success mb-1" size={16} />
                        <p className="text-[9px] text-success/70 uppercase tracking-widest font-black">Age</p>
                        <p className="font-black text-[15px] sm:text-sm text-success tracking-tight mt-0.5">
                          {p.dateOfBirth || p.age != null ? `${p.dateOfBirth ? calculateAge(p.dateOfBirth) : p.age}` : '--'} <span className="text-[9px] font-bold opacity-60 uppercase tracking-wide">Yrs</span>
                        </p>
                      </div>

                      {p.clinic_id?.name ? (
                        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-primary/5 dark:bg-primary/10 shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-primary/10 dark:border-primary/20 transition-all hover:scale-[1.02]">
                          <Building2 className="text-primary mb-1" size={16} />
                          <p className="text-[9px] text-primary/70 uppercase tracking-widest font-black">Clinic</p>
                          <p className="font-black text-[15px] sm:text-sm text-primary text-center truncate w-full px-1 tracking-tight mt-0.5">
                            {p.clinic_id.name}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-base-100/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] border border-neutral-light/20 transition-all hover:scale-[1.02]">
                          <Building2 className="text-base-content/30 mb-1" size={16} />
                          <p className="text-[9px] text-base-content/40 uppercase tracking-widest font-black">Clinic</p>
                          <p className="font-black text-[15px] sm:text-sm text-base-content/40 tracking-tight mt-0.5">--</p>
                        </div>
                      )}
                    </div>

<<<<<<< Updated upstream
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
=======
                    {/* Medical History Section */}
                    {/* {p.medical_history?.length > 0 && (
                      <div className="mb-6">
                        <p className="text-[10px] uppercase font-bold text-base-content/40 mb-2 tracking-widest">Medical History</p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.medical_history.slice(0, 3).map((h) => (
                            <span key={h} className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-base-200 text-base-content/70 border border-neutral-light/50">
                               {h}
                            </span>
                          ))}
                          {p.medical_history.length > 3 && (
                            <span className="text-[10px] font-bold text-primary/60 bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">
                              +{p.medical_history.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )} */}

                    {/* Actions Row */}
                    <div className="flex gap-2 w-full mt-auto">
                      {p.phone && (
                        <a
                          href={getWhatsAppLink(p.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-base-200/50 hover:bg-[#25D366]/10 text-base-content/40 hover:text-[#25D366] border border-neutral-light/50 hover:border-[#25D366]/30 transition-all active:scale-90"
                          title="WhatsApp"
                        >
                          <WhatsAppIcon size={18} />
                        </a>
                      )}
                      <button
                        onClick={() => setViewingPatient(p)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-base-200/50 hover:bg-sky-500/10 text-base-content/40 hover:text-sky-500 border border-neutral-light/50 hover:border-sky-500/30 transition-all active:scale-90"
                        title="Quick View"
                      >
                        <Info size={18} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingPatient(p); }}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-base-200/50 hover:bg-primary/10 text-base-content/40 hover:text-primary border border-neutral-light/50 hover:border-primary/30 transition-all active:scale-90"
                        title="Edit Details"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={(e) => handleDeletePatient(e, p)}
                        disabled={isDeleting}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-base-200/50 hover:bg-error/10 text-base-content/40 hover:text-error border border-neutral-light/50 hover:border-error/30 transition-all active:scale-90"
                        title="Delete Patient"
                      >
                        <Trash2 size={18} />
                      </button>
                      <Link
                        to={`/patients/${p._id}`}
                        className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-focus text-white font-bold text-xs transition-all active:scale-95 px-3"
                      >
                        <FileText size={16} />
                        <span>Profile</span>
                      </Link>
                    </div>
                  </div>
>>>>>>> Stashed changes
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