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
  FILES: {
    UPLOAD_BULK: '/files/upload/bulk',
    UPLOAD_BULK_COMPLETE: '/files/upload/bulk/complete',
  },
  BATCHES: {
    LIST: '/batches',
    CREATE: '/batches',
    DETAIL: (id: string) => `/batches/${id}`,
    DELETE: (id: string) => `/batches/${id}`,
  },
} as const
