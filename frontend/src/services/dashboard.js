import apiClient from '../api/client';

export const dashboardService = {
  summary: (params) => apiClient.get('/dashboard/summary', { params }),
  analytics: (params) => apiClient.get('/dashboard/analytics', { params }),
  /** Aggregated totals for Analytics. Params: date_from, date_to (optional: user). */
  analyticsSummary: (params) => apiClient.get('/dashboard/analytics/summary', { params }),
  /** Per-user aggregates for Analytics bar charts. Params: date_from, date_to (optional: user). */
  analyticsByUser: (params) => apiClient.get('/dashboard/analytics/by-user', { params }),
  /**
   * Export work logs to Excel. Admin only. Optional params: date_from, date_to, feature, user.
   * Returns blob; use downloadExportBlob to save as file.
   */
  exportExcel: (params) => apiClient.get('/dashboard/export', { params, responseType: 'blob' }),
};

/**
 * Trigger browser download of an export blob (e.g. from exportExcel).
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadExportBlob(blob, filename = 'worklogs_export.xlsx') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
