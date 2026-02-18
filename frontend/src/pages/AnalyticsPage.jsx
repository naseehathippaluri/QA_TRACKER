import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { Loading } from '../components/common/Loading';
import { dashboardService } from '../services/dashboard';
import { authApi } from '../api/auth';
import { getMaxDateString } from '../utils/dateUtils';
import {
  TestCasesWrittenBarChart,
  TestCasesExecutionBarChart,
  QAReviewTicketsBarChart,
} from '../components/charts/AnalyticsBarCharts';

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    date_from: start.toISOString().slice(0, 10),
    date_to: end.toISOString().slice(0, 10),
  };
}

export function AnalyticsPage() {
  const defaultRange = getCurrentMonthRange();
  const [dateFrom, setDateFrom] = useState(defaultRange.date_from);
  const [dateTo, setDateTo] = useState(defaultRange.date_to);
  const [selectedUser, setSelectedUser] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ date_from: defaultRange.date_from, date_to: defaultRange.date_to, user: '' });
  const [users, setUsers] = useState([]);
  const [byUserData, setByUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    authApi
      .users({ page_size: 100 })
      .then((r) => {
        const data = r.data;
        const list = Array.isArray(data) ? data : (data?.results || []);
        setUsers(list);
      })
      .catch(() => setUsers([]));
  }, []);

  const fetchAnalytics = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {
      date_from: appliedFilters.date_from,
      date_to: appliedFilters.date_to,
    };
    if (appliedFilters.user) params.user = appliedFilters.user;
    dashboardService
      .analyticsByUser(params)
      .then((r) => setByUserData(r.data))
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load analytics');
        setByUserData(null);
      })
      .finally(() => setLoading(false));
  }, [appliedFilters.date_from, appliedFilters.date_to, appliedFilters.user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleApply = (e) => {
    e.preventDefault();
    setAppliedFilters({ date_from: dateFrom, date_to: dateTo, user: selectedUser });
  };

  const writtenPerUser = byUserData?.test_cases_written_per_user ?? [];
  const executionPerUser = byUserData?.test_cases_execution_per_user ?? [];
  const qaReviewPerUser = byUserData?.qa_review_tickets_per_user ?? [];
  const hasAnyData =
    writtenPerUser.length > 0 ||
    executionPerUser.some((r) => (r.executed || r.passed || r.failed) > 0) ||
    qaReviewPerUser.some((r) => r.count > 0);

  return (
    <Layout>
      <div className="page-header">
        <h1>Analytics</h1>
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>

      <form className="analytics-filters filter-bar dashboard-filters" onSubmit={handleApply}>
        <div className="filter-group">
          <label htmlFor="analytics-start-date">Start Date</label>
          <input
            id="analytics-start-date"
            type="date"
            max={getMaxDateString()}
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="analytics-end-date">End Date</label>
          <input
            id="analytics-end-date"
            type="date"
            max={getMaxDateString()}
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="analytics-user">User</label>
          <select
            id="analytics-user"
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
        <div className="filter-group" style={{ alignSelf: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            Apply
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <Loading />
      ) : !hasAnyData ? (
        <div className="analytics-empty muted">
          No data for the selected date range and filters. Adjust dates or add work logs.
        </div>
      ) : (
        <div className="analytics-bar-charts">
          <div className="analytics-charts-row">
            <TestCasesWrittenBarChart data={writtenPerUser} />
            <TestCasesExecutionBarChart data={executionPerUser} />
          </div>
          <div className="analytics-charts-row analytics-charts-row-single">
            <QAReviewTicketsBarChart data={qaReviewPerUser} />
          </div>
        </div>
      )}
    </Layout>
  );
}
