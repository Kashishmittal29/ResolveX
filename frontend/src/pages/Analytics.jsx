import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [byCategory, setByCategory] = useState([]);
  const [byPriority, setByPriority] = useState([]);
  const [trends, setTrends] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [deptPerf, setDeptPerf] = useState([]);
  const [frequent, setFrequent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [o, c, p, t, ph, dp, f] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/by-category'),
        api.get('/analytics/by-priority'),
        api.get('/analytics/trends'),
        api.get('/analytics/peak-hours'),
        api.get('/analytics/department-performance'),
        api.get('/analytics/frequent-issues'),
      ]);
      setOverview(o.data.stats);
      setByCategory(c.data.data);
      setByPriority(p.data.data);
      setTrends(t.data.data);
      setPeakHours(ph.data.data);
      setDeptPerf(dp.data.data);
      setFrequent(f.data.data);
    } catch (err) {
      toast.error('Failed to load analytics');
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
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>

      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: overview.total },
            { label: 'Pending', value: overview.pending },
            { label: 'In Progress', value: overview.inProgress },
            { label: 'Resolved', value: overview.resolved },
            { label: 'Escalated', value: overview.escalated },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <p className="text-sm text-gray-600">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Complaints by Category</h3>
          {byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ _id, count }) => `${_id}: ${count}`}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Complaints by Priority</h3>
          {byPriority.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byPriority}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data</p>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Complaint Trends (Last 30 Days)</h3>
        {trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} name="Complaints" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">No data</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Peak Submission Hours</h3>
          {peakHours.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={peakHours}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data</p>
          )}
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Department Performance</h3>
          {deptPerf.length > 0 ? (
            <div className="space-y-2">
              {deptPerf.map((d) => (
                <div key={d._id} className="flex justify-between items-center">
                  <span className="font-medium">{d._id}</span>
                  <span className="text-sm text-gray-600">
                    {d.resolved}/{d.total} ({d.resolutionRate?.toFixed(1)}%)
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No data</p>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Predictive: Frequently Reported Issues</h3>
        <p className="text-sm text-gray-600 mb-4">Locations with repeated issues - consider preventive maintenance</p>
        {frequent.length > 0 ? (
          <div className="space-y-3">
            {frequent.map((f, i) => (
              <div key={i} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{f._id?.category} - {f._id?.location}</p>
                  <p className="text-sm text-gray-600">Reported {f.count} times</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No repeated issues found</p>
        )}
      </div>
    </div>
  );
}
