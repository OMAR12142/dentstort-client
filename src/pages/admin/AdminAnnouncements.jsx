import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Plus, Trash2, ToggleLeft, ToggleRight, 
  Send, AlertCircle, Clock, Info, CheckCircle, 
  AlertTriangle, Megaphone
} from 'lucide-react';
import { 
  useAdminAnnouncements, 
  useCreateAnnouncement, 
  useToggleAnnouncement, 
  useDeleteAnnouncement 
} from '../../hooks/useAdmin';
import Card from '../../components/Card';
import { CardSkeleton } from '../../components/Skeleton';
import toast from 'react-hot-toast';

export default function AdminAnnouncements() {
  const { data: announcements, isLoading } = useAdminAnnouncements();
  const createMutation = useCreateAnnouncement();
  const toggleMutation = useToggleAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'banner',
    severity: 'info',
    displayFrequency: 'session',
    expiresAt: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Please fill in title and content');
      return;
    }

    // Clean data: remove empty strings to avoid validation errors
    const cleanedData = { ...formData };
    if (!cleanedData.expiresAt) delete cleanedData.expiresAt;

    createMutation.mutate(cleanedData, {
      onSuccess: () => {
        toast.success('Announcement broadcasted!');
        setIsFormVisible(false);
        setFormData({ title: '', content: '', type: 'banner', severity: 'info', displayFrequency: 'session', expiresAt: '' });
      }
    });
  };

  const getSeverityIcon = (sev) => {
    switch (sev) {
      case 'success': return <CheckCircle className="text-emerald-500" size={16} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={16} />;
      case 'error': return <AlertCircle className="text-rose-500" size={16} />;
      default: return <Info className="text-sky-500" size={16} />;
    }
  };

  if (isLoading) return <CardSkeleton count={3} />;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-base-content">System Broadcast Center</h1>
          <p className="text-sm text-base-content/70">Communicate directly with all clinicians on the platform.</p>
        </div>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="btn btn-primary rounded-xl flex items-center gap-2"
        >
          {isFormVisible ? 'Cancel' : <><Plus size={18} /> New Broadcast</>}
        </button>
      </div>

      <AnimatePresence>
        {isFormVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 border-l-4 border-l-primary">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label text-[10px] uppercase font-black tracking-widest text-base-content/50">Banner Title</label>
                    <input
                      type="text"
                      placeholder="e.g. System Update"
                      className="input input-bordered w-full rounded-xl"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="label text-[10px] uppercase font-black tracking-widest text-base-content/50">Status Type</label>
                    <select 
                      className="select select-bordered w-full rounded-xl uppercase font-bold text-xs"
                      value={formData.severity}
                      onChange={e => setFormData({...formData, severity: e.target.value})}
                    >
                      <option value="info">Info (Blue)</option>
                      <option value="success">Success (Green)</option>
                      <option value="warning">Warning (Orange)</option>
                      <option value="error">Critical (Red)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-[10px] uppercase font-black tracking-widest text-base-content/50">Frequency</label>
                    <select 
                      className="select select-bordered w-full rounded-xl uppercase font-bold text-xs"
                      value={formData.displayFrequency}
                      onChange={e => setFormData({...formData, displayFrequency: e.target.value})}
                    >
                      <option value="session">Every Login Session</option>
                      <option value="once">Once (Until Dismissed)</option>
                      <option value="always">Always (Strict)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label text-[10px] uppercase font-black tracking-widest text-base-content/50">Broadcast Message</label>
                  <textarea
                    placeholder="Wrtie your announcement message here..."
                    className="textarea textarea-bordered w-full rounded-xl h-24"
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button type="submit" disabled={createMutation.isPending} className="btn btn-primary px-8 rounded-xl">
                    {createMutation.isPending ? 'Sending...' : <><Send size={16} /> Broadcast Now</>}
                  </button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <h2 className="text-[10px] uppercase font-black tracking-[0.2em] text-base-content/40 flex items-center gap-2">
          <Megaphone size={14} /> Active & Past Broadcasts
        </h2>

        {announcements?.length === 0 ? (
          <div className="text-center py-20 bg-base-200/50 rounded-[2.5rem] border border-dashed border-base-content/10">
            <Bell size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-base-content/40 font-medium">No announcements yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {announcements?.map(ann => (
              <Card key={ann._id} className={`p-5 transition-all ${!ann.isActive ? 'opacity-60 grayscale' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${ann.isActive ? 'bg-primary/10 text-primary' : 'bg-base-content/5'}`}>
                      <Info size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {getSeverityIcon(ann.severity)}
                        <h3 className="font-bold text-base-content uppercase text-xs tracking-widest">{ann.title}</h3>
                        <span className="badge badge-sm rounded-md font-bold bg-base-content/5 text-[9px] uppercase tracking-tighter opacity-70">
                          {ann.displayFrequency === 'once' ? 'Once Forever' : ann.displayFrequency === 'session' ? 'Per Session' : 'Always'}
                        </span>
                        {!ann.isActive && <span className="badge badge-sm rounded-md font-bold opacity-50 uppercase tracking-tighter">Inactive</span>}
                      </div>
                      <p className="text-sm text-base-content/80 max-w-2xl">{ann.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Clock size={10} /> {new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleMutation.mutate(ann._id)}
                      className="btn btn-ghost btn-sm px-2 text-primary hover:bg-primary/5 rounded-lg"
                      title={ann.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {ann.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <button
                      onClick={() => {
                        if(confirm('Delete this broadcast permanently?')) deleteMutation.mutate(ann._id);
                      }}
                      className="btn btn-ghost btn-sm px-2 text-rose-500 hover:bg-rose-500/5 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
