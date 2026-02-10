import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { Loading } from '../components/common/Loading';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService, downloadExportBlob } from '../services/dashboard';

export function Dashboard() {
  const { isAdmin } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  useEffect(() => {
    dashboardService.summary()
      .then((r) => setSummary(r.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout><Loading /></Layout>;
  if (error) return <Layout><div className="error-message">{error}</div></Layout>;

  const handleExport = async () => {
    setExportError(null);
    setExporting(true);
    try {
      const { data } = await dashboardService.exportExcel();
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
        <Link to="/worklogs" className="btn btn-secondary">View Work Log Reports</Link>
      </div>
    </Layout>
  );
}
