import apiClient from '../api/client';

export const worklogsService = {
  create: (data) => apiClient.post('/worklogs/', data),
  myList: (params) => apiClient.get('/worklogs/my/', { params }),
  allList: (params) => apiClient.get('/worklogs/all/', { params }),
  filter: (params) => apiClient.get('/worklogs/filter/', { params }),
  get: (id) => apiClient.get(`/worklogs/${id}/`),
  update: (id, data) => apiClient.put(`/worklogs/${id}/`, data),
  delete: (id) => apiClient.delete(`/worklogs/${id}/`),
};
