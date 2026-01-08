import type { TaskStatus } from '../types'

interface TaskStatusBadgeProps {
  status: TaskStatus
}

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: {
    label: 'Todo',
    className: 'bg-fill text-text-secondary border-border',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-accent/10 text-accent border-accent/20',
  },
  done: {
    label: 'Done',
    className: 'bg-green/10 text-green border-green/20',
  },
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
