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
    <div>
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'bg-primary-100 text-primary-800' },
            { label: 'Pending', value: stats.pending, color: 'bg-amber-100 text-amber-800' },
            { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-100 text-blue-800' },
            { label: 'Resolved', value: stats.resolved, color: 'bg-green-100 text-green-800' },
            { label: 'Escalated', value: stats.escalated, color: 'bg-red-100 text-red-800' },
          ].map((s) => (
            <div key={s.label} className={`card p-4 ${s.color} rounded-lg`}>
              <p className="text-sm font-medium opacity-90">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Complaints</h2>
        <Link to="/analytics" className="btn-secondary">
          View Analytics
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <select
          value={filters.status}
          onChange={(e) => handleFilter('status', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="ESCALATED">Escalated</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) => handleFilter('category', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All Categories</option>
          <option value="ELECTRICAL">Electrical</option>
          <option value="PLUMBING">Plumbing</option>
          <option value="HVAC">HVAC</option>
          <option value="IT_SUPPORT">IT Support</option>
          <option value="SECURITY">Security</option>
          <option value="OTHER">Other</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => handleFilter('priority', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>
        <select
          value={filters.department}
          onChange={(e) => handleFilter('department', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All Departments</option>
          <option value="ELECTRICAL">Electrical</option>
          <option value="PLUMBING">Plumbing</option>
          <option value="HVAC">HVAC</option>
          <option value="IT_SUPPORT">IT Support</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500 text-lg">No complaints match your filters.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {complaints.map((c) => (
            <Link
              key={c._id}
              to={`/complaint/${c._id}`}
              className="card p-4 hover:shadow-lg transition-shadow block"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="text-sm text-gray-500 font-mono">#{c.complaintId}</span>
                  <h3 className="font-semibold text-gray-900 mt-1">{c.title}</h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{c.description}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    {c.location} • {c.category} • By {c.submittedBy?.name}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm text-gray-500">
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                {c.assignedTo ? (
                  <span>Assigned to {c.assignedTo.name}</span>
                ) : (
                  <span className="text-amber-600">Unassigned</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
