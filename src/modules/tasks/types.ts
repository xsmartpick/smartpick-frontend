export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  name: string
  datasetName: string
  totalImages: number
  status: TaskStatus
  progress: number // 0 - 100
  createdAt: string
  updatedAt: string
}
