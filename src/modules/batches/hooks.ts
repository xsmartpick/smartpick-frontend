import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CreateBatchRequest, UpdateBatchRequest } from './api'
import {
  createBatch,
  deleteBatch,
  getBatchById,
  getBatches,
  updateBatch,
} from './api'
import type { Batch } from './types'

/**
 * Query key factory for batch-related queries
 * Why: Centralized key management prevents typos and enables type-safe invalidation
 * Pattern follows React Query best practices for hierarchical cache keys
 */
export const batchKeys = {
  all: ['batches'] as const,
  lists: () => [...batchKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...batchKeys.lists(), { filters }] as const,
  details: () => [...batchKeys.all, 'detail'] as const,
  detail: (id: string) => [...batchKeys.details(), id] as const,
}

/**
 * Map API response to Batch type with safe defaults
 * Why: Backend may return null/undefined for optional fields
 * This ensures frontend always has consistent data structure
 */
function mapBatchResponse(
  response: Awaited<ReturnType<typeof getBatches>>[number],
): Batch {
  return {
    id: response.id,
    name: response.name,
    description: response.description || '', // Default to empty string for UI display
    status: (response.status as Batch['status']) || 'draft', // Default to draft status
    imageCount: response.imageCount,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    images: response.images?.map((img) => ({
      id: img.id,
      name: img.name,
      size: img.size,
      contentType: img.contentType,
      uploadStatus: img.uploadStatus,
      downloadUrl: img.downloadUrl,
    })),
  }
}

/**
 * Fetch all batches (list view)
 * Returns minimal batch data without images for performance
 * Why: List endpoint optimized to avoid N+1 queries
 */
export function useBatches() {
  return useQuery({
    queryKey: batchKeys.lists(),
    queryFn: async () => {
      const batches = await getBatches()
      return batches.map((element) => mapBatchResponse(element))
    },
    staleTime: 30 * 1000, // Cache for 30 seconds to reduce API calls
  })
}

/**
 * Fetch single batch with full details (includes images with download URLs)
 * Why: Detail view needs presigned URLs for image display
 */
export function useBatch(id: string) {
  return useQuery({
    queryKey: batchKeys.detail(id),
    queryFn: async () => {
      const batch = await getBatchById(id)
      return mapBatchResponse(batch)
    },
    enabled: !!id, // Only fetch when ID is provided
    staleTime: 30 * 1000,
  })
}

/**
 * Create new batch mutation
 * Why: Invalidates list cache to show new batch immediately
 */
export function useCreateBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateBatchRequest) => createBatch(request),
    onSuccess: () => {
      // Invalidate list cache to refetch with new batch
      // Why: Ensures UI shows newly created batch without manual refresh
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() })
    },
  })
}

/**
 * Update batch mutation
 * Why: Invalidates both detail and list caches for consistency
 */
export function useUpdateBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      batchId,
      request,
    }: {
      batchId: string
      request: UpdateBatchRequest
    }) => updateBatch(batchId, request),
    onSuccess: (_data, variables) => {
      // Invalidate specific batch detail cache
      // Why: User viewing batch detail page sees updated data immediately
      queryClient.invalidateQueries({
        queryKey: batchKeys.detail(variables.batchId),
      })
      // Also invalidate list cache (batch name/status may have changed)
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() })
    },
  })
}

/**
 * Delete batch mutation (soft delete on backend)
 * Why: Invalidates list cache to remove deleted batch from UI
 */
export function useDeleteBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (batchId: string) => deleteBatch(batchId),
    onSuccess: () => {
      // Invalidate list cache to hide deleted batch
      // Why: Backend soft-deletes, frontend should not show deleted batches
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() })
    },
  })
}
