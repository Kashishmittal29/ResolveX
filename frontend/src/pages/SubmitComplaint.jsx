import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const CATEGORIES = [
  'ELECTRICAL', 'PLUMBING', 'HVAC', 'INFRASTRUCTURE', 'CLEANLINESS',
  'SECURITY', 'IT_SUPPORT', 'LIBRARY', 'CAFETERIA', 'TRANSPORT', 'OTHER',
];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'OTHER',
    location: '',
    priority: 'MEDIUM',
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggested, setSuggested] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if ((e.target.name === 'title' || e.target.name === 'description') && (form.title || form.description)) {
      classifyPreview();
    }
  };

  const classifyPreview = async () => {
    const text = `${form.title} ${form.description}`.trim();
    if (text.length < 5) return;
    try {
      const res = await api.post('/complaints/classify', {
        title: form.title,
        description: form.description,
      });
      setSuggested(res.data);
    } catch {
      setSuggested(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      toast.error('Please fill required fields');
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      const res = await api.post('/complaints', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Complaint submitted successfully');
      navigate(`/complaint/${res.data.complaint._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = () => {
    if (suggested) {
      setForm((f) => ({
        ...f,
        category: suggested.category,
        priority: suggested.priority,
      }));
      toast.success('Applied AI suggestion');
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit a Complaint</h2>

      {suggested && (
        <div className="card p-4 mb-6 bg-primary-50 border-primary-200">
          <p className="text-sm font-medium text-primary-800">🤖 AI Suggestion</p>
          <p className="text-sm text-primary-700 mt-1">
            Category: {suggested.category} • Priority: {suggested.priority}
          </p>
          <button
            type="button"
            onClick={applySuggestion}
            className="mt-2 text-sm text-primary-600 font-medium hover:underline"
          >
            Apply suggestion
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="input-field"
            placeholder="Brief title of the issue"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input-field min-h-[120px]"
            placeholder="Describe the issue in detail..."
            required
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="input-field"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="input-field"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g. Block A, Room 205"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="input-field"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
}
