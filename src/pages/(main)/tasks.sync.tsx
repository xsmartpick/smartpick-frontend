import { useMemo, useState } from 'react'

import { TaskList, TasksToolbar } from '~/modules/tasks/components'
import { TaskTable } from '~/modules/tasks/components/TaskTable'
import { useMyTasks } from '~/modules/tasks/hooks'
import type { TaskStatus } from '~/modules/tasks/types'

export const Component = () => {
  const { data = [] } = useMyTasks()

  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card')
  const [status, setStatus] = useState<TaskStatus | 'all'>('all')

  const filteredTasks = useMemo(() => {
    return data.filter((task) => {
      const matchSearch = task.name.toLowerCase().includes(search.toLowerCase())

      const matchStatus = status === 'all' ? true : task.status === status

      return matchSearch && matchStatus
    })
  }, [data, search, status])

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <TasksToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'card' ? (
        <TaskList tasks={filteredTasks} />
      ) : (
        <TaskTable tasks={filteredTasks} />
      )}
    </div>
  )
}
