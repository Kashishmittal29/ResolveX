import { useState } from 'react';

const stats = [
  { label: 'Total Complaints', value: '156', icon: '📋', change: '+12%', color: 'blue' },
  { label: 'Resolved', value: '89', icon: '✅', change: '+8%', color: 'green' },
  { label: 'In Progress', value: '45', icon: '🔄', change: '+5%', color: 'yellow' },
  { label: 'Pending', value: '22', icon: '⏳', change: '-3%', color: 'orange' },
];

const recentComplaints = [
  { id: 'CMP-001', title: 'Leaking faucet in room 304', category: 'Plumbing', status: 'in_progress', priority: 'medium', date: '2 hours ago' },
  { id: 'CMP-002', title: 'Broken projector in Hall A', category: 'Equipment', status: 'submitted', priority: 'high', date: '4 hours ago' },
  { id: 'CMP-003', title: 'AC not working in Library', category: 'Electrical', status: 'resolved', priority: 'urgent', date: '1 day ago' },
  { id: 'CMP-004', title: 'Cleanliness issue in Cafeteria', category: 'Cleaning', status: 'in_progress', priority: 'low', date: '2 days ago' },
];

const categories = ['Maintenance', 'Electrical', 'Plumbing', 'Cleaning', 'Security', 'Other'];

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
  const colors = {
    low: 'text-gray-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    urgent: 'text-red-400',
  };
  return colors[priority] || 'text-gray-400';
};

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredComplaints = selectedCategory === 'All' 
    ? recentComplaints 
    : recentComplaints.filter(c => c.category === selectedCategory);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Monitor and manage campus complaints in real-time</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="card-glass p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-2xl">
                  {stat.icon}
                </div>
                <span className="text-green-400 text-sm">{stat.change}</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'All' ? 'bg-primary-500 text-white' : 'bg-dark-800 text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === cat ? 'bg-primary-500 text-white' : 'bg-dark-800 text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="card-glass overflow-hidden">
          <div className="p-6 border-b border-dark-700">
            <h2 className="text-xl font-semibold text-white">Recent Complaints</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-dark-800/30 transition-colors">
                    <td className="px-6 py-4 text-primary-400 font-mono text-sm">{complaint.id}</td>
                    <td className="px-6 py-4 text-white">{complaint.title}</td>
                    <td className="px-6 py-4 text-gray-400">{complaint.category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`px-6 py-4 font-medium ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{complaint.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

