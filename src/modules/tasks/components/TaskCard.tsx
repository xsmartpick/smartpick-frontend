import { relativeTime } from '~/lib/date-utils'

import type { Task } from '../types'

export function TaskCard({ task }: { task: Task }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4 space-y-3">
      {/* Title */}
      <div className="font-semibold">{task.name}</div>

      {/* Dataset + total images */}
      <div className="text-sm text-text-secondary">
        Dataset: <span className="font-medium">{task.datasetName}</span>
      </div>

      <div className="text-sm text-text-secondary">
        Total images: <span className="font-medium">{task.totalImages}</span>
      </div>

      {/* Progress label */}
      <div className="flex items-center justify-between text-xs">
        <span className="capitalize">{task.status.replace('_', ' ')}</span>
        <span className="font-medium">{task.progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded bg-fill">
        <div
          className="h-2 rounded bg-primary transition-all"
          style={{ width: `${task.progress}%` }}
        />
      </div>

      {/* Time updated */}
      <div className="text-xs text-text-tertiary">
        Updated {relativeTime(task.updatedAt)}
      </div>
    </div>
  )
}
