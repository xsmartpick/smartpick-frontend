import { apiClient } from '~/lib/api-client'
import { API_ENDPOINTS } from '~/lib/endpoints'

/**
 * Task image from API response
 */
export interface TaskImage {
  id: string
  batchItemId: string
  objectKey: string
  downloadUrl?: string
  createdAt: string
}

/**
 * Label assignment from API response
 */
export interface LabelAssignment {
  id: string
  taskId: string
  userId: string
  assignedAt: string
  assignedBy: string
  completedAt?: string
}

/**
 * Labeling progress from API response
 */
export interface LabelingProgress {
  taskId: string
  totalImages: number
  labeledImages: number
  inProgressImages: number
  totalSegments: number
  labeledSegments: number
  progressPercent: number
  updatedAt: string
}

/**
 * Task segment from API response
 */
export interface TaskSegment {
  id: string
  segmentId: string
  createdAt: string
}

/**
 * Task from API response
 */
export interface TaskResponse {
  id: string
  batchId: string
  name: string
  description?: string
  isSegmentBased: boolean
  createdAt: string
  createdBy: string
  updatedAt: string
  images?: TaskImage[]
  segments?: TaskSegment[]
  labelAssignments: LabelAssignment[]
  labelingProgress: LabelingProgress
}

/**
 * Request to create a new task
 */
export interface CreateTaskRequest {
  batchId: string
  name: string
  description?: string
  batchItemIds: string[]
  segmentIds?: string[] // Optional: when splitting by segments
}

/**
 * Get all tasks
 */
export async function getTasks(params?: {
  batchId?: string
  includeImages?: boolean
  limit?: number
  offset?: number
}): Promise<TaskResponse[]> {
  const searchParams = new URLSearchParams()
  if (params?.batchId) searchParams.set('batchId', params.batchId)
  if (params?.includeImages) searchParams.set('includeImages', 'true')
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.offset) searchParams.set('offset', params.offset.toString())

  const url = searchParams.toString()
    ? `${API_ENDPOINTS.TASKS.LIST}?${searchParams.toString()}`
    : API_ENDPOINTS.TASKS.LIST

  return apiClient<TaskResponse[]>(url, {
    method: 'GET',
  })
}

/**
 * Get a single task by ID
 */
export async function getTask(id: string): Promise<TaskResponse> {
  return apiClient<TaskResponse>(API_ENDPOINTS.TASKS.DETAIL(id), {
    method: 'GET',
  })
}

/**
 * Create a new task
 */
export async function createTask(
  request: CreateTaskRequest,
): Promise<{ id: string }> {
  return apiClient<{ id: string }>(API_ENDPOINTS.TASKS.CREATE, {
    method: 'POST',
    body: request,
  })
}

/**
 * Delete a task by ID
 */
export async function deleteTask(id: string): Promise<void> {
  return apiClient<void>(API_ENDPOINTS.TASKS.DELETE(id), {
    method: 'DELETE',
  })
}

/**
 * Task segment with full segment data from API response
 */
export interface TaskSegmentWithData {
  id: string
  batchItemId: string
  bboxX: number
  bboxY: number
  bboxWidth: number
  bboxHeight: number
  pixelX: number
  pixelY: number
  pixelWidth: number
  pixelHeight: number
  cropUrl?: string
  maskUrl?: string
  confidence: number
  status: string
  labelId?: string
  labelName?: string
  labelColor?: string
  labeledAt?: string
  labeledBy?: string
  createdAt: string
}

/**
 * Response from get task segments endpoint
 */
export interface GetTaskSegmentsResponse {
  taskId: string
  taskName: string
  segments: TaskSegmentWithData[]
  total: number
}

/**
 * Get segments for a task (for labeling)
 */
export async function getTaskSegments(
  taskId: string,
): Promise<GetTaskSegmentsResponse> {
  return apiClient<GetTaskSegmentsResponse>(
    API_ENDPOINTS.TASKS.SEGMENTS(taskId),
    {
      method: 'GET',
    },
  )
}
