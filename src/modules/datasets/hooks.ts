import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  CreateDatasetFromBatchesRequest,
  CreateDatasetRequest,
  ExportDatasetRequest,
  UpdateDatasetRequest,
} from './api'
import {
  addBatchesToDataset,
  createDataset,
  createDatasetFromBatches,
  deleteDataset,
  exportDataset,
  getDataset,
  getDatasets,
  getExportStatus,
  updateDataset,
} from './api'

export const datasetKeys = {
  all: ['datasets'] as const,
  lists: () => [...datasetKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...datasetKeys.lists(), { filters }] as const,
  details: () => [...datasetKeys.all, 'detail'] as const,
  detail: (id: string) => [...datasetKeys.details(), id] as const,
  exports: (id: string) => [...datasetKeys.detail(id), 'exports'] as const,
  exportJob: (id: string, jobId: string) =>
    [...datasetKeys.exports(id), jobId] as const,
}

export function useDatasets() {
  return useQuery({
    queryKey: datasetKeys.lists(),
    queryFn: getDatasets,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useDataset(id: string | undefined) {
  return useQuery({
    queryKey: datasetKeys.detail(id ?? ''),
    queryFn: () => {
      if (!id) throw new Error('Dataset ID is required')
      return getDataset(id)
    },
    enabled: !!id,
    staleTime: 30 * 1000,
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

export function useCreateDatasetFromBatches() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateDatasetFromBatchesRequest) =>
      createDatasetFromBatches(request),
    onSuccess: () => {
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: datasetKeys.detail(variables.id),
      })
    },
  })
}

export function useDeleteDataset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteDataset(id),
    onSuccess: () => {
      // Refresh dataset list after deletion
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() })
    },
  })
}

export function useAddBatchesToDataset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      datasetId,
      batchIds,
    }: {
      datasetId: string
      batchIds: string[]
    }) => addBatchesToDataset(datasetId, batchIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: datasetKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: datasetKeys.detail(variables.datasetId),
      })
    },
  })
}

export function useExportDataset() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      datasetId,
      request,
    }: {
      datasetId: string
      request: ExportDatasetRequest
    }) => exportDataset(datasetId, request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: datasetKeys.detail(variables.datasetId),
      })
    },
  })
}

export function useExportStatus(
  datasetId: string | undefined,
  jobId: string | undefined,
  options?: { polling?: boolean },
) {
  return useQuery({
    queryKey: datasetKeys.exportJob(datasetId ?? '', jobId ?? ''),
    queryFn: () => {
      if (!datasetId || !jobId)
        throw new Error('Dataset ID and Job ID required')
      return getExportStatus(datasetId, jobId)
    },
    enabled: !!datasetId && !!jobId,
    refetchInterval: options?.polling ? 2000 : false,
    staleTime: 1000,
  })
}
