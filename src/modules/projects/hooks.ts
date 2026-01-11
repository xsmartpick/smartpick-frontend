import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CreateProjectRequest } from './api'
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from './api'
import type { UpdateProjectFormData } from './types'

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
}

/**
 * Fetch all projects
 */
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: getProjects,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Fetch a single project by ID
 */
export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required')
      return getProject(id)
    },
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateProjectRequest) => createProject(request),
    onSuccess: () => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}

/**
 * Update a project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectFormData }) =>
      updateProject(id, data),
    onSuccess: (_data, variables) => {
      // Invalidate both lists and the specific project detail
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(variables.id),
      })
    },
  })
}

/**
 * Delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    },
  })
}
