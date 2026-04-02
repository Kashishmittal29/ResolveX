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
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <Link to={user?.role === 'student' ? '/dashboard' : '/admin'} className="text-primary-600 hover:underline mb-4 inline-block">
        ← Back
      </Link>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <span className="text-sm text-gray-500 font-mono">#{complaint.complaintId}</span>
              <h2 className="text-xl font-bold text-gray-900 mt-1">{complaint.title}</h2>
              <div className="flex gap-2 mt-2">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
                <span className="badge bg-gray-100">{complaint.category}</span>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Submitted {new Date(complaint.createdAt).toLocaleString()}</p>
              {complaint.slaDeadline && (
                <p>SLA: {new Date(complaint.slaDeadline).toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-medium text-gray-700">Description</h3>
            <p className="text-gray-600 mt-1">{complaint.description}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Location</h3>
            <p className="text-gray-600">{complaint.location}</p>
          </div>
          {complaint.image && (
            <div>
              <h3 className="font-medium text-gray-700">Image</h3>
              <img
                src={complaint.image}
                alt="Complaint"
                className="mt-2 max-w-md rounded-lg border"
              />
            </div>
          )}
          {complaint.assignedTo && (
            <div>
              <h3 className="font-medium text-gray-700">Assigned To</h3>
              <p className="text-gray-600">{complaint.assignedTo.name} ({complaint.assignedTo.department})</p>
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="p-6 bg-gray-50 border-t">
            <h3 className="font-medium text-gray-900 mb-4">Update Complaint</h3>
            <form onSubmit={handleUpdate} className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-field w-40"
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="ESCALATED">Escalated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Assign To</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="input-field w-48"
                >
                  <option value="">Unassigned</option>
                  {staff.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.department})
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={updating} className="btn-primary">
                {updating ? 'Updating...' : 'Update'}
              </button>
            </form>
          </div>
        )}

        <div className="p-6 border-t border-gray-100">
          <h3 className="font-medium text-gray-900 mb-4">Timeline</h3>
          <div className="space-y-3">
            {complaint.timeline?.map((t, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">{t.status}</p>
                  <p className="text-gray-600 text-sm">{t.note}</p>
                  <p className="text-gray-400 text-xs">
                    {t.updatedBy?.name || 'System'} • {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
