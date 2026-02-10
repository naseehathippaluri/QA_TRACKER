import apiClient from './client';

export const reportsApi = {
  create: (data) => apiClient.post('/reports/', data),
  myList: (params) => apiClient.get('/reports/my/', { params }),
  allList: (params) => apiClient.get('/reports/all/', { params }),
  filter: (params) => apiClient.get('/reports/filter/', { params }),
  get: (id) => apiClient.get(`/reports/${id}/`),
  update: (id, data) => apiClient.put(`/reports/${id}/`, data),
  delete: (id) => apiClient.delete(`/reports/${id}/`),
  summaryUser: (params) => apiClient.get('/reports/summary/user/', { params }),
  summaryProject: (params) => apiClient.get('/reports/summary/project/', { params }),
  summaryDate: (params) => apiClient.get('/reports/summary/date/', { params }),
  summaryMe: (params) => apiClient.get('/reports/summary/me/', { params }),
};
