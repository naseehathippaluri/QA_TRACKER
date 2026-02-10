import apiClient from '../api/client';

export const featuresService = {
  list: (params) => apiClient.get('/features/', { params }),
  get: (id) => apiClient.get(`/features/${id}/`),
  create: (data) => apiClient.post('/features/', data),
  update: (id, data) => apiClient.put(`/features/${id}/`, data),
  delete: (id) => apiClient.delete(`/features/${id}/`),
};
