import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const studentNav = [
    { to: '/dashboard', label: 'Dashboard', icon: '📋' },
    { to: '/complaint/new', label: 'Submit Complaint', icon: '➕' },
  ];

  const adminNav = [
    { to: '/admin', label: 'All Complaints', icon: '📋' },
    ...(user?.role === 'admin' ? [{ to: '/analytics', label: 'Analytics', icon: '📊' }] : []),
  ];

  const navItems = user?.role === 'student' ? studentNav : adminNav;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🔧</span>
            {sidebarOpen && (
              <span className="font-bold text-primary-600 text-lg">ResolveX</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded hover:bg-gray-100"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-50 text-gray-700 hover:text-primary-700"
            >
              <span>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-100">
          <div className={`px-3 py-2 ${!sidebarOpen && 'flex justify-center'}`}>
            <span className="text-sm text-gray-500 truncate block">
              {sidebarOpen ? user?.name : user?.name?.charAt(0)}
            </span>
            <span className="text-xs text-gray-400 capitalize">{sidebarOpen && user?.role}</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600"
          >
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-gray-800">
            {user?.role === 'student' ? 'Student Portal' : 'Admin Portal'}
          </h1>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Link to="/" className="text-primary-600 hover:text-primary-700 text-sm">
              ← Back to Home
            </Link>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
