export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  // Future endpoints for SmartPick features
  CASHEW: {
    CLASSIFICATION: '/cashew/classification',
    STATS: '/cashew/stats',
  },
} as const
