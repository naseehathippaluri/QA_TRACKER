import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { Loading } from '../components/common/Loading';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService, downloadExportBlob } from '../services/dashboard';
import { authApi } from '../api/auth';

export function Dashboard() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    if (isAdmin) {
      authApi
        .users({ page_size: 100 })
        .then((r) => {
          const data = r.data;
          const list = Array.isArray(data) ? data : (data?.results || []);
          setUsers(list);
        })
        .catch(() => setUsers([]));
    }
  }, [isAdmin]);

  useEffect(() => {
    const params = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (isAdmin && selectedUser) params.user = selectedUser;
    setLoading(true);
    dashboardService
      .summary(params)
      .then((r) => setSummary(r.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo, selectedUser, isAdmin]);

  const handleViewWorkLogs = () => {
    const search = new URLSearchParams();
    if (dateFrom) search.set('date_from', dateFrom);
    if (dateTo) search.set('date_to', dateTo);
    if (isAdmin && selectedUser) search.set('user', selectedUser);
    navigate(`/worklogs?${search.toString()}`);
  };

  const handleExport = async () => {
    setExportError(null);
    setExporting(true);
    try {
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      if (selectedUser) params.user = selectedUser;
      const { data } = await dashboardService.exportExcel(params);
      downloadExportBlob(data, 'worklogs_export.xlsx');
    } catch (err) {
      const body = err.response?.data;
      if (body instanceof Blob) {
        try {
          const json = JSON.parse(await body.text());
          setExportError(json.detail || 'Export failed');
        } catch {
          setExportError('Export failed');
        }
      } else {
        setExportError(body?.detail || err.message || 'Export failed');
      }
    } finally {
      setExporting(false);
    }
  };

  if (loading && !summary) return <Layout><Loading /></Layout>;
  if (error && !summary) return <Layout><div className="error-message">{error}</div></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>Dashboard</h1>
        <div className="page-header-actions">
          {isAdmin && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? 'Exporting…' : 'Export to Excel'}
            </button>
          )}
          <Link to="/worklogs/new" className="btn btn-primary">Create Work Log</Link>
        </div>
      </div>
      {exportError && <div className="error-message">{exportError}</div>}

      <div className="dashboard-filters filter-bar">
        <div className="filter-group">
          <label htmlFor="dashboard-date-from">Start Date</label>
          <input
            id="dashboard-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="dashboard-date-to">End Date</label>
          <input
            id="dashboard-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        {isAdmin && (
          <div className="filter-group">
            <label htmlFor="dashboard-user">User</label>
            <select
              id="dashboard-user"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name?.trim() || u.email || `User ${u.id}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="cards-grid">
        <div className="summary-card">
          <span className="card-label">Total Features</span>
          <span className="card-value">{summary?.total_features ?? 0}</span>
        </div>
        <div className="summary-card">
          <span className="card-label">Total Work Logs</span>
          <span className="card-value">{summary?.total_work_logs ?? 0}</span>
        </div>
        <div className="summary-card">
          <span className="card-label">Test Cases Written</span>
          <span className="card-value">{summary?.total_test_cases_written ?? 0}</span>
        </div>
        <div className="summary-card">
          <span className="card-label">Test Cases Executed</span>
          <span className="card-value">{summary?.total_test_cases_executed ?? 0}</span>
        </div>
        <div className="summary-card">
          <span className="card-label">Passed</span>
          <span className="card-value card-value-success">{summary?.total_passed ?? 0}</span>
        </div>
        <div className="summary-card">
          <span className="card-label">Failed</span>
          <span className="card-value card-value-danger">{summary?.total_failed ?? 0}</span>
        </div>
        <div className="summary-card">
          <span className="card-label">Defects Raised</span>
          <span className="card-value card-value-warn">{summary?.total_defects_raised ?? 0}</span>
        </div>
      </div>

      <div className="page-actions">
        <button type="button" className="btn btn-primary" onClick={handleViewWorkLogs}>
          View Work Logs
        </button>
      </div>
    </Layout>
  );
}
