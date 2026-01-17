import { apiClient } from '~/lib/api-client'
import { API_ENDPOINTS } from '~/lib/endpoints'

import type {
  BatchSegmentationStatus,
  ImageSegment,
  SegmentationConfig,
  SegmentationJob,
  SegmentationPreset,
  SegmentationSummary,
  SegmentStatus,
} from './types'

// ====== Request Types ======

export interface StartSegmentationRequest {
  batchId: string
  presetId?: string
  config?: Partial<SegmentationConfig>
  forceRerun?: boolean
}

export interface StartSegmentationResponse {
  jobId: string
  batchId: string
  totalItems: number
  message: string
}

export interface ReviewSegmentRequest {
  status: 'approved' | 'rejected'
}

export interface BulkReviewSegmentsRequest {
  segmentIds: string[]
  status: 'approved' | 'rejected'
}

export interface CreateManualSegmentRequest {
  batchItemId: string
  bboxX: number
  bboxY: number
  bboxWidth: number
  bboxHeight: number
  pixelX?: number
  pixelY?: number
  pixelWidth?: number
  pixelHeight?: number
}

export interface UpdateSegmentBboxRequest {
  bboxX: number
  bboxY: number
  bboxWidth: number
  bboxHeight: number
}

export interface ListSegmentsParams {
  status?: SegmentStatus
  limit?: number
  offset?: number
}

// ====== API Functions ======

/**
 * Start segmentation for a batch
 */
export async function startSegmentation(
  request: StartSegmentationRequest,
): Promise<StartSegmentationResponse> {
  return apiClient<StartSegmentationResponse>(
    API_ENDPOINTS.SEGMENTATION.START,
    {
      method: 'POST',
      body: request,
    },
  )
}

/**
 * Get segmentation job status
 */
export async function getSegmentationJobStatus(
  jobId: string,
): Promise<SegmentationJob> {
  return apiClient<SegmentationJob>(
    API_ENDPOINTS.SEGMENTATION.JOB_STATUS(jobId),
    {
      method: 'GET',
    },
  )
}

/**
 * Get batch segmentation status
 */
export async function getBatchSegmentationStatus(
  batchId: string,
): Promise<BatchSegmentationStatus> {
  return apiClient<BatchSegmentationStatus>(
    API_ENDPOINTS.SEGMENTATION.BATCH_STATUS(batchId),
    {
      method: 'GET',
    },
  )
}

/**
 * List segments for a batch
 */
export async function listBatchSegments(
  batchId: string,
  params?: ListSegmentsParams,
): Promise<{ segments: ImageSegment[]; limit: number; offset: number }> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set('status', params.status)
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.offset) searchParams.set('offset', params.offset.toString())

  const url = `${API_ENDPOINTS.SEGMENTATION.BATCH_SEGMENTS(batchId)}?${searchParams.toString()}`
  return apiClient<{ segments: ImageSegment[]; limit: number; offset: number }>(
    url,
    {
      method: 'GET',
    },
  )
}

/**
 * List segments for a batch item
 */
export async function listBatchItemSegments(
  batchItemId: string,
): Promise<{ segments: ImageSegment[] }> {
  return apiClient<{ segments: ImageSegment[] }>(
    API_ENDPOINTS.SEGMENTATION.BATCH_ITEM_SEGMENTS(batchItemId),
    {
      method: 'GET',
    },
  )
}

// Backend response types for summary endpoint
interface BackendImageStat {
  Status: string
  Count: number
}

interface BackendSegmentStat {
  Status: string
  Count: number
  AvgConf: number
}

interface BackendSegmentationSummary {
  imageStats: BackendImageStat[]
  segmentStats: BackendSegmentStat[]
}

/**
 * Get segmentation summary for a batch
 * Transforms the backend response into the expected frontend format
 */
export async function getBatchSegmentationSummary(
  batchId: string,
): Promise<SegmentationSummary> {
  const raw = await apiClient<BackendSegmentationSummary>(
    API_ENDPOINTS.SEGMENTATION.BATCH_SUMMARY(batchId),
    {
      method: 'GET',
    },
  )

  // Transform backend response to frontend expected format
  const imageStats = raw.imageStats || []
  const segmentStats = raw.segmentStats || []

  const getImageCount = (status: string): number => {
    const stat = imageStats.find((s) => s.Status === status)
    return stat?.Count ?? 0
  }

  const getSegmentStat = (
    status: string,
  ): { count: number; avgConf: number } => {
    const stat = segmentStats.find((s) => s.Status === status)
    return { count: stat?.Count ?? 0, avgConf: stat?.AvgConf ?? 0 }
  }

  const approved = getSegmentStat('approved')
  const pending = getSegmentStat('pending_review')
  const rejected = getSegmentStat('rejected')

  const totalSegments = approved.count + pending.count + rejected.count
  const totalImages = imageStats.reduce((sum, s) => sum + s.Count, 0)
  const segmentedImages = getImageCount('completed')
  const pendingImages = getImageCount('pending')
  const failedImages = getImageCount('failed')

  // Calculate weighted average confidence
  const totalWeightedConf =
    approved.count * approved.avgConf +
    pending.count * pending.avgConf +
    rejected.count * rejected.avgConf
  const avgConfidence =
    totalSegments > 0 ? totalWeightedConf / totalSegments : 0

  return {
    batchId,
    totalImages,
    segmentedImages,
    pendingImages,
    failedImages,
    totalSegments,
    pendingSegments: pending.count,
    approvedSegments: approved.count,
    rejectedSegments: rejected.count,
    avgSegmentsPerImage:
      segmentedImages > 0 ? totalSegments / segmentedImages : 0,
    avgConfidence,
  }
}

/**
 * Review a segment (approve/reject)
 */
export async function reviewSegment(
  segmentId: string,
  request: ReviewSegmentRequest,
): Promise<{ message: string; status: string }> {
  return apiClient<{ message: string; status: string }>(
    API_ENDPOINTS.SEGMENTATION.REVIEW_SEGMENT(segmentId),
    {
      method: 'PUT',
      body: request,
    },
  )
}

/**
 * Bulk review multiple segments
 */
export async function bulkReviewSegments(
  request: BulkReviewSegmentsRequest,
): Promise<{ message: string; count: number; status: string }> {
  return apiClient<{ message: string; count: number; status: string }>(
    API_ENDPOINTS.SEGMENTATION.BULK_REVIEW,
    {
      method: 'POST',
      body: request,
    },
  )
}

/**
 * Create a manual segment
 */
export async function createManualSegment(
  request: CreateManualSegmentRequest,
): Promise<{ id: string; message: string }> {
  return apiClient<{ id: string; message: string }>(
    API_ENDPOINTS.SEGMENTATION.CREATE_SEGMENT,
    {
      method: 'POST',
      body: request,
    },
  )
}

/**
 * Update segment bounding box
 */
export async function updateSegmentBbox(
  segmentId: string,
  request: UpdateSegmentBboxRequest,
): Promise<{ message: string }> {
  return apiClient<{ message: string }>(
    API_ENDPOINTS.SEGMENTATION.UPDATE_SEGMENT_BBOX(segmentId),
    {
      method: 'PUT',
      body: request,
    },
  )
}

/**
 * Delete a segment
 */
export async function deleteSegment(
  segmentId: string,
): Promise<{ message: string }> {
  return apiClient<{ message: string }>(
    API_ENDPOINTS.SEGMENTATION.DELETE_SEGMENT(segmentId),
    {
      method: 'DELETE',
    },
  )
}

/**
 * List segmentation presets
 */
export async function listSegmentationPresets(): Promise<{
  presets: SegmentationPreset[]
}> {
  return apiClient<{ presets: SegmentationPreset[] }>(
    API_ENDPOINTS.SEGMENTATION.PRESETS,
    {
      method: 'GET',
    },
  )
}
