import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth, usePermissions } from '../lib/auth';
import { notificationAPI } from '../lib/api';

interface NavItem {
  to: string;
  icon: string;
  label: string;
  end?: boolean;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { isAdmin, isManager, isSales, isPicker, isAccountant } = usePermissions();
  const nav = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationAPI.list()
      .then(res => {
        const data = res.data;
        setUnread(data.unread_count ?? (data.results ?? data).filter((n: any) => !n.is_read).length);
      })
      .catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    nav('/login');
  }

  const navItems: NavItem[] = [
    { to: '/',              icon: '🏠', label: 'Dashboard', end: true },
    ...(isSales || isAccountant || isManager
      ? [{ to: '/sales',    icon: '🛒', label: 'Sales' }] : []),
    ...(isSales || isManager
      ? [{ to: '/sales/new', icon: '➕', label: 'New Sale' }] : []),
    ...(isManager || isPicker
      ? [{ to: '/orders',   icon: '📦', label: 'Orders' }] : []),
    ...(isPicker
      ? [{ to: '/picking',  icon: '🔍', label: 'Picking' }] : []),
    ...(isSales || isManager
      ? [{ to: '/products', icon: '🔩', label: 'Products' }] : []),
    ...(isSales || isAccountant || isManager
      ? [{ to: '/customers', icon: '👥', label: 'Customers' }] : []),
    ...(isManager || isAccountant
      ? [{ to: '/invoices', icon: '🧾', label: 'Invoices' }] : []),
    { to: '/notifications', icon: '🔔', label: 'Notifications' },
    ...(isAdmin
      ? [{ to: '/users',    icon: '👤', label: 'Users' }] : []),
  ];

  const currentPage = navItems.find(n =>
    n.end
      ? location.pathname === n.to
      : location.pathname === n.to || location.pathname.startsWith(n.to + '/')
  );

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          🔧 Msaidizi
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end ?? false}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.to === '/notifications' && unread > 0 && (
                <span className="badge">{unread > 9 ? '9+' : unread}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="avatar-sm">{user?.username?.[0]?.toUpperCase()}</div>
          <div className="sidebar-user">
            <div className="sidebar-username">{user?.username}</div>
            <div className="sidebar-role">{user?.role ?? 'staff'}</div>
          </div>
          <button className="logout-btn" title="Sign out" onClick={handleLogout}>⏻</button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          {currentPage?.icon}{' '}
          {currentPage?.label ?? 'Dashboard'}
        </header>
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
