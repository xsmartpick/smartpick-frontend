export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/v1/me',
  },
  // Future endpoints for SmartPick features
  CASHEW: {
    CLASSIFICATION: '/cashew/classification',
    STATS: '/cashew/stats',
  },
  FILES: {
    UPLOAD_BULK: '/files/upload/bulk',
    UPLOAD_BULK_COMPLETE: '/files/upload/bulk/complete',
  },
  BATCHES: {
    LIST: '/batches',
    CREATE: '/batches',
  },
} as const
