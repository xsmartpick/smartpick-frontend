export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    QR: {
      GENERATE: '/auth/qr/generate',
      POLL: (token: string) => `/auth/qr/poll/${token}`,
    },
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
