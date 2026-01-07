import type { Task } from '../types'
import { TaskCard } from './TaskCard'

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
