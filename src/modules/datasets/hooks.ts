import { useQuery } from '@tanstack/react-query'

import { getDatasets } from './api'

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
