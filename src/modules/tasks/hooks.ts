import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CreateTaskRequest, TaskResponse } from './api'
import { createTask, deleteTask, getTask, getTasks } from './api'
import type { Task } from './types'

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...taskKeys.lists(), { filters }] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  batchCount: (batchId: string) =>
    [...taskKeys.all, 'batch-count', batchId] as const,
}

/**
 * Map API response to Task type
 */
function mapTaskResponse(response: TaskResponse): Task {
  return {
    id: response.id,
    name: response.name,
    datasetName: response.batchId, // Using batchId as dataset name for now
    totalImages: response.labelingProgress.totalImages,
    status:
      response.labelingProgress.progressPercent === 100
        ? 'done'
        : response.labelingProgress.progressPercent > 0
          ? 'in_progress'
          : 'todo',
    progress: response.labelingProgress.progressPercent,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  }
}

/**
 * Get all tasks (replacing useMyTasks)
 */
export function useMyTasks(params?: {
  batchId?: string
  includeImages?: boolean
}) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: async () => {
      const tasks = await getTasks(params)
      return tasks.map((task) => mapTaskResponse(task))
    },
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * Get all tasks with full response (for labeling)
 */
export function useTasks(params?: {
  batchId?: string
  includeImages?: boolean
}) {
  return useQuery({
    queryKey: taskKeys.list({ ...params, raw: true }),
    queryFn: () => getTasks(params),
    staleTime: 30 * 1000,
  })
}

/**
 * Get a single task by ID
 */
export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('Task ID is required')
      return getTask(id)
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  })
}

/**
 * Create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateTaskRequest) => createTask(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

/**
 * Delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

/**
 * Get task count for a specific batch
 */
export function useBatchTaskCount(batchId: string | undefined) {
  return useQuery({
    queryKey: taskKeys.batchCount(batchId ?? ''),
    queryFn: async () => {
      if (!batchId) return 0
      const tasks = await getTasks({ batchId })
      return tasks.length
    },
    enabled: !!batchId,
    staleTime: 60 * 1000, // 1 minute
  })
}

/**
 * Get tasks for a specific batch
 */
export function useBatchTasks(batchId: string | undefined) {
  return useQuery({
    queryKey: taskKeys.list({ batchId }),
    queryFn: async () => {
      if (!batchId) return []
      const tasks = await getTasks({ batchId })
      return tasks.map((task) => mapTaskResponse(task))
    },
    enabled: !!batchId,
    staleTime: 30 * 1000,
  })
}
