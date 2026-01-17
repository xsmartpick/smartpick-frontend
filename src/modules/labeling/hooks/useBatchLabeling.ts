import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { SegmentLabelAssignment } from '../api'
import {
  CASHEW_LABELS,
  getBatchLabelingImages,
  removeSegmentLabel,
  saveSegmentLabel,
  saveSegmentLabels,
} from '../api'

/**
 * Query keys for labeling
 */
export const labelingKeys = {
  all: ['labeling'] as const,
  batchImages: (batchId: string) =>
    [...labelingKeys.all, 'batch-images', batchId] as const,
}

/**
 * Hook to fetch labeling images for a batch
 */
export function useBatchLabelingImages(batchId: string | undefined) {
  return useQuery({
    queryKey: labelingKeys.batchImages(batchId || ''),
    queryFn: async () => {
      const result = await getBatchLabelingImages(batchId!)
      return result
    },
    enabled: !!batchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get the predefined cashew labels
 */
export function useCashewLabels() {
  return CASHEW_LABELS
}

/**
 * Hook to save a single segment label (for auto-save)
 */
export function useSaveSegmentLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      segmentId,
      labelId,
      labelName,
    }: {
      segmentId: string
      labelId: string
      labelName: string
    }) => saveSegmentLabel(segmentId, labelId, labelName),
    onSuccess: () => {
      // Invalidate labeling queries to refresh data
      queryClient.invalidateQueries({ queryKey: labelingKeys.all })
    },
  })
}

/**
 * Hook to remove a segment label
 */
export function useRemoveSegmentLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (segmentId: string) => removeSegmentLabel(segmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labelingKeys.all })
    },
  })
}

/**
 * Hook to save multiple segment labels in bulk
 */
export function useSaveSegmentLabels() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      batchId,
      assignments,
    }: {
      batchId: string
      assignments: SegmentLabelAssignment[]
    }) => saveSegmentLabels(batchId, assignments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labelingKeys.all })
    },
  })
}
