export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🔧</span>
          <span className="font-bold text-xl text-primary-600">ResolveX</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#features" className="text-gray-600 hover:text-primary-600 font-medium">
            Features
          </a>
          <button className="btn-primary" disabled>
            Get Started (Coming Soon)
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Where Every Concern{' '}
            <span className="text-primary-600">Finds a Resolution</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            ResolveX is your campus complaint and maintenance management system. Submit issues
            digitally, track resolution status, and get faster responses with smart automation.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="btn-primary text-lg px-8 py-3" disabled>
              Register Now (Coming Soon)
            </button>
            <button className="btn-secondary text-lg px-8 py-3" disabled>
              Sign In (Coming Soon)
            </button>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-24 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '📝',
              title: 'Submit Complaints',
              desc: 'Report issues with title, description, category, location, and optional images.',
            },
            {
              icon: '🤖',
              title: 'Smart Classification',
              desc: 'NLP automatically detects category and urgency. Auto-assignment to the right department.',
            },
            {
              icon: '📊',
              title: 'Track & Analytics',
              desc: 'Real-time status updates, SLA tracking, and analytics for administrators.',
            },
          ].map((f) => (
            <div key={f.title} className="card p-6 hover:shadow-lg transition-shadow">
              <span className="text-4xl mb-4 block">{f.icon}</span>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-20 py-8 text-center text-gray-500 text-sm">
        ResolveX © {new Date().getFullYear()} - Campus Complaint Management System
      </footer>
    </div>
  );
}
