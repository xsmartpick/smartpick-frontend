import type { Task } from '../types'
import { TaskStatusBadge } from './TaskStatusBadge'

interface TaskTableProps {
  tasks: Task[]
}

export function TaskTable({ tasks }: TaskTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Dataset</th>
            <th className="px-4 py-3 text-left font-medium">Total images</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Progress</th>
            <th className="px-4 py-3 text-left font-medium">Updated</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-t border-border hover:bg-muted/50"
            >
              <td className="px-4 py-3">{task.name}</td>
              <td className="px-4 py-3">{task.datasetName}</td>
              <td className="px-4 py-3">{task.totalImages}</td>
              <td className="px-4 py-3">
                <TaskStatusBadge status={task.status} />
              </td>
              <td className="px-4 py-3 font-medium">{task.progress}%</td>
              <td className="px-4 py-3 text-text-tertiary">{task.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
