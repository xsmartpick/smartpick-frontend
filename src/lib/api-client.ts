import { ofetch } from 'ofetch'

// In development, use relative path to leverage Vite proxy
// In production, use VITE_API_BASE_URL env var (set during CI build)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/v1'

/**
 * Get the auth token from localStorage
 * Note: atomWithStorage stores values as JSON, so we need to parse it
 */
function getAuthToken(): string | null {
  try {
    const stored = localStorage.getItem('smartpick_token')
    if (!stored || stored === 'null') return null
    // Parse JSON - atomWithStorage stores strings with quotes
    return JSON.parse(stored)
  } catch {
    // If parsing fails, try using raw value (fallback)
    return localStorage.getItem('smartpick_token')
  }
}

export const apiClient = ofetch.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Request interceptor - add auth token
  onRequest({ options }) {
    const token = getAuthToken()
    if (token) {
      // Simple approach: convert headers to a new Headers object if needed
      const existingHeaders = new Headers(options.headers as HeadersInit)
      existingHeaders.set('Authorization', `Bearer ${token}`)
      options.headers = existingHeaders
    }
  },
  // Response error handler
  onResponseError({ response }) {
    console.error('API Error:', response.status, response._data)

    // Handle common errors
    if (response.status === 401) {
      // Skip 401 handling if we're already on the login page
      // This prevents race conditions during login/navigation
      if (window.location.pathname === '/login') {
        return
      }

      // Check if we have a token in localStorage
      const hasStoredToken = !!getAuthToken()

      // Only clear and redirect if we had a token but it was rejected
      // This prevents clearing during race conditions when token hasn't been set yet
      const isAuthEndpoint = response.url?.includes('/auth/')
      if (!isAuthEndpoint && hasStoredToken) {
        localStorage.removeItem('smartpick_token')
        localStorage.removeItem('smartpick_user')
        window.location.href = '/login'
      }
    }
  },
})
