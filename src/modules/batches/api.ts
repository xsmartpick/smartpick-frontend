// Batch API Service
// Author: FemtoHell for SMAR-40
// Following the pattern from datasets/api.ts by Trang Mai

import { apiClient } from '~/lib/api-client'
import { API_ENDPOINTS } from '~/lib/endpoints'

// ============= Batch Types =============

export interface BatchMetadata {
  id: string
  name: string
  description?: string
  datasetId?: string
  createdAt: string
  createdBy: string
  updatedAt: string
  deletedAt?: string
  deletedBy?: string
}

export interface GetBatchesResponse {
  batches: BatchMetadata[]
  total?: number
}

export interface CreateBatchRequest {
  name: string
  description?: string
  datasetId?: string
}

// ============= File Upload Types =============

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

// ============= Error Class =============

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public statusText?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ============= Batch API Functions =============

/**
 * Fetch all batches
 * Uses apiClient for consistency with project patterns
 */
export async function getBatches(): Promise<BatchMetadata[]> {
  const data = await apiClient<BatchMetadata[] | GetBatchesResponse>(
    API_ENDPOINTS.BATCHES.LIST,
    {
      method: 'GET',
    },
  )

  // Handle both array response and object with batches property
  if (Array.isArray(data)) {
    return data
  }

  if ('batches' in data && Array.isArray(data.batches)) {
    return data.batches
  }

  return []
}

/**
 * Create a new batch
 * Uses apiClient for consistency with project patterns
 */
export async function createBatch(
  request: CreateBatchRequest,
): Promise<{ id: string }> {
  return apiClient<{ id: string }>(API_ENDPOINTS.BATCHES.CREATE, {
    method: 'POST',
    body: request,
  })
}

/**
 * Delete a batch (soft delete)
 * Author: FemtoHell for SMAR-40
 * Uses apiClient for auth and error handling
 */
export async function deleteBatch(batchId: string): Promise<void> {
  await apiClient(API_ENDPOINTS.BATCHES.DELETE(batchId), {
    method: 'DELETE',
  })
}

// ============= File Upload API Functions =============

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
