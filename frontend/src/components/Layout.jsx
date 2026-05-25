import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Icons = {
  dashboard: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h7v7H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 18h7v3H3z"/>
    </svg>
  ),
  plus: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
    </svg>
  ),
  chart: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
    </svg>
  ),
  logout: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
    </svg>
  ),
  menu: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
    </svg>
  ),
  logo: (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
    </svg>
  ),
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const studentNav = [
    { to: '/dashboard',     label: 'My Complaints', icon: Icons.dashboard },
    { to: '/complaint/new', label: 'New Complaint',  icon: Icons.plus },
  ];
  const adminNav = [
    { to: '/admin',     label: 'All Complaints', icon: Icons.dashboard },
    ...(user?.role === 'admin' ? [{ to: '/analytics', label: 'Analytics', icon: Icons.chart }] : []),
  ];
  const navItems = user?.role === 'student' ? studentNav : adminNav;

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const roleLabel = { student: 'Student', staff: 'Staff', admin: 'Administrator' }[user?.role] || user?.role;

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-surface-900 flex flex-col flex-shrink-0 transition-all duration-200 ease-in-out`}>
        {/* Logo */}
        <div className={`h-14 flex items-center border-b border-surface-800 ${collapsed ? 'justify-center px-3' : 'px-4 gap-2.5'}`}>
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
            {Icons.logo}
          </div>
          {!collapsed && (
            <span className="font-semibold text-white text-sm tracking-tight">CampusConnect</span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-primary-600 text-white'
                    : 'text-surface-400 hover:text-white hover:bg-surface-800'
                  } ${collapsed ? 'justify-center' : ''}`}
              >
                {item.icon}
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + collapse */}
        <div className="border-t border-surface-800 p-2 space-y-1">
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-2.5 py-2">
              <div className="w-7 h-7 rounded-full bg-primary-700 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{user?.name}</p>
                <p className="text-2xs text-surface-500">{roleLabel}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Logout"
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-surface-400 hover:text-white hover:bg-surface-800 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            {Icons.logout}
            {!collapsed && 'Logout'}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-1.5 rounded-lg text-surface-600 hover:text-surface-400 transition-colors"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-5 flex-shrink-0 sticky top-0 z-10">
          <div>
            <h1 className="text-sm font-semibold text-surface-900">
              {navItems.find(n => n.to === location.pathname)?.label || 'CampusConnect'}
            </h1>
            <p className="text-2xs text-surface-400">{roleLabel} Portal</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
