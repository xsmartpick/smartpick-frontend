export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
export type UserRole = 'admin' | 'annotator' | 'reviewer'

export interface TaskAssignee {
  id: string
  name: string
  avatar?: string
  role: UserRole
}

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assigneeId?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  batchId: string
  batchName: string
  assignee?: TaskAssignee
  dueDate?: string
  createdAt: string
  updatedAt: string
}
