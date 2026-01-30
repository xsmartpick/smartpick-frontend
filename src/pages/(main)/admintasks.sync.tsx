import { ArrowDown, ArrowUp, ChevronsUpDown, ClipboardList } from 'lucide-react'
import { m } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
} from '~/modules/admintasks'
import { useTasks } from '~/modules/admintasks'
import { TasksToolbar } from '~/modules/admintasks/components'

const PAGE_SIZE = 10

type TranslateFn = ReturnType<typeof useTranslation>['t']

function getStatusLabel(status: TaskStatus, t: TranslateFn) {
  const labels: Record<TaskStatus, string> = {
    todo: t('admintasks.status.todo'),
    in_progress: t('admintasks.status.inProgress'),
    review: t('admintasks.status.review'),
    done: t('admintasks.status.done'),
  }
  return labels[status]
}

function getPriorityLabel(priority: TaskPriority, t: TranslateFn) {
  const labels: Record<TaskPriority, string> = {
    low: t('admintasks.priority.low'),
    medium: t('admintasks.priority.medium'),
    high: t('admintasks.priority.high'),
  }
  return labels[priority]
}

function getStatusDotColor(status: TaskStatus) {
  switch (status) {
    case 'todo': {
      return 'bg-zinc-400'
    }
    case 'in_progress': {
      return 'bg-blue animate-pulse'
    }
    case 'review': {
      return 'bg-orange'
    }
    case 'done': {
      return 'bg-green'
    }
  }
}

function getPriorityColor(priority: TaskPriority) {
  switch (priority) {
    case 'low': {
      return 'text-green bg-green/10'
    }
    case 'medium': {
      return 'text-yellow bg-yellow/10'
    }
    case 'high': {
      return 'text-red bg-red/10'
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
  const { t } = useTranslation()
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
              <h1 className="text-xl font-bold tracking-tight">
                {t('admintasks.title')}
              </h1>
              <p className="text-sm text-text-secondary">
                {t('admintasks.subtitle')}
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
              facets={data?.facets}
            />

            {/* Table */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              {isLoading ? (
                <LoadingState message={t('admintasks.loading')} />
              ) : error ? (
                <ErrorState
                  title={t('admintasks.error')}
                  onRetry={() => refetch()}
                />
              ) : tasks.length === 0 ? (
                <EmptyState
                  title={t('admintasks.empty.title')}
                  message={t('admintasks.empty.message')}
                />
              ) : (
                <>
                  <Table variant="hover">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-border">
                        <SortableHeader
                          label={t('admintasks.table.headers.title')}
                          sortKey="title"
                          currentSort={sort}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label={t('admintasks.table.headers.batch')}
                          sortKey="batchName"
                          currentSort={sort}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label={t('admintasks.table.headers.status')}
                          sortKey="status"
                          currentSort={sort}
                          onSort={handleSort}
                        />
                        <SortableHeader
                          label={t('admintasks.table.headers.priority')}
                          sortKey="priority"
                          currentSort={sort}
                          onSort={handleSort}
                        />
                        <TableHead>
                          {t('admintasks.table.headers.assignee')}
                        </TableHead>
                        <SortableHeader
                          label={t('admintasks.table.headers.dueDate')}
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
                            <div
                              className="line-clamp-2 max-w-[250px]"
                              title={task.title}
                            >
                              {task.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link
                              to={`/batches/${task.batchId}`}
                              className="block max-w-[180px] truncate text-accent hover:underline"
                              title={task.batchName}
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
                                {getStatusLabel(task.status, t)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getPriorityColor(task.priority)}`}
                            >
                              {getPriorityLabel(task.priority, t)}
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
                                {t('admintasks.table.unassigned')}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-medium">
                            {task.dueDate ? relativeTime(task.dueDate, t) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                    <p className="text-sm text-text-secondary">
                      {t('admintasks.pagination.pageOf', {
                        current: page,
                        total: totalPages,
                      })}
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
