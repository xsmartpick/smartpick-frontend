import { ofetch } from 'ofetch'

// In development, use relative path to leverage Vite proxy
// In production, use VITE_API_BASE_URL env var
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '/v1' : 'http://localhost:8080/v1')

export const apiClient = ofetch.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Request interceptor - add auth token
  onRequest({ options }) {
    const token = localStorage.getItem('smartpick_token')
    if (token) {
       
      ;(options.headers as any).Authorization = `Bearer ${token}`
    }
  },
  // Response error handler
  onResponseError({ response }) {
    console.error('API Error:', response.status, response._data)

    // Handle common errors
    if (response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('smartpick_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
  },
})
