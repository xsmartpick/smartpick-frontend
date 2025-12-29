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

/**
 * Image from batch API response
 */
export interface BatchImageResponse {
  id: string
  name: string
  size: number
  contentType: string
  uploadStatus: string
  downloadUrl: string
}

/**
 * Batch from API response
 */
export interface BatchResponse {
  id: string
  name: string
  description: string
  status: string
  imageCount: number
  createdAt: string
  updatedAt: string
  images?: BatchImageResponse[]
}

/**
 * Get all batches
 */
export async function getBatches(): Promise<BatchResponse[]> {
  return apiClient<BatchResponse[]>(API_ENDPOINTS.BATCHES.LIST, {
    method: 'GET',
  })
}

/**
 * Request to create a new batch
 */
export interface CreateBatchRequest {
  name: string
  description?: string
  datasetId?: string | null
  fileIds?: string[]
}

/**
 * Response from creating a batch
 */
export interface CreateBatchResponse extends BatchResponse {}

/**
 * Create a new batch
 */
export async function createBatch(
  request: CreateBatchRequest,
): Promise<CreateBatchResponse> {
  return apiClient<CreateBatchResponse>(API_ENDPOINTS.BATCHES.CREATE, {
    method: 'POST',
    body: request,
  })
}

/**
 * Get a single batch by ID
 */
export async function getBatchById(batchId: string): Promise<BatchResponse> {
  return apiClient<BatchResponse>(API_ENDPOINTS.BATCHES.GET(batchId), {
    method: 'GET',
  })
}

/**
 * Request to update a batch
 */
export interface UpdateBatchRequest {
  name?: string
  description?: string
  status?: string
  datasetId?: string | null
}

/**
 * Update an existing batch
 */
export async function updateBatch(
  batchId: string,
  request: UpdateBatchRequest,
): Promise<void> {
  await apiClient(API_ENDPOINTS.BATCHES.UPDATE(batchId), {
    method: 'PATCH',
    body: request,
  })
}

/**
 * Delete a batch (soft delete)
 */
export async function deleteBatch(batchId: string): Promise<void> {
  await apiClient(API_ENDPOINTS.BATCHES.DELETE(batchId), {
    method: 'DELETE',
  })
}
