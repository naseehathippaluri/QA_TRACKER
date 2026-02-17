import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { Loading } from '../components/common/Loading';
import { useAuth } from '../contexts/AuthContext';
import { worklogsService } from '../services/worklogs';
import { featuresService } from '../services/features';
import { authApi } from '../api/auth';

const PROJECT_OPTIONS = [
  { value: '', label: 'All projects' },
  { value: 'TOO', label: 'TOO' },
  { value: 'TFA', label: 'TFA' },
];

export function AllWorkLogs() {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [worklogs, setWorklogs] = useState([]);
  const [features, setFeatures] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [filters, setFilters] = useState({
    date_from: searchParams.get('date_from') || '',
    date_to: searchParams.get('date_to') || '',
    user: searchParams.get('user') || '',
    feature: '',
    project: '',
  });

  useEffect(() => {
    const userParam = searchParams.get('user');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    setFilters((f) => ({
      ...f,
      date_from: dateFrom || f.date_from,
      date_to: dateTo || f.date_to,
      user: userParam || f.user,
    }));
  }, [searchParams]);

  useEffect(() => {
    featuresService
      .list()
      .then((r) => {
        const data = r.data;
        setFeatures(Array.isArray(data) ? data : data?.results || []);
      })
      .catch(() => {});
  }, []);

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

  const loadWorklogs = () => {
    setLoading(true);
    const params = { page, page_size: pageSize };
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (isAdmin && filters.user) params.user = filters.user;
    if (filters.feature) params.feature = filters.feature;
    if (filters.project) params.project = filters.project;

    worklogsService
      .filter(params)
      .then((r) => {
        setWorklogs(r.data.results || []);
        setCount(r.data.count ?? 0);
      })
      .catch(() => setWorklogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    const params = { page, page_size: pageSize };
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (isAdmin && filters.user) params.user = filters.user;
    if (filters.feature) params.feature = filters.feature;
    if (filters.project) params.project = filters.project;
    worklogsService
      .filter(params)
      .then((r) => {
        setWorklogs(r.data.results || []);
        setCount(r.data.count ?? 0);
      })
      .catch(() => setWorklogs([]))
      .finally(() => setLoading(false));
  }, [page, filters.date_from, filters.date_to, filters.user, filters.feature, filters.project, isAdmin]);

  const applyFiltersAndSyncUrl = () => {
    const next = new URLSearchParams();
    if (filters.date_from) next.set('date_from', filters.date_from);
    if (filters.date_to) next.set('date_to', filters.date_to);
    if (isAdmin && filters.user) next.set('user', filters.user);
    setSearchParams(next, { replace: true });
    setPage(1);
  };

  const totalPages = Math.ceil(count / pageSize) || 1;

  return (
    <Layout>
      <div className="page-header">
        <h1>All Work Logs</h1>
        <Link to="/worklogs/new" className="btn btn-primary">Create Work Log</Link>
      </div>

      <div className="filter-bar dashboard-filters">
        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))}
          />
        </div>
        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
          />
        </div>
        {isAdmin && (
          <div className="filter-group">
            <label>User</label>
            <select
              value={filters.user}
              onChange={(e) => setFilters((f) => ({ ...f, user: e.target.value }))}
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
        <div className="filter-group">
          <label>Feature</label>
          <select
            value={filters.feature}
            onChange={(e) => setFilters((f) => ({ ...f, feature: e.target.value }))}
          >
            <option value="">All features</option>
            {features.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Project</label>
          <select
            value={filters.project}
            onChange={(e) => setFilters((f) => ({ ...f, project: e.target.value }))}
          >
            {PROJECT_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <button type="button" className="btn btn-primary" onClick={applyFiltersAndSyncUrl}>
            Apply
          </button>
        </div>
      </div>

      {loading && <Loading />}
      <div className="table-wrap">
        <table className="data-table data-table-wide">
          <thead>
            <tr>
              <th>Date</th>
              {isAdmin && <th>User</th>}
              <th>Feature</th>
              <th>Project</th>
              <th>Written</th>
              <th>Reviewed</th>
              <th>Executed</th>
              <th>Passed</th>
              <th>Failed</th>
              <th>Blocked</th>
              <th>In Progress</th>
              <th>Future</th>
              <th>Invalid</th>
              <th>Retested QA</th>
              <th>Defects</th>
              <th>Ticket #</th>
              <th>Observations</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {worklogs.length === 0 && !loading ? (
              <tr>
                <td colSpan={isAdmin ? 20 : 19}>
                  No work logs found. Adjust filters or <Link to="/worklogs/new">create one</Link>.
                </td>
              </tr>
            ) : (
              worklogs.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  {isAdmin && <td>{r.user_username}</td>}
                  <td>{r.feature_name}</td>
                  <td>{r.project_name || '—'}</td>
                  <td>{r.test_cases_written}</td>
                  <td>{r.test_cases_reviewed}</td>
                  <td>{r.test_cases_executed}</td>
                  <td>{r.test_cases_passed}</td>
                  <td>{r.test_cases_failed}</td>
                  <td>{r.test_cases_blocked}</td>
                  <td>{r.test_cases_in_progress}</td>
                  <td>{r.test_cases_future_execution}</td>
                  <td>{r.test_cases_invalid}</td>
                  <td>{r.retested_qa_review_tickets}</td>
                  <td>{r.defects_raised}</td>
                  <td className="cell-ellipsis" title={r.ticket_number_with_priority}>
                    {(r.ticket_number_with_priority || '—').slice(0, 20)}
                    {(r.ticket_number_with_priority || '').length > 20 ? '…' : ''}
                  </td>
                  <td>{r.observations_found}</td>
                  <td className="cell-ellipsis" title={r.comments}>
                    {(r.comments || '—').slice(0, 25)}
                    {(r.comments || '').length > 25 ? '…' : ''}
                  </td>
                  <td>
                    <Link to={`/worklogs/${r.id}/edit`} className="btn btn-sm">Edit</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </Layout>
  );
}
