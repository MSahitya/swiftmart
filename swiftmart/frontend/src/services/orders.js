import api from './api'

export const orderService = {
  createOrder: (data) => api.post('/orders', data).then((r) => r.data),
  getOrders: (params) => api.get('/orders', { params }).then((r) => r.data),
  getOrder: (id) => api.get(`/orders/${id}`).then((r) => r.data),
}

export const adminOrderService = {
  getOrders: (params) => api.get('/admin/orders', { params }).then((r) => r.data),
  updateStatus: (id, status) =>
    api.put(`/admin/orders/${id}/status`, { status }).then((r) => r.data),
  getDashboard: () => api.get('/admin/dashboard').then((r) => r.data),
  getUsers: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  getLowStock: () => api.get('/admin/low-stock').then((r) => r.data),
}
