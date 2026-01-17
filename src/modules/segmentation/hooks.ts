import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  BulkReviewSegmentsRequest,
  CreateManualSegmentRequest,
  ListSegmentsParams,
  ReviewSegmentRequest,
  StartSegmentationRequest,
  UpdateSegmentBboxRequest,
} from './api'
import {
  bulkReviewSegments,
  createManualSegment,
  deleteSegment,
  getBatchSegmentationStatus,
  getBatchSegmentationSummary,
  getSegmentationJobStatus,
  listBatchItemSegments,
  listBatchSegments,
  listSegmentationPresets,
  reviewSegment,
  startSegmentation,
  updateSegmentBbox,
} from './api'

// ====== Query Keys ======

export const segmentationKeys = {
  all: ['segmentation'] as const,
  jobs: () => [...segmentationKeys.all, 'jobs'] as const,
  job: (jobId: string) => [...segmentationKeys.jobs(), jobId] as const,
  batchStatus: (batchId: string) =>
    [...segmentationKeys.all, 'batch-status', batchId] as const,
  batchSegments: (batchId: string, params?: ListSegmentsParams) =>
    [...segmentationKeys.all, 'batch-segments', batchId, params] as const,
  batchItemSegments: (batchItemId: string) =>
    [...segmentationKeys.all, 'batch-item-segments', batchItemId] as const,
  batchSummary: (batchId: string) =>
    [...segmentationKeys.all, 'batch-summary', batchId] as const,
  presets: () => [...segmentationKeys.all, 'presets'] as const,
}

// ====== Queries ======

/**
 * Get segmentation job status with polling support
 */
export function useSegmentationJob(
  jobId: string | undefined,
  options?: { polling?: boolean },
) {
  return useQuery({
    queryKey: segmentationKeys.job(jobId ?? ''),
    queryFn: () => {
      if (!jobId) throw new Error('Job ID is required')
      return getSegmentationJobStatus(jobId)
    },
    enabled: !!jobId,
    refetchInterval: options?.polling ? 2000 : false, // Poll every 2s if enabled
    staleTime: 1000,
  })
}

/**
 * Get batch segmentation status
 */
export function useBatchSegmentationStatus(batchId: string | undefined) {
  return useQuery({
    queryKey: segmentationKeys.batchStatus(batchId ?? ''),
    queryFn: () => {
      if (!batchId) throw new Error('Batch ID is required')
      return getBatchSegmentationStatus(batchId)
    },
    enabled: !!batchId,
    staleTime: 30 * 1000,
  })
}

/**
 * List segments for a batch
 */
export function useBatchSegments(
  batchId: string | undefined,
  params?: ListSegmentsParams,
) {
  return useQuery({
    queryKey: segmentationKeys.batchSegments(batchId ?? '', params),
    queryFn: () => {
      if (!batchId) throw new Error('Batch ID is required')
      return listBatchSegments(batchId, params)
    },
    enabled: !!batchId,
    staleTime: 30 * 1000,
  })
}

/**
 * List segments for a batch item
 */
export function useBatchItemSegments(batchItemId: string | undefined) {
  return useQuery({
    queryKey: segmentationKeys.batchItemSegments(batchItemId ?? ''),
    queryFn: () => {
      if (!batchItemId) throw new Error('Batch item ID is required')
      return listBatchItemSegments(batchItemId)
    },
    enabled: !!batchItemId,
    staleTime: 30 * 1000,
  })
}

/**
 * Get segmentation summary for a batch
 */
export function useBatchSegmentationSummary(batchId: string | undefined) {
  return useQuery({
    queryKey: segmentationKeys.batchSummary(batchId ?? ''),
    queryFn: () => {
      if (!batchId) throw new Error('Batch ID is required')
      return getBatchSegmentationSummary(batchId)
    },
    enabled: !!batchId,
    staleTime: 30 * 1000,
  })
}

/**
 * List segmentation presets
 */
export function useSegmentationPresets() {
  return useQuery({
    queryKey: segmentationKeys.presets(),
    queryFn: listSegmentationPresets,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ====== Mutations ======

/**
 * Start segmentation for a batch
 */
export function useStartSegmentation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: StartSegmentationRequest) =>
      startSegmentation(request),
    onSuccess: (_data, variables) => {
      // Invalidate batch segmentation status
      queryClient.invalidateQueries({
        queryKey: segmentationKeys.batchStatus(variables.batchId),
      })
    },
  })
}

/**
 * Review a segment (approve/reject)
 */
export function useReviewSegment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      segmentId,
      request,
    }: {
      segmentId: string
      request: ReviewSegmentRequest
    }) => reviewSegment(segmentId, request),
    onSuccess: () => {
      // Invalidate all segment queries
      queryClient.invalidateQueries({
        queryKey: segmentationKeys.all,
      })
    },
  })
}

/**
 * Bulk review multiple segments
 */
export function useBulkReviewSegments() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: BulkReviewSegmentsRequest) =>
      bulkReviewSegments(request),
    onSuccess: () => {
      // Invalidate all segment queries
      queryClient.invalidateQueries({
        queryKey: segmentationKeys.all,
      })
    },
  })
}

/**
 * Create a manual segment
 */
export function useCreateManualSegment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateManualSegmentRequest) =>
      createManualSegment(request),
    onSuccess: (_data, variables) => {
      // Invalidate batch item segments
      queryClient.invalidateQueries({
        queryKey: segmentationKeys.batchItemSegments(variables.batchItemId),
      })
    },
  })
}

/**
 * Update segment bounding box
 */
export function useUpdateSegmentBbox() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      segmentId,
      request,
    }: {
      segmentId: string
      request: UpdateSegmentBboxRequest
    }) => updateSegmentBbox(segmentId, request),
    onSuccess: () => {
      // Invalidate all segment queries
      queryClient.invalidateQueries({
        queryKey: segmentationKeys.all,
      })
    },
  })
}

/**
 * Delete a segment
 */
export function useDeleteSegment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (segmentId: string) => deleteSegment(segmentId),
    onSuccess: () => {
      // Invalidate all segment queries
      queryClient.invalidateQueries({
        queryKey: segmentationKeys.all,
      })
    },
  })
}
