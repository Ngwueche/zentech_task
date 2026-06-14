import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { authToken } from './authToken'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:7001'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authToken.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authToken.clear()
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }
    return Promise.reject(error)
  },
)

export type ApiError = {
  message: string
  errors?: string[]
  status: number
}

export function extractApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as {
      success?: boolean
      message?: string
      errors?: string[]
    } | undefined

    if (data?.message) {
      return {
        message: data.message,
        errors: data.errors,
        status: error.response?.status ?? 0,
      }
    }

    if (!error.response) {
      return {
        message: 'Unable to reach the server. Check your connection.',
        status: 0,
      }
    }

    return {
      message: `Request failed with status ${error.response.status}`,
      status: error.response.status,
    }
  }

  return {
    message: 'An unexpected error occurred.',
    status: 0,
  }
}

export function normalizeApiResponse<T>(data: unknown): T {
  if (typeof data === 'object' && data !== null) {
    const d = data as Record<string, unknown>
    // Backend uses "isSuccess" (not "success") as the envelope discriminator
    if (('isSuccess' in d || 'success' in d) && 'data' in d) {
      return d['data'] as T
    }
  }
  return data as T
}
