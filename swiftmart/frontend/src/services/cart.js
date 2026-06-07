import api from './api'

export const cartService = {
  getCart: () => api.get('/cart').then((r) => r.data),
  addItem: (productId, quantity) =>
    api.post('/cart/items', { product_id: productId, quantity }).then((r) => r.data),
  updateItem: (itemId, quantity) =>
    api.put(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`).then((r) => r.data),
  clearCart: () => api.delete('/cart').then((r) => r.data),
}
