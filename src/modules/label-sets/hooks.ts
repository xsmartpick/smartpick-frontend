import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CreateLabelSetRequest } from './api'
import { createLabelSet, getLabelSets } from './api'

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
