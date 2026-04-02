import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
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
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Complaints</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ESCALATED">Escalated</option>
          </select>
          <Link to="/complaint/new" className="btn-primary">
            + New Complaint
          </Link>
        </div>
      </div>

      {complaints.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500 text-lg">No complaints yet.</p>
          <Link to="/complaint/new" className="btn-primary mt-4 inline-block">
            Submit Your First Complaint
          </Link>
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
                  <p className="text-gray-500 text-xs mt-2">{c.location} • {c.category}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <StatusBadge status={c.status} />
                  <PriorityBadge priority={c.priority} />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm text-gray-500">
                <span>Submitted {new Date(c.createdAt).toLocaleDateString()}</span>
                {c.assignedTo && (
                  <span>Assigned to {c.assignedTo.name}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
