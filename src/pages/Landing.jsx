import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🎓',
    title: 'Role-Based Access',
    desc: 'Secure authentication for Students, Staff, and Administrators with JWT tokens.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: '📝',
    title: 'Digital Submission',
    desc: 'Submit complaints with categories, descriptions, locations, and image uploads.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: '🤖',
    title: 'AI Classification',
    desc: 'NLP-based automatic category detection and priority scoring for complaints.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: '⏰',
    title: 'SLA Tracking',
    desc: 'Automated escalation workflows with real-time deadline monitoring.',
    color: 'from-orange-500 to-red-600',
  },
  {
    icon: '⚡',
    title: 'Smart Assignment',
    desc: 'Auto-assign complaints based on department, workload, and priority.',
    color: 'from-yellow-500 to-amber-600',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    desc: 'Campus-level insights with predictive maintenance and trend analysis.',
    color: 'from-indigo-500 to-purple-600',
  },
];

const stats = [
  { value: '70%', label: 'Faster Resolution' },
  { value: '100%', label: 'Transparency' },
  { value: '24/7', label: 'Real-time Updates' },
];

const roles = [
  { name: 'Student', icon: '🎓', desc: 'Submit & track complaints' },
  { name: 'Staff', icon: '👨‍💼', desc: 'Manage assigned issues' },
  { name: 'Admin', icon: '👨‍💻', desc: 'Full dashboard access' },
];

export default function Landing() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 animated-bg grid-bg"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[128px]"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800/80 border border-dark-700 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm text-gray-300">Campus Complaint Management System</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
            <span className="text-white">Resolve</span>
            <span className="gradient-text">X</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto animate-slide-up stagger-1">
            Streamline issue reporting, automate prioritization, and enhance operational transparency within your educational institution.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up stagger-2">
            <Link to="/complaints" className="btn-primary text-lg px-8 py-4">Submit Complaint</Link>
            <Link to="/dashboard" className="btn-neon text-lg px-8 py-4">View Dashboard</Link>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto animate-slide-up stagger-3">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-primary-400 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 bg-dark-900/50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Three Roles, One Platform</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.name} className="card-glass p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-blue-500/20 flex items-center justify-center text-4xl">
                  {role.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{role.name}</h3>
                <p className="text-gray-400">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to <span className="gradient-text">Resolve</span> Issues</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">A comprehensive complaint management system with intelligent automation and real-time tracking.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="feature-card group">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-2xl mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-dark-900/50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Submit', desc: 'Student submits complaint' },
              { step: '2', title: 'Classify', desc: 'AI categorizes & prioritizes' },
              { step: '3', title: 'Assign', desc: 'Smart engine assigns department' },
              { step: '4', title: 'Resolve', desc: 'Staff resolves complaint' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Built With Modern Technology</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'React', icon: '⚛️' },
              { name: 'Node.js', icon: '🟢' },
              { name: 'Express', icon: '🚂' },
              { name: 'MySQL', icon: '🐬' },
              { name: 'Sequelize', icon: '🔗' },
              { name: 'Socket.io', icon: '⚡' },
              { name: 'GraphQL', icon: '📊' },
              { name: 'JWT', icon: '🔐' },
              { name: 'NLP', icon: '🤖' },
            ].map((tech) => (
              <div key={tech.name} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800/50 border border-dark-700">
                <span className="text-xl">{tech.icon}</span>
                <span className="font-medium text-gray-300">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

