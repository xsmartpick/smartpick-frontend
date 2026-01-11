import { apiClient } from '~/lib/api-client'
import { API_ENDPOINTS } from '~/lib/endpoints'

import type {
  Project,
  ProjectEvent,
  ProjectEventType,
  ProjectStats,
  ProjectStatus,
  UpdateProjectFormData,
} from './types'

/**
 * Event from API response
 */
interface ProjectEventResponse {
  id: string
  type: string
  description: string
  userId: string
  userName?: string
  metadata?: Record<string, unknown>
  createdAt: string
}

/**
 * Project from API response
 */
export interface ProjectResponse {
  id: string
  name: string
  description: string
  status: string
  orgId: string
  stats?: {
    totalBatches?: number
    totalImages?: number
    labeledImages?: number
    pendingTasks?: number
    completedTasks?: number
    totalTasks?: number
    averageLabelingTime?: number
    labelerCount?: number
  }
  createdAt: string
  updatedAt: string
  createdBy: string
  createdByName?: string
  updatedBy?: string
  updatedByName?: string
  events?: ProjectEventResponse[]
}

/**
 * Map event response to ProjectEvent
 */
function mapEventResponse(event: ProjectEventResponse): ProjectEvent {
  return {
    id: event.id,
    type: event.type as ProjectEventType,
    description: event.description,
    userId: event.userId,
    userName: event.userName,
    metadata: event.metadata,
    createdAt: event.createdAt,
  }
}

/**
 * Map API response to Project type
 */
function mapProjectResponse(response: ProjectResponse): Project {
  const defaultStats: ProjectStats = {
    totalBatches: 0,
    totalImages: 0,
    labeledImages: 0,
    pendingTasks: 0,
    completedTasks: 0,
    totalTasks: 0,
  }

  return {
    id: response.id,
    name: response.name,
    description: response.description || '',
    status: (response.status as ProjectStatus) || 'active',
    orgId: response.orgId,
    stats: {
      totalBatches: response.stats?.totalBatches ?? defaultStats.totalBatches,
      totalImages: response.stats?.totalImages ?? defaultStats.totalImages,
      labeledImages:
        response.stats?.labeledImages ?? defaultStats.labeledImages,
      pendingTasks: response.stats?.pendingTasks ?? defaultStats.pendingTasks,
      completedTasks:
        response.stats?.completedTasks ?? defaultStats.completedTasks,
      totalTasks: response.stats?.totalTasks ?? defaultStats.totalTasks,
      averageLabelingTime: response.stats?.averageLabelingTime,
      labelerCount: response.stats?.labelerCount,
    },
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
    createdBy: response.createdBy,
    createdByName: response.createdByName,
    updatedBy: response.updatedBy,
    updatedByName: response.updatedByName,
    events: response.events?.map((e) => mapEventResponse(e)),
  }
}

/**
 * Get all projects
 */
export async function getProjects(): Promise<Project[]> {
  const response = await apiClient<ProjectResponse[]>(
    API_ENDPOINTS.PROJECTS.LIST,
    {
      method: 'GET',
    },
  )
  return response.map((item) => mapProjectResponse(item))
}

/**
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<Project> {
  const response = await apiClient<ProjectResponse>(
    API_ENDPOINTS.PROJECTS.DETAIL(id),
    {
      method: 'GET',
    },
  )
  return mapProjectResponse(response)
}

/**
 * Request to create a new project
 */
export interface CreateProjectRequest {
  name: string
  description?: string
}

/**
 * Create a new project
 */
export async function createProject(
  request: CreateProjectRequest,
): Promise<Project> {
  const response = await apiClient<ProjectResponse>(
    API_ENDPOINTS.PROJECTS.CREATE,
    {
      method: 'POST',
      body: request,
    },
  )
  return mapProjectResponse(response)
}

/**
 * Update a project
 */
export async function updateProject(
  id: string,
  data: UpdateProjectFormData,
): Promise<Project> {
  const response = await apiClient<ProjectResponse>(
    API_ENDPOINTS.PROJECTS.UPDATE(id),
    {
      method: 'PUT',
      body: data,
    },
  )
  return mapProjectResponse(response)
}

/**
 * Delete a project by ID
 */
export async function deleteProject(id: string): Promise<void> {
  return apiClient<void>(API_ENDPOINTS.PROJECTS.DELETE(id), {
    method: 'DELETE',
  })
}
