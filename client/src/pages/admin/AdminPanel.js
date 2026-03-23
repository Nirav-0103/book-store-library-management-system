import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminPanel.css';

const MENU = [
  { to: '/admin',         label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/orders',  label: 'Orders',    icon: '🛒' },
  { to: '/admin/books',   label: 'Books',     icon: '📚' },
  { to: '/admin/members', label: 'Members',   icon: '🪪' },
  { to: '/admin/issues',  label: 'Issues',    icon: '🔄' },
  { to: '/admin/users',   label: 'Users',     icon: '👥' },
];

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className={`admin ${collapsed ? 'admin--collapsed' : ''}`}>
      <aside className="admin__sidebar">
        <div className="admin__sidebar-top">
          <div className="admin__brand">
            <span className="admin__brand-icon">✦</span>
            {!collapsed && <span className="admin__brand-text">LUXE LIBRARY</span>}
          </div>
          <button className="admin__collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        <nav className="admin__nav">
          {MENU.map(m => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.end}
              className={({ isActive }) => `admin__nav-link ${isActive ? 'active' : ''}`}
              title={collapsed ? m.label : ''}
            >
              <span className="admin__nav-icon">{m.icon}</span>
              {!collapsed && <span className="admin__nav-label">{m.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="admin__sidebar-footer">
          {!collapsed && (
            <div className="admin__user-info">
              <div className="admin__user-avatar">{user?.name?.charAt(0)}</div>
              <div>
                <div className="admin__user-name">{user?.name}</div>
                <div className="admin__user-role">{user?.role}</div>
              </div>
            </div>
          )}
          <button className="admin__logout-btn" onClick={handleLogout}>
            🚪 {!collapsed && 'Sign Out'}
          </button>
          <NavLink to="/" className="admin__back-link">
            🌐 {!collapsed && 'Back to Site'}
          </NavLink>
        </div>
      </aside>

      <main className="admin__main">
        <div className="admin__content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}