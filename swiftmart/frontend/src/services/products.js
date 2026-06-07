import api from './api'

export const productService = {
  getCategories: () => api.get('/products/categories').then((r) => r.data),

  getProducts: (params) =>
    api.get('/products', { params }).then((r) => r.data),

  getProduct: (id) => api.get(`/products/${id}`).then((r) => r.data),

  getProductBySlug: (slug) => api.get(`/products/slug/${slug}`).then((r) => r.data),
}

export const adminProductService = {
  getProducts: (params) => api.get('/admin/products', { params }).then((r) => r.data),
  createProduct: (data) => api.post('/admin/products', data).then((r) => r.data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data).then((r) => r.data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`).then((r) => r.data),
  uploadImage: (id, formData) =>
    api.post(`/admin/products/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  getCategories: () => api.get('/admin/categories').then((r) => r.data),
  createCategory: (data) => api.post('/admin/categories', data).then((r) => r.data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data).then((r) => r.data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`).then((r) => r.data),
}
