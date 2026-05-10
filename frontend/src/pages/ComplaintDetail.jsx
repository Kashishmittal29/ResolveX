import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [staff, setStaff] = useState([]);
  const [updating, setUpdating] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  useEffect(() => {
    fetchComplaint();
    if (isAdmin) fetchStaff();
  }, [id, isAdmin]);

  const fetchComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.complaint);
      setStatus(res.data.complaint.status);
      setAssignedTo(res.data.complaint.assignedTo?._id || '');
    } catch (err) {
      toast.error('Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/users/staff').catch(() => api.get('/users'));
      setStaff(res.data?.staff || res.data?.users || []);
    } catch {
      setStaff([]);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.patch(`/complaints/${id}`, {
        status: status || undefined,
        assignedTo: assignedTo || undefined,
      });
      toast.success('Updated');
      fetchComplaint();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !complaint) {
    return (
      <div className="max-w-3xl space-y-3">
        <div className="skeleton h-6 w-32 rounded"/>
        <div className="skeleton h-48 w-full rounded-xl"/>
        <div className="skeleton h-32 w-full rounded-xl"/>
      </div>
    );
  }

  const timelineStatusColors = {
    PENDING: 'bg-warning', IN_PROGRESS: 'bg-info', RESOLVED: 'bg-success', ESCALATED: 'bg-danger',
  };

  return (
    <div className="max-w-3xl space-y-4">
      <Link to={user?.role === 'student' ? '/dashboard' : '/admin'}
        className="inline-flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-900 transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
        </svg>
        Back
      </Link>

      {/* Header card */}
      <div className="card">
        <div className="card-section">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="text-2xs font-mono text-surface-400">#{complaint.complaintId}</span>
              <h2 className="text-base font-semibold text-surface-900 mt-1">{complaint.title}</h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
                <span className="badge bg-surface-100 text-surface-600">{complaint.category?.replace('_',' ')}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xs text-surface-400">{new Date(complaint.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
              {complaint.slaDeadline && (
                <p className="text-2xs text-surface-400 mt-0.5">SLA: {new Date(complaint.slaDeadline).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</p>
              )}
            </div>
          </div>
        </div>

        <div className="card-section grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-1">Description</p>
            <p className="text-sm text-surface-700 leading-relaxed">{complaint.description}</p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-1">Location</p>
              <p className="text-sm text-surface-700">{complaint.location}</p>
            </div>
            {complaint.assignedTo && (
              <div>
                <p className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-1">Assigned to</p>
                <p className="text-sm text-surface-700">{complaint.assignedTo.name}
                  <span className="text-surface-400 ml-1">· {complaint.assignedTo.department}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {complaint.image && (
          <div className="card-section">
            <p className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Attachment</p>
            <img src={complaint.image} alt="Complaint" className="max-w-sm rounded-lg border border-surface-200 shadow-sm" />
          </div>
        )}
      </div>

      {/* Admin controls */}
      {isAdmin && (
        <div className="card p-5">
          <p className="text-xs font-semibold text-surface-700 mb-4">Update complaint</p>
          <form onSubmit={handleUpdate} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-2xs text-surface-500 mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field text-xs w-36">
                {['PENDING','IN_PROGRESS','RESOLVED','ESCALATED'].map(s => (
                  <option key={s} value={s}>{s.replace('_',' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-2xs text-surface-500 mb-1">Assign to</label>
              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="input-field text-xs w-44">
                <option value="">Unassigned</option>
                {staff.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} · {s.department}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={updating} className="btn-primary text-xs px-4 py-2">
              {updating ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>
      )}

      {/* Timeline */}
      <div className="card p-5">
        <p className="text-xs font-semibold text-surface-700 mb-4">Activity timeline</p>
        <div className="relative">
          <div className="absolute left-[5px] top-2 bottom-2 w-px bg-surface-200"/>
          <div className="space-y-4">
            {complaint.timeline?.map((t, i) => (
              <div key={i} className="flex gap-3 relative">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 z-10 ${timelineStatusColors[t.status] || 'bg-surface-300'}`}/>
                <div className="pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-surface-800">{t.status?.replace('_',' ')}</span>
                    <span className="text-2xs text-surface-400">{t.updatedBy?.name || 'System'}</span>
                  </div>
                  {t.note && <p className="text-xs text-surface-500 mt-0.5">{t.note}</p>}
                  <p className="text-2xs text-surface-400 mt-0.5">{new Date(t.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
