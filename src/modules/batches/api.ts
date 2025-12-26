import { apiClient } from '~/lib/api-client'
import { API_ENDPOINTS } from '~/lib/endpoints'

/**
 * Request to start bulk file upload
 */
export interface BulkUploadRequest {
  requests: Array<{
    fileId: string
    fileName: string
    contentType: string
    sizeBytes: number
  }>
}

/**
 * Response from bulk upload start
 */
export interface BulkUploadResponse {
  responses: Array<{
    fileId: string
    uploadUrl: string
  }>
}

/**
 * Request to complete bulk file upload
 */
export interface BulkCompleteUploadRequest {
  requests: Array<{
    fileId: string
    status: 'uploaded' | 'failed'
  }>
}

/**
 * Response from bulk upload complete
 */
export interface BulkCompleteUploadResponse {
  responses: Array<{
    fileId: string
    status: 'uploaded' | 'failed'
    error?: string // Optional error message for files that couldn't be updated
  }>
}

/**
 * Start bulk file upload - get presigned URLs
 */
export async function startBulkUpload(
  request: BulkUploadRequest,
): Promise<BulkUploadResponse> {
  return apiClient<BulkUploadResponse>(API_ENDPOINTS.FILES.UPLOAD_BULK, {
    method: 'POST',
    body: request,
  })
}

/**
 * Complete bulk file upload - update upload status
 */
export async function completeBulkUpload(
  request: BulkCompleteUploadRequest,
): Promise<BulkCompleteUploadResponse> {
  return apiClient<BulkCompleteUploadResponse>(
    API_ENDPOINTS.FILES.UPLOAD_BULK_COMPLETE,
    {
      method: 'POST',
      body: request,
    },
  )
}
