import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CreateBatchRequest } from './api'
import { createBatch, getBatches } from './api'
import type { Batch } from './types'

export const batchKeys = {
  all: ['batches'] as const,
  lists: () => [...batchKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...batchKeys.lists(), { filters }] as const,
  details: () => [...batchKeys.all, 'detail'] as const,
  detail: (id: string) => [...batchKeys.details(), id] as const,
}

/**
 * Map API response to Batch type
 */
function mapBatchResponse(
  response: Awaited<ReturnType<typeof getBatches>>[number],
): Batch {
  return {
    id: response.id,
    name: response.name,
    description: response.description || '',
    status: (response.status as Batch['status']) || 'draft',
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

export function useBatches() {
  return useQuery({
    queryKey: batchKeys.lists(),
    queryFn: async () => {
      const batches = await getBatches()
      return batches.map((element) => mapBatchResponse(element))
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

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
