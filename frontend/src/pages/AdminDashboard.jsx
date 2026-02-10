import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { Loading } from '../components/common/Loading';
import { dashboardService } from '../services/dashboard';

export function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const params = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    dashboardService.summary(params)
      .then((r) => setSummary(r.data))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo]);

  if (loading) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <div className="filter-inline">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" />
        </div>
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
        <Link to="/admin/worklogs" className="btn btn-secondary">Filter Work Logs</Link>
        <Link to="/admin/analytics" className="btn btn-primary">View Analytics</Link>
      </div>
    </Layout>
  );
}
