import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CreateDatasetRequest, UpdateDatasetRequest } from './api'
import { createDataset, getDatasets, updateDataset } from './api'

export const datasetKeys = {
  all: ['datasets'] as const,
  lists: () => [...datasetKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...datasetKeys.lists(), { filters }] as const,
  details: () => [...datasetKeys.all, 'detail'] as const,
  detail: (id: string) => [...datasetKeys.details(), id] as const,
}

export function useDatasets() {
  return useQuery({
    queryKey: datasetKeys.lists(),
    queryFn: getDatasets,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useCreateDataset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateDatasetRequest) => createDataset(request),
    onSuccess: () => {
      // Invalidate and refetch datasets list
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() })
    },
  })
}

export function useUpdateDataset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string
      request: UpdateDatasetRequest
    }) => updateDataset(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() })
    },
  })
}
