import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { Loading } from '../components/common/Loading';
import { reportsApi } from '../api/reports';
import { projectsApi } from '../api/projects';

export function FilterReports() {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ date_from: '', date_to: '', user: '', project: '' });

  const loadReports = () => {
    setLoading(true);
    const params = {};
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (filters.user) params.user = filters.user;
    if (filters.project) params.project = filters.project;
    reportsApi.filter(params)
      .then((r) => setReports(r.data.results || []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    projectsApi.list().then((r) => setProjects(r.data.results || [])).catch(() => {});
  }, []);

  return (
    <Layout>
      <div className="page-header">
        <h1>All Reports (Filter)</h1>
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
          value={filters.project}
          onChange={(e) => setFilters((f) => ({ ...f, project: e.target.value }))}
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button type="button" className="btn btn-primary" onClick={loadReports}>Apply</button>
      </div>
      {loading && <Loading />}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Project</th>
              <th>Executed</th>
              <th>Passed</th>
              <th>Failed</th>
              <th>Defects</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 && !loading ? (
              <tr><td colSpan={8}>Apply filters to load reports.</td></tr>
            ) : (
              reports.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td>{r.user_username}</td>
                  <td>{r.project_name}</td>
                  <td>{r.total_test_cases_executed}</td>
                  <td>{r.test_cases_passed}</td>
                  <td>{r.test_cases_failed}</td>
                  <td>{r.defects_raised}</td>
                  <td><Link to={`/reports/${r.id}/edit`} className="btn btn-sm">Edit</Link></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
