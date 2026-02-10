import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Layout } from '../components/common/Layout';
import { Loading } from '../components/common/Loading';
import { dashboardService } from '../services/dashboard';
import { featuresService } from '../services/features';
import { authApi } from '../api/auth';

export function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [features, setFeatures] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ date_from: '', date_to: '', feature: '', user: '' });

  useEffect(() => {
    featuresService.list().then((r) => setFeatures(r.data.results || [])).catch(() => {});
    authApi.users().then((r) => setUsers(r.data.results || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const params = {};
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    if (filters.feature) params.feature = filters.feature;
    if (filters.user) params.user = filters.user;
    setLoading(true);
    dashboardService.analytics(params)
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading && !data) return <Layout><Loading /></Layout>;

  const defectsTrend = data?.defects_trend || [];
  const tce = data?.test_cases_executed || [];
  const tcw = data?.test_cases_written || [];
  const jira = data?.jira_tickets_raised || [];
  const hasAnyData = defectsTrend.length > 0 || tce.length > 0 || tcw.length > 0 || jira.length > 0;

  // Pie chart data: { name, value } for each slice; show number on label
  const toPieData = (arr) => arr.map((d) => ({ name: d.date, value: d.count }));
  const PIE_COLORS = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#ca8a04', '#db2777'];

  return (
    <Layout>
      <div className="page-header">
        <h1>Reports Analytics</h1>
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
        <select value={filters.feature} onChange={(e) => setFilters((f) => ({ ...f, feature: e.target.value }))}>
          <option value="">All features</option>
          {features.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        <select value={filters.user} onChange={(e) => setFilters((f) => ({ ...f, user: e.target.value }))}>
          <option value="">All users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.full_name || u.email || `User ${u.id}`}</option>
          ))}
        </select>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Defects Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={defectsTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="Defects" stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Test Cases Executed (TCE)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={tce} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="Executed" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Test Cases Written (TCW)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={tcw} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="Written" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>JIRA / Tickets Raised</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={jira} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="Tickets" stroke="#d97706" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {hasAnyData && (
        <>
          <h2 className="charts-section-title">Summary by date (pie)</h2>
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Defects</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={toPieData(defectsTrend)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine
                  >
                    {toPieData(defectsTrend).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3>Test Cases Executed</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={toPieData(tce)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine
                  >
                    {toPieData(tce).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3>Test Cases Written</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={toPieData(tcw)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine
                  >
                    {toPieData(tcw).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3>JIRA / Tickets</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={toPieData(jira)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine
                  >
                    {toPieData(jira).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {!loading && (!data || !hasAnyData) && (
        <p className="muted">No analytics data for the selected filters. Create work logs to see charts.</p>
      )}
    </Layout>
  );
}
