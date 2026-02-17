import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Reusable Analytics pie chart. Normal pie (no donut), labels outside, tooltip with name/count/percent.
 * @param {string} title - Card title
 * @param {Array<{ name: string, value: number }>} data - Slice data (percent computed inside)
 * @param {Record<string, string>} colorMapping - Map of data name -> hex color
 */
export function AnalyticsPieChart({ title, data, colorMapping = {} }) {
  const withPercent = useMemo(() => {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return data.map((d) => ({ ...d, percent: 0 }));
    return data.map((d) => ({
      ...d,
      percent: Math.round((d.value / total) * 1000) / 10,
    }));
  }, [data]);

  const total = withPercent.reduce((s, d) => s + d.value, 0);
  const isEmpty = total === 0;

  const getColor = (name) => colorMapping[name] || '#64748b';

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
      <div className="analytics-pie-tooltip">
        <div className="analytics-pie-tooltip-row">
          <strong>{p.name}</strong>
        </div>
        <div className="analytics-pie-tooltip-row">Count: {p.value}</div>
        <div className="analytics-pie-tooltip-row">Percentage: {p.percent}%</div>
      </div>
    );
  };

  return (
    <div className="analytics-chart-card">
      <h3 className="analytics-chart-title">{title}</h3>
      <div className="analytics-chart-body">
        {isEmpty ? (
          <div className="analytics-chart-empty">No data for the selected range.</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart margin={{ top: 20, right: 80, left: 80, bottom: 20 }}>
              <Pie
                data={withPercent}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                paddingAngle={1}
                label={({ name, percent }) => `${name}: ${percent}%`}
                labelLine
                isAnimationActive
                animationDuration={400}
                animationEasing="ease-out"
              >
                {withPercent.map((entry, i) => (
                  <Cell key={entry.name} fill={getColor(entry.name)} stroke="rgba(255,255,255,0.9)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
