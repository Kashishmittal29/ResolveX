import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import toast from 'react-hot-toast';
import ResolveAI from '../components/ResolveAI';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [filter]);

  const fetchComplaints = async () => {
    try {
      const params = filter ? { status: filter } : {};
      const res = await api.get('/complaints', { params });
      setComplaints(res.data.complaints);
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3].map(i => <div key={i} className="skeleton h-24 w-full rounded-xl"/>)}
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-surface-900">My Complaints</h2>
          <p className="text-xs text-surface-400 mt-0.5">{complaints.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="input-field w-auto text-xs py-1.5 px-2.5">
            <option value="">All status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ESCALATED">Escalated</option>
          </select>
          <Link to="/complaint/new" className="btn-primary text-xs px-3 py-1.5 gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            New
          </Link>
        </div>
      </div>

      {complaints.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-surface-700">No complaints yet</p>
          <p className="text-xs text-surface-400 mt-1 mb-4">Submit your first complaint to get started</p>
          <Link to="/complaint/new" className="btn-primary text-xs px-4 py-2">Submit a complaint</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {complaints.map((c) => (
            <Link key={c._id} to={`/complaint/${c._id}`} className="card-hover block p-4 group">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xs font-mono text-surface-400">#{c.complaintId}</span>
                    <span className="text-2xs text-surface-300">·</span>
                    <span className="text-2xs text-surface-400">{c.category?.replace('_', ' ')}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-surface-900 group-hover:text-primary-700 transition-colors truncate">
                    {c.title}
                  </h3>
                  <p className="text-xs text-surface-500 mt-1 line-clamp-1">{c.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100">
                <span className="text-2xs text-surface-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
                  </svg>
                  {c.location}
                </span>
                <div className="flex items-center gap-3 text-2xs text-surface-400">
                  {c.assignedTo && <span>→ {c.assignedTo.name}</span>}
                  <span>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ResolveAI floating assistant — navigates to the complaint form with pre-filled data */}
      <ResolveAI
        onPrefill={(data) =>
          navigate('/complaint/new', { state: { prefill: data } })
        }
      />
    </div>
  );
}
