import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { Loading } from '../components/common/Loading';
import { worklogsService } from '../services/worklogs';

export function MyWorkLogs() {
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    worklogsService.myList({ page, page_size: 10 })
      .then((r) => setData({ results: r.data.results || [], count: r.data.count || 0 }))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(data.count / 10) || 1;

  if (loading && page === 1) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>Work Log Reports</h1>
        <Link to="/worklogs/new" className="btn btn-primary">Create Work Log</Link>
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
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
            {data.results.length === 0 ? (
              <tr><td colSpan={8}>No work logs yet. <Link to="/worklogs/new">Create one</Link>.</td></tr>
            ) : (
              data.results.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
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
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </Layout>
  );
}
