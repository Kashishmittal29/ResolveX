import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import ResolveAI from '../components/ResolveAI';

const CATEGORIES = [
  'ELECTRICAL', 'PLUMBING', 'HVAC', 'INFRASTRUCTURE', 'CLEANLINESS',
  'SECURITY', 'IT_SUPPORT', 'LIBRARY', 'CAFETERIA', 'TRANSPORT', 'OTHER',
];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'OTHER',
    location: '',
    priority: 'MEDIUM',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggested, setSuggested] = useState(null);

  // Pre-fill form when navigated here from ResolveAI on the StudentDashboard
  useEffect(() => {
    if (location.state?.prefill) {
      setForm((prev) => ({ ...prev, ...location.state.prefill }));
    }
  }, []);

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
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-base font-semibold text-surface-900">Submit a complaint</h2>
        <p className="text-xs text-surface-400 mt-0.5">Describe the issue and our system will classify and route it automatically.</p>
      </div>

      {suggested && (
        <div className="flex items-start gap-3 p-4 bg-primary-50 border border-primary-200 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-primary-800">AI Suggestion</p>
            <p className="text-xs text-primary-700 mt-0.5">Category: <strong>{suggested.category}</strong> · Priority: <strong>{suggested.priority}</strong></p>
          </div>
          <button type="button" onClick={applySuggestion} className="text-xs text-primary-600 font-medium hover:text-primary-800 transition-colors">
            Apply →
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-surface-700 mb-1.5">Title <span className="text-danger">*</span></label>
          <input type="text" name="title" value={form.title} onChange={handleChange} required
            className="input-field" placeholder="Brief description of the issue" />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-700 mb-1.5">Description <span className="text-danger">*</span></label>
          <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
            className="input-field resize-none" placeholder="Explain the issue in detail — what happened, when, how severe..." />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1.5">Category <span className="text-danger">*</span></label>
            <select name="category" value={form.category} onChange={handleChange} className="input-field text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-700 mb-1.5">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className="input-field text-sm">
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-700 mb-1.5">Location <span className="text-danger">*</span></label>
          <input type="text" name="location" value={form.location} onChange={handleChange} required
            className="input-field" placeholder="e.g. Block A, Room 205" />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-700 mb-1.5">Attachment <span className="text-surface-400 font-normal">(optional)</span></label>
          <div className="border-2 border-dashed border-surface-200 rounded-lg p-4 text-center hover:border-primary-300 transition-colors">
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files[0];
              setImage(file);
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => setImagePreview(ev.target.result);
                reader.readAsDataURL(file);
              }
            }} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="py-2">
                  <svg className="w-8 h-8 text-surface-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="text-xs text-surface-400">Click to upload an image</p>
                  <p className="text-2xs text-surface-300 mt-0.5">PNG, JPG up to 5MB</p>
                </div>
              )}
            </label>
          </div>
        </div>
        <div className="pt-1">
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 justify-center">
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </span>
            ) : 'Submit complaint →'}
          </button>
        </div>
      </form>

      {/* ResolveAI floating assistant — pre-fills the form directly */}
      <ResolveAI onPrefill={(data) => setForm((prev) => ({ ...prev, ...data }))} />
    </div>
  );
}
