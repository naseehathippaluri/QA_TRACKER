import apiClient from './client';

export const authApi = {
  register: (data) => apiClient.post('/auth/register/', data),
  login: (data) => apiClient.post('/auth/login/', data),
  refresh: (data) => apiClient.post('/auth/token/refresh/', data),
  logout: (data) => apiClient.post('/auth/logout/', data),
  users: () => apiClient.get('/auth/users/'),
};
