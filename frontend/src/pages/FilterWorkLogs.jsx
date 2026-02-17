import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { Loading } from '../components/common/Loading';
import { worklogsService } from '../services/worklogs';
import { featuresService } from '../services/features';
import { authApi } from '../api/auth';

const PROJECT_OPTIONS = [
  { value: '', label: 'All projects' },
  { value: 'TOO', label: 'TOO' },
  { value: 'TFA', label: 'TFA' },
];

export function FilterWorkLogs() {
  const [worklogs, setWorklogs] = useState([]);
  const [features, setFeatures] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ date_from: '', date_to: '', user: '', feature: '', project: '' });
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const loadWorklogs = () => {
    setLoading(true);
    const params = { page, page_size: 10 };
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (filters.user) params.user = filters.user;
    if (filters.feature) params.feature = filters.feature;
    if (filters.project) params.project = filters.project;
    worklogsService.filter(params)
      .then((r) => {
        setWorklogs(r.data.results || []);
        setCount(r.data.count ?? 0);
      })
      .catch(() => setWorklogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    featuresService.list().then((r) => setFeatures(r.data.results || [])).catch(() => {});
    authApi.users().then((r) => setUsers(r.data.results || r.data || [])).catch(() => {});
  }, []);

  const totalPages = Math.ceil(count / 10) || 1;

  return (
    <Layout>
      <div className="page-header">
        <h1>All Work Logs (Filter)</h1>
        <Link to="/admin" className="btn btn-secondary">Back to Admin</Link>
      </div>
      <div className="filter-bar">
        <input
          type="date"
          value={filters.date_from}
          onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))}
          placeholder="From"
        />
        <input
          type="date"
          value={filters.date_to}
          onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
          placeholder="To"
        />
        <select
          value={filters.feature}
          onChange={(e) => setFilters((f) => ({ ...f, feature: e.target.value }))}
        >
          <option value="">All features</option>
          {features.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <select
          value={filters.user}
          onChange={(e) => setFilters((f) => ({ ...f, user: e.target.value }))}
        >
          <option value="">All users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.username}</option>
          ))}
        </select>
        <select
          value={filters.project}
          onChange={(e) => setFilters((f) => ({ ...f, project: e.target.value }))}
        >
          {PROJECT_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button type="button" className="btn btn-primary" onClick={loadWorklogs}>Apply</button>
      </div>
      {loading && <Loading />}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Feature</th>
              <th>Project</th>
              <th>Executed</th>
              <th>Passed</th>
              <th>Failed</th>
              <th>Defects</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {worklogs.length === 0 && !loading ? (
              <tr><td colSpan={9}>Apply filters to load work logs.</td></tr>
            ) : (
              worklogs.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td>{r.user_username}</td>
                  <td>{r.feature_name}</td>
                  <td>{r.project_name || '—'}</td>
                  <td>{r.test_cases_executed}</td>
                  <td>{r.test_cases_passed}</td>
                  <td>{r.test_cases_failed}</td>
                  <td>{r.defects_raised}</td>
                  <td><Link to={`/worklogs/${r.id}/edit`} className="btn btn-sm">Edit</Link></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button type="button" disabled={page <= 1} onClick={() => { setPage((p) => p - 1); loadWorklogs(); }}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => { setPage((p) => p + 1); loadWorklogs(); }}>Next</button>
        </div>
      )}
    </Layout>
  );
}
