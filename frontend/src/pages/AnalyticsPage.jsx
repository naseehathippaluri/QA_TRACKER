import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/common/Layout';
import { Loading } from '../components/common/Loading';
import { AnalyticsPieChart } from '../components/charts/AnalyticsPieChart';
import { dashboardService } from '../services/dashboard';

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    date_from: start.toISOString().slice(0, 10),
    date_to: end.toISOString().slice(0, 10),
  };
}

const CHART_1_COLORS = { 'Test Cases Written': '#3B82F6', 'Test Cases Executed': '#6366F1' };
const CHART_2_COLORS = { Passed: '#22C55E', Failed: '#EF4444' };
const CHART_3_COLORS = { 'Defects Raised': '#F97316' };

export function AnalyticsPage() {
  const defaultRange = getCurrentMonthRange();
  const [dateFrom, setDateFrom] = useState(defaultRange.date_from);
  const [dateTo, setDateTo] = useState(defaultRange.date_to);
  const [appliedRange, setAppliedRange] = useState(defaultRange);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {
      date_from: appliedRange.date_from,
      date_to: appliedRange.date_to,
    };
    dashboardService
      .analyticsSummary(params)
      .then((r) => setData(r.data))
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load analytics');
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [appliedRange.date_from, appliedRange.date_to]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleApply = (e) => {
    e.preventDefault();
    setAppliedRange({ date_from: dateFrom, date_to: dateTo });
  };

  const chart1Data = [
    { name: 'Test Cases Written', value: data?.written ?? 0 },
    { name: 'Test Cases Executed', value: data?.executed ?? 0 },
  ];
  const chart2Data = [
    { name: 'Passed', value: data?.passed ?? 0 },
    { name: 'Failed', value: data?.failed ?? 0 },
  ];
  const chart3Data = [{ name: 'Defects Raised', value: data?.defects ?? 0 }];

  const hasAnyData = (data?.written ?? 0) + (data?.executed ?? 0) + (data?.passed ?? 0) + (data?.failed ?? 0) + (data?.defects ?? 0) > 0;

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
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="analytics-end-date">End Date</label>
          <input
            id="analytics-end-date"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
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
          No data for the selected date range. Adjust dates or add work logs.
        </div>
      ) : (
        <>
          <div className="analytics-charts-row">
            <AnalyticsPieChart title="Test Case Creation" data={chart1Data} colorMapping={CHART_1_COLORS} />
            <AnalyticsPieChart title="Execution Results" data={chart2Data} colorMapping={CHART_2_COLORS} />
          </div>
          <div className="analytics-charts-row analytics-charts-row-single">
            <AnalyticsPieChart title="Defects Raised" data={chart3Data} colorMapping={CHART_3_COLORS} />
          </div>
        </>
      )}
    </Layout>
  );
}
