import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const UserIcon = () => (
  <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <Link to="/dashboard" className="logo">QA Daily Tracker</Link>
        <nav className="nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/worklogs/new">Create Work Log</Link>
          <Link to="/features">Features</Link>
          <Link to="/worklogs">All Work Logs</Link>
          {isAdmin && <Link to="/admin/analytics">Analytics</Link>}
          {user && (
            <span className="user-name-wrap">
              <span className="user-name" title={user.email}>
                <UserIcon />
                {user.full_name?.trim() || user.email}
              </span>
              {isAdmin && <span className="user-role">Admin</span>}
            </span>
          )}
          <button type="button" className="btn btn-ghost btn-logout" onClick={handleLogout}>
            <LogoutIcon />
            Logout
          </button>
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
