import axios from 'axios'

const adminClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

adminClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue: { resolve: (v: string) => void; reject: (e: unknown) => void }[] = []

adminClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return adminClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refresh = localStorage.getItem('refresh_token')
      if (!refresh) {
        localStorage.clear()
        window.location.href = '/admin/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post('/api/token/refresh/', { refresh })
        localStorage.setItem('access_token', data.access)
        adminClient.defaults.headers.common.Authorization = `Bearer ${data.access}`
        failedQueue.forEach(({ resolve }) => resolve(data.access))
        failedQueue = []
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        return adminClient(originalRequest)
      } catch (refreshError) {
        failedQueue.forEach(({ reject }) => reject(refreshError))
        failedQueue = []
        localStorage.clear()
        window.location.href = '/admin/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default adminClient
