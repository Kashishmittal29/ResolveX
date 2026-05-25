import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  {
    icon: (
      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/>
      </svg>
    ),
    title: 'Submit Complaints',
    desc: 'Report issues with rich details — title, description, category, location, and photo attachments.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
      </svg>
    ),
    title: 'AI Classification',
    desc: 'NLP engine auto-detects urgency and category. Smart routing to the right department instantly.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
      </svg>
    ),
    title: 'Live Analytics',
    desc: 'Real-time dashboards with SLA tracking, department performance, and resolution trends.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>
      </svg>
    ),
    title: 'Real-time Notifications',
    desc: 'Firebase-powered instant updates. Know the moment your complaint status changes.',
  },
];

const stats = [
  { value: '< 2min', label: 'Avg. assignment time' },
  { value: '98%',    label: 'Resolution rate' },
  { value: '24/7',   label: 'System uptime' },
  { value: 'SLA',    label: 'Guaranteed response' },
];

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      {/* Nav */}
      <nav className="border-b border-surface-800 bg-surface-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <span className="font-semibold text-sm tracking-tight">CampusConnect</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to={user.role === 'student' ? '/dashboard' : '/admin'} className="btn-primary text-xs px-3 py-1.5">
                Open Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-surface-400 hover:text-white transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary text-xs px-3 py-1.5">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-24 pb-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-950 border border-primary-800 text-primary-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse-slow"/>
            AI-powered complaint management
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white leading-tight mb-5">
            Campus issues,{' '}
            <span className="text-primary-400">resolved faster.</span>
          </h1>
          <p className="text-surface-400 text-lg leading-relaxed mb-8 max-w-lg">
            CampusConnect brings structure, speed, and transparency to campus maintenance. Submit once, track always.
          </p>
          {!user && (
            <div className="flex items-center gap-3">
              <Link to="/register" className="btn-primary px-5 py-2.5 text-sm">
                Start for free →
              </Link>
              <Link to="/login" className="btn-secondary text-sm">
                Sign in
              </Link>
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-surface-800 rounded-xl overflow-hidden border border-surface-800">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface-900 px-5 py-4">
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-surface-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-5 pb-24">
        <p className="text-xs font-semibold text-surface-500 uppercase tracking-widest mb-6">Features</p>
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bg-surface-900 border border-surface-800 rounded-xl p-5 hover:border-surface-700 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-primary-950 border border-primary-900 flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-white text-sm mb-1.5">{f.title}</h3>
              <p className="text-surface-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800 py-6">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary-600 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <span className="text-xs text-surface-500">CampusConnect © {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-surface-600">Campus Complaint Management System</p>
        </div>
      </footer>
    </div>
  );
}
