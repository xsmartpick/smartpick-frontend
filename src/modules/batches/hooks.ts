// Batch React Hooks
// Author: FemtoHell for SMAR-40
// Following the pattern from datasets/hooks.ts by Trang Mai

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CreateBatchRequest } from './api'
import { createBatch, deleteBatch, getBatches } from './api'

export const batchKeys = {
  all: ['batches'] as const,
  lists: () => [...batchKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...batchKeys.lists(), { filters }] as const,
  details: () => [...batchKeys.all, 'detail'] as const,
  detail: (id: string) => [...batchKeys.details(), id] as const,
}

/**
 * Hook to fetch all batches
 */
export function useBatches() {
  return useQuery({
    queryKey: batchKeys.lists(),
    queryFn: getBatches,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Hook to create a new batch
 */
export function useCreateBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateBatchRequest) => createBatch(request),
    onSuccess: () => {
      // Invalidate and refetch batches list
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() })
    },
  })
}

/**
 * Hook to delete a batch (soft delete)
 * Author: FemtoHell for SMAR-40
 */
export function useDeleteBatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (batchId: string) => deleteBatch(batchId),
    onSuccess: () => {
      // Invalidate and refetch batches list after successful deletion
      queryClient.invalidateQueries({ queryKey: batchKeys.lists() })
    },
  })
}
