import api from './api'

export const authService = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  logout: (refreshToken) => api.post('/auth/logout', { refresh_token: refreshToken }),
  getMe: () => api.get('/auth/me').then((r) => r.data),
  updateMe: (data) => api.put('/auth/me', data).then((r) => r.data),
  changePassword: (data) => api.post('/auth/change-password', data).then((r) => r.data),
}
