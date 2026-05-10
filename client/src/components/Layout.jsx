import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to:'/dashboard',  icon:'🏠', label:'Home' },
  { to:'/activities', icon:'📋', label:'Activities' },
  { to:'/profile',    icon:'👤', label:'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user ? `${user.first_name?.[0]||''}${user.last_name?.[0]||''}`.toUpperCase() : 'P';

  const doLogout = () => { logout(); toast.success('Signed out 👋'); navigate('/login'); };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column' }}>
      {/* Top nav */}
      <header className="top-nav">
        <div className="top-nav-inner">
          <NavLink to="/dashboard" className="nav-logo">
            <span className="nav-logo-icon">⭐</span> KidPoints
          </NavLink>
          <nav className="desktop-nav">
            {NAV.map(({ to, icon, label }) => (
              <NavLink key={to} to={to}>
                {({ isActive }) => (
                  <span className={`nav-link${isActive?' active':''}`}>{icon} {label}</span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="nav-user">
            <div className="nav-avatar">{initials}</div>
            <button className="btn btn-ghost btn-sm nav-logout" onClick={doLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main style={{ flex:1 }}>
        <div className="container page"><Outlet /></div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {NAV.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className="bnav-item"
            style={({ isActive }) => ({ color: isActive ? 'var(--primary)' : 'var(--muted)' })}>
            <span className="bi">{icon}</span><span>{label}</span>
          </NavLink>
        ))}
        <button className="bnav-item" onClick={doLogout}
          style={{ color:'var(--danger)', background:'none', border:'none', cursor:'pointer' }}>
          <span className="bi">🚪</span><span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
