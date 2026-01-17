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
  DASHBOARD: {
    STATS: '/dashboard/stats',
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
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    DETAIL: (id: string) => `/projects/${id}`,
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
  },
  BATCHES: {
    LIST: '/batches',
    CREATE: '/batches',
    DETAIL: (id: string) => `/batches/${id}`,
    DELETE: (id: string) => `/batches/${id}`,
    ADD_IMAGES: (id: string) => `/batches/${id}/images`,
    CONVERT_TO_DATASET: (id: string) => `/batches/${id}/convert-to-dataset`,
  },
  TASKS: {
    LIST: '/tasks',
    CREATE: '/tasks',
    DETAIL: (id: string) => `/tasks/${id}`,
    DELETE: (id: string) => `/tasks/${id}`,
    SEGMENTS: (taskId: string) => `/tasks/${taskId}/segments`,
  },
  SEGMENTATION: {
    START: '/segmentation/start',
    JOB_STATUS: (jobId: string) => `/segmentation/jobs/${jobId}`,
    BATCH_STATUS: (batchId: string) =>
      `/segmentation/batches/${batchId}/status`,
    BATCH_SEGMENTS: (batchId: string) =>
      `/segmentation/batches/${batchId}/segments`,
    BATCH_SUMMARY: (batchId: string) =>
      `/segmentation/batches/${batchId}/summary`,
    BATCH_ITEM_SEGMENTS: (batchItemId: string) =>
      `/segmentation/batch-items/${batchItemId}/segments`,
    CREATE_SEGMENT: '/segmentation/segments',
    REVIEW_SEGMENT: (segmentId: string) =>
      `/segmentation/segments/${segmentId}/review`,
    UPDATE_SEGMENT_BBOX: (segmentId: string) =>
      `/segmentation/segments/${segmentId}/bbox`,
    DELETE_SEGMENT: (segmentId: string) =>
      `/segmentation/segments/${segmentId}`,
    BULK_REVIEW: '/segmentation/segments/bulk-review',
    PRESETS: '/segmentation/presets',
  },
  LABELING: {
    SAVE_SEGMENT_LABELS: '/labeling/segments',
    GET_SEGMENT_LABELS: (batchId: string) =>
      `/labeling/batches/${batchId}/segments`,
    SAVE_SINGLE_LABEL: (segmentId: string) => `/labeling/segments/${segmentId}`,
  },
  DATASETS: {
    LIST: '/datasets',
    CREATE: '/datasets',
    DETAIL: (id: string) => `/datasets/${id}`,
    UPDATE: (id: string) => `/datasets/${id}`,
    DELETE: (id: string) => `/datasets/${id}`,
    EXPORT: (id: string) => `/datasets/${id}/export`,
    ADD_BATCHES: (id: string) => `/datasets/${id}/batches`,
  },
} as const
