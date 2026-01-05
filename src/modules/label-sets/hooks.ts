import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CreateLabelSetRequest, UpdateLabelSetRequest } from './api'
import {
  createLabelSet,
  deleteLabelSet,
  getLabelSets,
  updateLabelSet,
} from './api'

export const labelSetKeys = {
  all: ['label-sets'] as const,
  lists: () => [...labelSetKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...labelSetKeys.lists(), { filters }] as const,
  details: () => [...labelSetKeys.all, 'detail'] as const,
  detail: (id: string) => [...labelSetKeys.details(), id] as const,
}

export function useLabelSets() {
  return useQuery({
    queryKey: labelSetKeys.lists(),
    queryFn: getLabelSets,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useCreateLabelSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateLabelSetRequest) => createLabelSet(request),
    onSuccess: () => {
      // Invalidate and refetch label sets list
      queryClient.invalidateQueries({ queryKey: labelSetKeys.lists() })
    },
  })
}

export function useUpdateLabelSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string
      request: UpdateLabelSetRequest
    }) => updateLabelSet(id, request),
    onSuccess: (updated) => {
      queryClient.setQueryData(labelSetKeys.lists(), (current) => {
        if (!Array.isArray(current)) return current
        return current.map((labelSet) =>
          labelSet.id === updated.id ? updated : labelSet,
        )
      })
    },
  })
}

export function useDeleteLabelSet() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteLabelSet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labelSetKeys.lists() })
    },
  })
}
