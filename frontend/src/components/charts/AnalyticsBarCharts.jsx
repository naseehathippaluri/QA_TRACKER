import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const EXECUTED_COLOR = '#3B82F6';
const PASSED_COLOR = '#22C55E';
const FAILED_COLOR = '#EF4444';
const WRITTEN_COLOR = '#15803d';
const QA_REVIEW_COLOR = '#64748b';

const CHART_HEIGHT = 320;
const chartMargin = { top: 20, right: 20, left: 10, bottom: 50 };
const xAxisProps = {
  dataKey: 'username',
  tick: { fontSize: 11, fill: 'var(--text-muted, #64748b)' },
  axisLine: { stroke: 'var(--border, #e2e8f0)' },
  angle: 0,
  textAnchor: 'middle',
  height: 50,
  interval: 0,
};
const yAxisProps = {
  allowDecimals: false,
  tick: { fontSize: 11, fill: 'var(--text-muted, #64748b)' },
  axisLine: false,
  tickLine: false,
  width: 32,
};
const barLabelProps = {
  position: 'top',
  formatter: (v) => (v != null ? String(v) : ''),
  fontSize: 12,
  fontWeight: 500,
  fill: 'var(--text, #334155)',
};

/**
 * Bar chart: Test Cases Written per user. One bar per user, value above bar.
 * Design: clean, no grid, numeric values above bars.
 */
export function TestCasesWrittenBarChart({ data }) {
  if (!data?.length) {
    return (
      <div className="analytics-chart-card analytics-chart-card-clean">
        <h3 className="analytics-chart-title">Test Cases Written Per User</h3>
        <div className="analytics-chart-body">
          <div className="analytics-chart-empty">No data for the selected range.</div>
        </div>
      </div>
    );
  }
  const chartData = data.map((d) => ({ username: d.username, count: d.count }));

  return (
    <div className="analytics-chart-card analytics-chart-card-clean">
      <h3 className="analytics-chart-title">Test Cases Written Per User</h3>
      <div className="analytics-chart-body">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={chartData} margin={chartMargin} barCategoryGap="36%" barSize={28}>
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip formatter={(value) => [value, 'Test cases written']} contentStyle={{ borderRadius: 6 }} />
            <Bar dataKey="count" name="Test Cases Written" fill={WRITTEN_COLOR} radius={[4, 4, 0, 0]} label={barLabelProps} className="analytics-bar-clean" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Bar chart: Test Cases Execution per user. Three bars: Executed (blue), Passed (green), Failed (red).
 * Legend below, numeric value above each bar. Clean design, no grid.
 */
export function TestCasesExecutionBarChart({ data }) {
  if (!data?.length) {
    return (
      <div className="analytics-chart-card analytics-chart-card-clean">
        <h3 className="analytics-chart-title">Test Cases Execution Per User</h3>
        <div className="analytics-chart-body">
          <div className="analytics-chart-empty">No data for the selected range.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-chart-card analytics-chart-card-clean">
      <h3 className="analytics-chart-title">Test Cases Execution Per User</h3>
      <div className="analytics-chart-body">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={data} margin={chartMargin} barCategoryGap="22%" barGap={4} barSize={20}>
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip contentStyle={{ borderRadius: 6 }} />
            <Legend layout="horizontal" align="center" wrapperStyle={{ paddingTop: 16 }} />
            <Bar dataKey="executed" name="Executed" fill={EXECUTED_COLOR} radius={[4, 4, 0, 0]} label={barLabelProps} className="analytics-bar-clean" />
            <Bar dataKey="passed" name="Passed" fill={PASSED_COLOR} radius={[4, 4, 0, 0]} label={barLabelProps} className="analytics-bar-clean" />
            <Bar dataKey="failed" name="Failed" fill={FAILED_COLOR} radius={[4, 4, 0, 0]} label={barLabelProps} className="analytics-bar-clean" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="analytics-bar-legend analytics-bar-legend-clean">
        <span className="analytics-legend-item"><span className="analytics-legend-dot" style={{ background: EXECUTED_COLOR }} /> Executed</span>
        <span className="analytics-legend-item"><span className="analytics-legend-dot" style={{ background: PASSED_COLOR }} /> Passed</span>
        <span className="analytics-legend-item"><span className="analytics-legend-dot" style={{ background: FAILED_COLOR }} /> Failed</span>
      </div>
    </div>
  );
}

/**
 * Bar chart: QA Review Tickets (Retested) per user. One bar per user, value above bar.
 * Clean design to match reference.
 */
export function QAReviewTicketsBarChart({ data }) {
  if (!data?.length) {
    return (
      <div className="analytics-chart-card analytics-chart-card-clean">
        <h3 className="analytics-chart-title">Retested QA Review Tickets</h3>
        <div className="analytics-chart-body">
          <div className="analytics-chart-empty">No data for the selected range.</div>
        </div>
      </div>
    );
  }
  const chartData = data.map((d) => ({ username: d.username, count: d.count }));

  return (
    <div className="analytics-chart-card analytics-chart-card-clean">
      <h3 className="analytics-chart-title">Retested QA Review Tickets</h3>
      <div className="analytics-chart-body">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={chartData} margin={chartMargin} barCategoryGap="36%" barSize={28}>
            <XAxis {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip formatter={(value) => [value, 'Retested QA review tickets']} contentStyle={{ borderRadius: 6 }} />
            <Bar dataKey="count" name="Retested QA Review Tickets" fill={QA_REVIEW_COLOR} radius={[4, 4, 0, 0]} label={barLabelProps} className="analytics-bar-clean" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
