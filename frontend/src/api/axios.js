import axios from 'axios'

// Create axios instance with default config
// IMPORTANT: In dev, Vite proxies requests starting with `/api` (see vite.config.js).
// Backend routes are mounted at `/api/v1`, so our baseURL must be `/api/v1`.
// This still matches the Vite proxy rule (`/api/*`) and forwards to http://localhost:8000.
const axiosInstance = axios.create({
  baseURL: '/api/v1',
})

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired/invalid. Clear and let the router guard handle access.
      localStorage.removeItem('token')
      // Avoid hard redirect loops; a simple location change is fine but only if we're not already there.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
