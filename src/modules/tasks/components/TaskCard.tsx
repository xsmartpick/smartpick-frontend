import { relativeTime } from '~/lib/date-utils'

import type { Task } from '../types'

export function TaskCard({ task }: { task: Task }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="font-semibold">{task.name}</div>

      <div className="text-sm text-text-secondary mt-1">
        Dataset: {task.datasetName}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        <span>Status: {task.status}</span>
        <span>{relativeTime(task.updatedAt)}</span>
      </div>

      <div className="mt-2 h-2 rounded bg-fill">
        <div
          className="h-2 rounded bg-primary"
          style={{ width: `${task.progress}%` }}
        />
      </div>
    </div>
  )
}
