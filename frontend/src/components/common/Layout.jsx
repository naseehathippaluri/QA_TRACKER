import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
          <Link to="/worklogs">Work Log Reports</Link>
          <Link to="/worklogs/new">Create Work Log</Link>
          <Link to="/features">Features</Link>
          {isAdmin && (
            <>
              <Link to="/admin">Admin</Link>
              <Link to="/admin/worklogs">All Work Logs</Link>
              <Link to="/admin/analytics">Analytics</Link>
            </>
          )}
          <span className="user-name">{user?.username}</span>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
