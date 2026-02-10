import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';

/**
 * Bar chart for summary by user, project, or date.
 */
export function SummaryCharts({ userData, projectData, dateData }) {
  return (
    <div className="charts-grid">
      {userData?.length > 0 && (
        <div className="chart-card">
          <h3>By User</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={userData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="username" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_executed" name="Executed" fill="#3b82f6" />
              <Bar dataKey="total_passed" name="Passed" fill="#22c55e" />
              <Bar dataKey="total_failed" name="Failed" fill="#ef4444" />
              <Bar dataKey="total_defects_raised" name="Defects" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {projectData?.length > 0 && (
        <div className="chart-card">
          <h3>By Project</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={projectData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="project_name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_executed" name="Executed" fill="#3b82f6" />
              <Bar dataKey="total_passed" name="Passed" fill="#22c55e" />
              <Bar dataKey="total_defects_raised" name="Defects" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {dateData?.length > 0 && (
        <div className="chart-card">
          <h3>By Date</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dateData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_reports" name="Reports" fill="#8b5cf6" />
              <Bar dataKey="total_executed" name="Executed" fill="#3b82f6" />
              <Bar dataKey="total_defects_raised" name="Defects" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
