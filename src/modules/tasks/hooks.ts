import { useQuery } from '@tanstack/react-query'

import type {
  Task,
  TaskFilters,
  TaskPriority,
  TaskStatus,
  UserRole,
} from './types'

// ============================================================================
// MOCK DATA - These are mocks and should be replaced with actual API calls
// ============================================================================

const MOCK_ASSIGNEES: Array<{
  id: string
  name: string
  avatar?: string
  role: UserRole
}> = [
  { id: 'user-1', name: 'Alice Johnson', role: 'admin' },
  { id: 'user-2', name: 'Bob Smith', role: 'annotator' },
  { id: 'user-3', name: 'Charlie Brown', role: 'reviewer' },
  { id: 'user-4', name: 'Diana Ross', role: 'annotator' },
  { id: 'user-5', name: 'Edward Chen', role: 'reviewer' },
]

const MOCK_BATCHES = [
  { id: 'batch-1', name: 'Product Images Q4' },
  { id: 'batch-2', name: 'Street Photography 2025' },
  { id: 'batch-3', name: 'Medical Scans Set A' },
  { id: 'batch-4', name: 'Satellite Imagery' },
]

const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'review', 'done']
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high']

function generateMockTasks(count: number): Task[] {
  const tasks: Task[] = []
  const now = new Date()

  for (let i = 1; i <= count; i++) {
    const batch = MOCK_BATCHES[i % MOCK_BATCHES.length]
    const status = STATUSES[i % STATUSES.length]
    const priority = PRIORITIES[i % PRIORITIES.length]
    const assignee =
      i % 3 === 0 ? undefined : MOCK_ASSIGNEES[i % MOCK_ASSIGNEES.length]

    const createdAt = new Date(now)
    createdAt.setDate(now.getDate() - Math.floor(Math.random() * 30))

    const updatedAt = new Date(createdAt)
    updatedAt.setDate(createdAt.getDate() + Math.floor(Math.random() * 7))

    const dueDate =
      i % 4 === 0
        ? undefined
        : new Date(
            now.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000,
          ).toISOString()

    tasks.push({
      id: `task-${i.toString().padStart(4, '0')}`,
      title: `Label ${batch.name} - Part ${i}`,
      description:
        i % 2 === 0 ? `Review and label images from ${batch.name}.` : undefined,
      status,
      priority,
      batchId: batch.id,
      batchName: batch.name,
      assignee,
      dueDate,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    })
  }

  return tasks
}

// MOCK: Generate 50 mock tasks
const ALL_MOCK_TASKS = generateMockTasks(100)

// ============================================================================
// END MOCK DATA
// ============================================================================

export interface TaskSort {
  key: keyof Task
  direction: 'asc' | 'desc'
}

interface UseTasksOptions {
  page?: number
  pageSize?: number
  search?: string
  filters?: TaskFilters
  sort?: TaskSort
}

interface UseTasksResult {
  tasks: Task[]
  totalCount: number
  totalPages: number
  currentPage: number
  facets: {
    status: Record<TaskStatus, number>
    priority: Record<TaskPriority, number>
  }
}

/**
 * Hook to fetch tasks with pagination, filtering, sorting, and search.
 * MOCK: Uses mock data and simulates a delay.
 */
export function useTasks(options: UseTasksOptions = {}) {
  const {
    page = 1,
    pageSize = 10,
    search = '',
    filters = {},
    sort = { key: 'createdAt', direction: 'desc' },
  } = options

  return useQuery<UseTasksResult>({
    queryKey: ['tasks', page, pageSize, search, filters, sort],
    queryFn: async () => {
      // MOCK: Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Base: All tasks
      let searchFilteredTasks = [...ALL_MOCK_TASKS]

      // MOCK: Apply search filter first
      if (search.trim()) {
        const keyword = search.toLowerCase()
        searchFilteredTasks = searchFilteredTasks.filter(
          (task) =>
            task.title.toLowerCase().includes(keyword) ||
            task.batchName.toLowerCase().includes(keyword) ||
            (task.description ?? '').toLowerCase().includes(keyword),
        )
      }

      // Calculate facets based on search-filtered tasks (before applying status/priority filters)
      const statusCounts = STATUSES.reduce(
        (acc, status) => {
          acc[status] = searchFilteredTasks.filter(
            (t) => t.status === status,
          ).length
          return acc
        },
        {} as Record<TaskStatus, number>,
      )

      const priorityCounts = PRIORITIES.reduce(
        (acc, priority) => {
          acc[priority] = searchFilteredTasks.filter(
            (t) => t.priority === priority,
          ).length
          return acc
        },
        {} as Record<TaskPriority, number>,
      )

      let filteredTasks = [...searchFilteredTasks]

      // MOCK: Apply status filter
      if (filters.status && filters.status.length > 0) {
        filteredTasks = filteredTasks.filter((task) =>
          filters.status!.includes(task.status),
        )
      }

      // MOCK: Apply priority filter
      if (filters.priority && filters.priority.length > 0) {
        filteredTasks = filteredTasks.filter((task) =>
          filters.priority!.includes(task.priority),
        )
      }

      // MOCK: Apply assignee filter
      if (filters.assigneeId) {
        filteredTasks = filteredTasks.filter(
          (task) => task.assignee?.id === filters.assigneeId,
        )
      }

      // MOCK: Apply sorting
      filteredTasks.sort((a, b) => {
        const aValue = a[sort.key]
        const bValue = b[sort.key]

        // Handle null/undefined values
        if (aValue === undefined || aValue === null) return 1
        if (bValue === undefined || bValue === null) return -1

        let comparison = 0

        // Date comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (
            sort.key === 'createdAt' ||
            sort.key === 'updatedAt' ||
            sort.key === 'dueDate'
          ) {
            comparison = new Date(aValue).getTime() - new Date(bValue).getTime()
          } else {
            comparison = aValue.localeCompare(bValue)
          }
        } else if (typeof aValue === 'object' && typeof bValue === 'object') {
          // For nested objects like assignee, compare by name
          const aName = (aValue as any)?.name ?? ''
          const bName = (bValue as any)?.name ?? ''
          comparison = aName.localeCompare(bName)
        }

        return sort.direction === 'asc' ? comparison : -comparison
      })

      const totalCount = filteredTasks.length
      const totalPages = Math.ceil(totalCount / pageSize)
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const tasks = filteredTasks.slice(startIndex, endIndex)

      return {
        tasks,
        totalCount,
        totalPages,
        currentPage: page,
        facets: {
          status: statusCounts,
          priority: priorityCounts,
        },
      }
    },
  })
}

// Export mock assignees for use in filters
export { MOCK_ASSIGNEES }
