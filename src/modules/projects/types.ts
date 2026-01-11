/**
 * Status of a project
 */
export type ProjectStatus = 'active' | 'completed' | 'archived'

/**
 * Type of project activity event
 */
export type ProjectEventType =
    | 'created'
    | 'updated'
    | 'status_changed'
    | 'batch_added'
    | 'batch_removed'
    | 'task_completed'
    | 'member_added'
    | 'member_removed'

/**
 * Project activity event
 */
export interface ProjectEvent {
    id: string
    type: ProjectEventType
    description: string
    userId: string
    userName?: string
    metadata?: Record<string, unknown>
    createdAt: string
}

/**
 * Statistics for a project
 */
export interface ProjectStats {
    totalBatches: number
    totalImages: number
    labeledImages: number
    pendingTasks: number
    completedTasks: number
    totalTasks: number
    averageLabelingTime?: number // in seconds
    labelerCount?: number
}

/**
 * Represents a project
 */
export interface Project {
    id: string
    name: string
    description: string
    status: ProjectStatus
    orgId: string
    stats: ProjectStats
    createdAt: string
    updatedAt: string
    createdBy: string
    createdByName?: string
    updatedBy?: string
    updatedByName?: string
    events?: ProjectEvent[]
}

/**
 * Form data for creating a new project
 */
export interface CreateProjectFormData {
    name: string
    description?: string
}

/**
 * Form data for updating a project
 */
export interface UpdateProjectFormData {
    name?: string
    description?: string
    status?: ProjectStatus
}
