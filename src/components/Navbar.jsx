import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/complaints', label: 'Submit' },
  { path: '/my-complaints', label: 'My Complaints' },
  { path: '/login', label: 'Login' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple 
                          flex items-center justify-center shadow-lg shadow-neon-blue/20 
                          group-hover:shadow-neon-blue/40 transition-shadow duration-300">
              <span className="text-xl">⚡</span>
            </div>
            <span className="font-bold text-xl text-white">
              Resolve<span className="text-neon-blue">X</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${location.pathname === link.path 
                    ? 'text-white bg-dark-800/50' 
                    : 'text-gray-400 hover:text-white hover:bg-dark-800/30'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Server Online</span>
            </div>
            
            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden border-t border-dark-800">
        <div className="px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${location.pathname === link.path 
                  ? 'text-neon-blue bg-dark-800/50' 
                  : 'text-gray-400 hover:text-white hover:bg-dark-800/30'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

