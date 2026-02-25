import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

async function downloadChartAsPng(cardEl, slug, dateFrom, dateTo) {
  if (!cardEl) return;
  const canvas = await html2canvas(cardEl, {
    useCORS: true,
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
    allowTaint: true,
  });
  const name = dateFrom && dateTo
    ? `analytics-${slug}-${dateFrom}-to-${dateTo}.png`
    : `analytics-${slug}.png`;
  const link = document.createElement('a');
  link.download = name;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

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

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/**
 * Bar chart: Test Cases Written per user. One bar per user, value above bar.
 * Design: clean, no grid, numeric values above bars.
 */
export function TestCasesWrittenBarChart({ data, exportDateFrom, exportDateTo }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const slug = 'test-cases-written';

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      await downloadChartAsPng(cardRef.current, slug, exportDateFrom, exportDateTo);
    } finally {
      setDownloading(false);
    }
  };

  if (!data?.length) {
    return (
      <div className="analytics-chart-card analytics-chart-card-clean" ref={cardRef}>
        <div className="analytics-chart-card-header">
          <h3 className="analytics-chart-title">Test Cases Written Per User</h3>
          <button type="button" className="btn btn-primary btn-download-graph" onClick={handleDownload} disabled={downloading}>
            <DownloadIcon />
            <span>{downloading ? 'Downloading…' : 'Download'}</span>
          </button>
        </div>
        <div className="analytics-chart-body">
          <div className="analytics-chart-empty">No data for the selected range.</div>
        </div>
      </div>
    );
  }
  const chartData = data.map((d) => ({ username: d.username, count: d.count }));

  return (
    <div className="analytics-chart-card analytics-chart-card-clean" ref={cardRef}>
      <div className="analytics-chart-card-header">
        <h3 className="analytics-chart-title">Test Cases Written Per User</h3>
        <button type="button" className="btn btn-primary btn-download-graph" onClick={handleDownload} disabled={downloading}>
          <DownloadIcon /><span>{downloading ? 'Downloading…' : 'Download'}</span>
        </button>
      </div>
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
export function TestCasesExecutionBarChart({ data, exportDateFrom, exportDateTo }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const slug = 'test-cases-execution';

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      await downloadChartAsPng(cardRef.current, slug, exportDateFrom, exportDateTo);
    } finally {
      setDownloading(false);
    }
  };

  if (!data?.length) {
    return (
      <div className="analytics-chart-card analytics-chart-card-clean" ref={cardRef}>
        <div className="analytics-chart-card-header">
          <h3 className="analytics-chart-title">Test Cases Execution Per User</h3>
          <button type="button" className="btn btn-primary btn-download-graph" onClick={handleDownload} disabled={downloading}>
            <DownloadIcon />
            <span>{downloading ? 'Downloading…' : 'Download'}</span>
          </button>
        </div>
        <div className="analytics-chart-body">
          <div className="analytics-chart-empty">No data for the selected range.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-chart-card analytics-chart-card-clean" ref={cardRef}>
      <div className="analytics-chart-card-header">
        <h3 className="analytics-chart-title">Test Cases Execution Per User</h3>
        <button type="button" className="btn btn-primary btn-download-graph" onClick={handleDownload} disabled={downloading}>
          <DownloadIcon /><span>{downloading ? 'Downloading…' : 'Download'}</span>
        </button>
      </div>
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
export function QAReviewTicketsBarChart({ data, exportDateFrom, exportDateTo }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const slug = 'qa-review-tickets';

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      await downloadChartAsPng(cardRef.current, slug, exportDateFrom, exportDateTo);
    } finally {
      setDownloading(false);
    }
  };

  if (!data?.length) {
    return (
      <div className="analytics-chart-card analytics-chart-card-clean" ref={cardRef}>
        <div className="analytics-chart-card-header">
          <h3 className="analytics-chart-title">Retested QA Review Tickets</h3>
          <button type="button" className="btn btn-primary btn-download-graph" onClick={handleDownload} disabled={downloading}>
            <DownloadIcon />
            <span>{downloading ? 'Downloading…' : 'Download'}</span>
          </button>
        </div>
        <div className="analytics-chart-body">
          <div className="analytics-chart-empty">No data for the selected range.</div>
        </div>
      </div>
    );
  }
  const chartData = data.map((d) => ({ username: d.username, count: d.count }));

  return (
    <div className="analytics-chart-card analytics-chart-card-clean" ref={cardRef}>
      <div className="analytics-chart-card-header">
        <h3 className="analytics-chart-title">Retested QA Review Tickets</h3>
        <button type="button" className="btn btn-primary btn-download-graph" onClick={handleDownload} disabled={downloading}>
          <DownloadIcon /><span>{downloading ? 'Downloading…' : 'Download'}</span>
        </button>
      </div>
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
