import { useState } from 'react';

const myComplaints = [
  { id: 'CMP-001', title: 'Leaking faucet in room 304', category: 'Plumbing', status: 'in_progress', priority: 'medium', date: '2024-01-15', updatedAt: '2 hours ago' },
  { id: 'CMP-002', title: 'Broken projector in Hall A', category: 'Equipment', status: 'submitted', priority: 'high', date: '2024-01-14', updatedAt: '1 day ago' },
  { id: 'CMP-003', title: 'AC not working in Library', category: 'Electrical', status: 'resolved', priority: 'urgent', date: '2024-01-10', updatedAt: '3 days ago' },
  { id: 'CMP-004', title: 'WiFi issues in Hostel B', category: 'Infrastructure', status: 'closed', priority: 'low', date: '2024-01-05', updatedAt: '1 week ago' },
];

const getStatusColor = (status) => {
  const colors = {
    submitted: 'bg-blue-500/20 text-blue-400',
    acknowledged: 'bg-yellow-500/20 text-yellow-400',
    in_progress: 'bg-purple-500/20 text-purple-400',
    resolved: 'bg-green-500/20 text-green-400',
    closed: 'bg-gray-500/20 text-gray-400',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400';
};

const getPriorityColor = (priority) => {
  const colors = { low: 'text-gray-400', medium: 'text-yellow-400', high: 'text-orange-400', urgent: 'text-red-400' };
  return colors[priority] || 'text-gray-400';
};

export default function MyComplaints() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = myComplaints.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Complaints</h1>
          <p className="text-gray-400">Track the status of your submitted complaints</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark flex-1"
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-dark">
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="space-y-4">
          {filtered.map((complaint) => (
            <div key={complaint.id} className="card-glass p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-primary-400 font-mono text-sm">{complaint.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(complaint.status)}`}>
                      {complaint.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-white">{complaint.title}</h3>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span>📁 {complaint.category}</span>
                <span>📅 {complaint.date}</span>
                <span>🔄 {complaint.updatedAt}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">No complaints found</div>
          )}
        </div>
      </div>
    </div>
  );
}

