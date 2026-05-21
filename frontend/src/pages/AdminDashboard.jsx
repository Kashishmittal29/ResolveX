import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    department: '',
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchComplaints();
    if (user?.role === 'admin') fetchStats();
  }, [filters, user?.role]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/analytics/overview');
      setStats(res.data.stats);
    } catch {
      setStats(null);
    }
  };

  const fetchComplaints = async () => {
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v)
      );
      const res = await api.get('/complaints', { params });
      setComplaints(res.data.complaints);
    } catch (err) {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  return (
    <div className="max-w-5xl space-y-5">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total',       value: stats.total,      color: 'text-surface-900' },
            { label: 'Pending',     value: stats.pending,    color: 'text-warning' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-info' },
            { label: 'Resolved',    value: stats.resolved,   color: 'text-success' },
            { label: 'Escalated',   value: stats.escalated,  color: 'text-danger' },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <p className="text-2xs font-semibold text-surface-400 uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 tabular-nums ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters + action */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {[
            { key: 'status', options: ['PENDING','IN_PROGRESS','RESOLVED','ESCALATED'], label: 'Status' },
            { key: 'category', options: ['ELECTRICAL','PLUMBING','HVAC','IT_SUPPORT','SECURITY','OTHER'], label: 'Category' },
            { key: 'priority', options: ['LOW','MEDIUM','HIGH','CRITICAL'], label: 'Priority' },
          ].map(({ key, options, label }) => (
            <select key={key} value={filters[key]} onChange={(e) => handleFilter(key, e.target.value)}
              className="input-field w-auto text-xs py-1.5 px-2.5">
              <option value="">All {label}</option>
              {options.map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
            </select>
          ))}
        </div>
        {user?.role === 'admin' && (
          <Link to="/analytics" className="btn-secondary text-xs px-3 py-1.5 gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z"/>
            </svg>
            Analytics
          </Link>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 w-full rounded-xl"/>)}
        </div>
      ) : complaints.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-surface-700">No complaints found</p>
          <p className="text-xs text-surface-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>ID / Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Submitted by</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id} className="cursor-pointer" onClick={() => window.location.href = `/complaint/${c._id}`}>
                  <td>
                    <span className="text-2xs font-mono text-surface-400">#{c.complaintId}</span>
                    <p className="font-medium text-surface-900 text-xs mt-0.5 truncate max-w-xs">{c.title}</p>
                  </td>
                  <td><span className="text-xs text-surface-500">{c.category?.replace('_',' ')}</span></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td><PriorityBadge priority={c.priority} /></td>
                  <td><span className="text-xs text-surface-600">{c.submittedBy?.name}</span></td>
                  <td><span className="text-xs text-surface-400">{new Date(c.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
