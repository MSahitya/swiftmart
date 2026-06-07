import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { queryClient } from '../store/queryClient'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)))
  failedQueue = []
}

// Refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }
      original._retry = true
      isRefreshing = true
      const { refreshToken, setAuth, clearAuth, user } = useAuthStore.getState()
      if (!refreshToken) {
        clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      }
      try {
        const res = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refresh_token: refreshToken })
        const { access_token, refresh_token } = res.data.data
        setAuth(user, access_token, refresh_token)
        original.headers.Authorization = `Bearer ${access_token}`
        processQueue(null, access_token)
        return api(original)
      } catch (err) {
        processQueue(err, null)
        clearAuth()
        queryClient.clear()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
