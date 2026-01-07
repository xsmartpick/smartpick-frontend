import type { Task } from './types'

export const mockMyTasks: Task[] = [
  {
    id: 'task-1',
    name: 'Label dataset Test Dataset',
    datasetName: 'Test Dataset',
    status: 'in_progress',
    progress: 45,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-02T10:30:00Z',
  },
  {
    id: 'task-2',
    name: 'Verify labels',
    datasetName: 'Test Dataset1',
    status: 'todo',
    progress: 0,
    createdAt: '2025-01-03T09:00:00Z',
    updatedAt: '2025-01-03T09:00:00Z',
  },
  {
    id: 'task-3',
    name: 'Finish annotation',
    datasetName: 'Test2',
    status: 'done',
    progress: 100,
    createdAt: '2024-12-28T07:00:00Z',
    updatedAt: '2024-12-30T15:00:00Z',
  },
]
