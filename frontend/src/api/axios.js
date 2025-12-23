import axios from 'axios'

// Create axios instance with default config
// IMPORTANT: In dev, Vite proxies requests starting with `/api` (see vite.config.js).
// Backend routes are mounted at `/api/v1`, so our baseURL must be `/api/v1`.
// This still matches the Vite proxy rule (`/api/*`) and forwards to http://localhost:8000.
const axiosInstance = axios.create({
  // IMPORTANT: Backend is mounted at /api/v1 (see backend/app/core/config.py).
  // But there is also a top-level /health route (see backend/app/main.py).
  // If you see “Network Error” in the browser, it usually means the request
  // didn’t reach the API at all (proxy not running, wrong port, mixed content,
  // or CORS/preflight failing).
  baseURL: '/api/v1',
  timeout: 15000,
})

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    // Debug aid: helps diagnose "Failed to fetch" issues related to missing/invalid tokens.
    // Safe in prod; only logs in dev.
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[axios] request', config.method?.toUpperCase(), config.baseURL + config.url, {
        hasToken: !!token,
      })
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Avoid CORS preflight where possible.
    // Vite proxy runs in dev, but in some environments (or when hitting the backend directly)
    // the Authorization header triggers an OPTIONS preflight. Keeping requests "simple"
    // reduces chance of seeing 405 Method Not Allowed preflight issues.
    //
    // IMPORTANT: Do NOT set Content-Type for requests with no body.
    if (config.data == null) {
      // axios may set this implicitly in some cases; ensure it's removed.
      delete config.headers['Content-Type']
      delete config.headers['content-type']
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
    if (import.meta?.env?.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[axios] error', {
        message: error.message,
        code: error.code,
        url: (error.config?.baseURL || '') + (error.config?.url || ''),
        method: error.config?.method,
        // When this is undefined, the browser never got an HTTP response.
        // That’s typical of:
        // - Vite proxy not running / wrong dev server port
        // - backend not reachable
        // - CORS preflight blocked
        // - mixed content (https page calling http api)
        status: error.response?.status,
        data: error.response?.data,
      })
    }

    if (error.response?.status === 401) {
      // IMPORTANT:
      // Don’t hard-redirect from inside the HTTP layer.
      // Initiative Detail triggers multiple parallel calls; if *any* one returns 401,
      // a hard redirect here will bounce the user to /login even when the app could
      // otherwise continue (or show an inline error).
      //
      // Instead, clear the token and emit an event. The router guard (PrivateRoute)
      // will naturally redirect on the next render, without redirect loops.
      localStorage.removeItem('token')
      window.dispatchEvent(new Event('auth:logout'))
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
