import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  ClipboardList,
} from 'lucide-react'
import { m } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router'

import { EmptyState, ErrorState, LoadingState } from '~/components/common'
import { Pagination } from '~/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { relativeTime } from '~/lib/date-utils'
import { Spring } from '~/lib/spring'
import type {
  Task,
  TaskFilters,
  TaskPriority,
  TaskSort,
  TaskStatus,
} from '~/modules/tasks'
import { useTasks } from '~/modules/tasks'
import { TasksToolbar } from '~/modules/tasks/components'

const PAGE_SIZE = 10

function getStatusLabel(status: TaskStatus) {
  const labels: Record<TaskStatus, string> = {
    todo: 'To Do',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done',
  }
  return labels[status]
}

function getStatusDotColor(status: TaskStatus) {
  switch (status) {
    case 'todo': {
      return 'bg-zinc-400'
    }
    case 'in_progress': {
      return 'bg-blue-500 animate-pulse'
    }
    case 'review': {
      return 'bg-orange-500'
    }
    case 'done': {
      return 'bg-green-500'
    }
  }
}

function getPriorityColor(priority: TaskPriority) {
  switch (priority) {
    case 'low': {
      return 'text-green-700 bg-green-100'
    }
    case 'medium': {
      return 'text-yellow-700 bg-yellow-100'
    }
    case 'high': {
      return 'text-red-700 bg-red-100'
    }
  }
}

interface SortableHeaderProps {
  label: string
  sortKey: keyof Task
  currentSort: TaskSort
  onSort: (key: keyof Task, direction: 'asc' | 'desc' | null) => void
}

function SortableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentSort.key === sortKey
  const direction = isActive ? currentSort.direction : null

  const handleClick = () => {
    // 3-state cycle: null -> desc -> asc -> null
    if (!isActive) {
      onSort(sortKey, 'desc')
    } else if (direction === 'desc') {
      onSort(sortKey, 'asc')
    } else {
      onSort(sortKey, null) // Reset to default
    }
  }

  return (
    <TableHead
      className="cursor-pointer select-none hover:bg-fill"
      onClick={handleClick}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {direction === 'asc' ? (
          <ArrowUp className="h-3.5 w-3.5 text-accent" />
        ) : direction === 'desc' ? (
          <ArrowDown className="h-3.5 w-3.5 text-accent" />
        ) : (
          <ChevronsUpDown className="h-3.5 w-3.5 text-text-tertiary" />
        )}
      </div>
    </TableHead>
  )
}

const DEFAULT_SORT: TaskSort = {
  key: 'createdAt',
  direction: 'desc',
}

export const Component = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<TaskFilters>({})
  const [sort, setSort] = useState<TaskSort>(DEFAULT_SORT)

  const { data, isLoading, error, refetch } = useTasks({
    page,
    pageSize: PAGE_SIZE,
    search,
    filters,
    sort,
  })

  const tasks = data?.tasks ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  const handleSort = (key: keyof Task, direction: 'asc' | 'desc' | null) => {
    if (direction === null) {
      setSort(DEFAULT_SORT)
    } else {
      setSort({ key, direction })
    }
    setPage(1) // Reset to first page when sorting changes
  }

  const handleFiltersChange = (newFilters: TaskFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1) // Reset to first page when search changes
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Page Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-6">
          <div className="flex items-center gap-4">
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={Spring.presets.bouncy}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-background shadow-lg shadow-accent/20"
            >
              <ClipboardList className="h-6 w-6" />
            </m.div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Tasks</h1>
              <p className="text-sm text-text-secondary">
                Cross-batch task overview for admins
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={Spring.presets.smooth}
        >
          <div className="space-y-4">
            {/* Toolbar */}
            <TasksToolbar
              search={search}
              onSearchChange={handleSearchChange}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              totalResults={totalCount}
            />

            {/* Table */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              {isLoading ? (
                <LoadingState message="Loading tasks..." />
              ) : error ? (
                <ErrorState
                  title="Failed to load tasks"
                  onRetry={() => refetch()}
                />
              ) : tasks.length === 0 ? (
                <EmptyState
                  title="No tasks found"
                  message="Try adjusting your filters or search query."
                />
              ) : (
                <>
                  <Table variant="hover">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border">
                        <SortableHeader
                          label="Title"
                          sortKey="title"
                          currentSort={sort}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label="Batch"
                          sortKey="batchName"
                          currentSort={sort}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label="Status"
                          sortKey="status"
                          currentSort={sort}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label="Priority"
                          sortKey="priority"
                          currentSort={sort}
                          onSort={handleSort}
                        />
                        <TableHead>Assignee</TableHead>
                        <SortableHeader
                          label="Due Date"
                          sortKey="dueDate"
                          currentSort={sort}
                          onSort={handleSort}
                        />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task: Task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium text-text">
                            {task.title}
                          </TableCell>
                          <TableCell>
                            <Link
                              to={`/batches/${task.batchId}`}
                              className="text-accent hover:underline"
                            >
                              {task.batchName}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${getStatusDotColor(task.status)}`}
                              />
                              <span className="text-sm font-medium text-text">
                                {getStatusLabel(task.status)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {task.assignee ? (
                              <div>
                                <div className="text-foreground font-medium">
                                  {task.assignee.name}
                                </div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  {task.assignee.role}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50 italic">
                                Unassigned
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-medium">
                            {task.dueDate ? relativeTime(task.dueDate) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    <p className="text-sm text-text-secondary">
                      Page {page} of {totalPages} ({totalCount} total)
                    </p>
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </m.div>
      </div>
    </div>
  )
}
