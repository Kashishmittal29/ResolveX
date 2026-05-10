import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    studentId: '',
    department: 'GENERAL',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        studentId: form.role === 'student' ? form.studentId : undefined,
        department: form.role === 'staff' ? form.department : undefined,
      });
      toast.success('Account created successfully');
      navigate(form.role === 'student' ? '/dashboard' : '/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <span className="font-semibold text-white">ResolveX</span>
          </Link>
        </div>

        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-7">
          <h2 className="text-lg font-semibold text-white mb-1">Create account</h2>
          <p className="text-sm text-surface-500 mb-6">Join ResolveX to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Full name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Kartik Sharma" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Email address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="you@campus.edu" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Role</label>
              <select name="role" value={form.role} onChange={handleChange}
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {form.role === 'student' && (
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1.5">Student ID <span className="text-surface-600">(optional)</span></label>
                <input type="text" name="studentId" value={form.studentId} onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="STU001" />
              </div>
            )}
            {form.role === 'staff' && (
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1.5">Department</label>
                <select name="department" value={form.department} onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="HVAC">HVAC</option>
                  <option value="IT_SUPPORT">IT Support</option>
                  <option value="SECURITY">Security</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6}
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-400 mb-1.5">Confirm password</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
                className="w-full px-3 py-2.5 bg-surface-800 border border-surface-700 rounded-lg text-sm text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 mt-1 rounded-lg justify-center">
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-surface-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
