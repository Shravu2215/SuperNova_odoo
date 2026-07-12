import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import toast from 'react-hot-toast'

const TOKEN_KEY = import.meta.env.VITE_JWT_STORAGE_KEY as string

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // The refresh token lives in an httpOnly cookie set by the backend.
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Backend envelope is always { success, data, message } or { success:false, error:{code,message,details} }.
// Unwrap `data` so callers never touch the envelope.
export function unwrap<T>(res: { data: { data: T } }): T {
  return res.data.data
}

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${import.meta.env.VITE_API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .then((res) => {
        const token = res.data.data.accessToken as string
        setToken(token)
        return token
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: { code?: string; message?: string; details?: any } }>) => {
    const config = error.config as RetryConfig | undefined
    const status = error.response?.status
    const isAuthRoute = config?.url?.includes('/auth/login') || config?.url?.includes('/auth/signup') || config?.url?.includes('/auth/refresh')

    // Silently refresh the access token once on a 401, then retry the original request.
    if (status === 401 && config && !config._retried && !isAuthRoute) {
      config._retried = true
      try {
        const token = await refreshAccessToken()
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token}`
        return api(config)
      } catch {
        clearToken()
        localStorage.removeItem('assetflow_user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    }

    const payload = error.response?.data?.error
    const message = payload?.message || 'An error occurred'
    const code = payload?.code

    if (isAuthRoute) {
      // Let the caller (login/signup forms) render its own inline error.
      return Promise.reject(error)
    }

    if (code === 'ASSET_ALREADY_ALLOCATED' || code === 'ASSET_UNAVAILABLE') {
      toast.error(message)
    } else if (code === 'BOOKING_CONFLICT') {
      toast.error('Time slot conflicts with existing booking')
    } else {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api
