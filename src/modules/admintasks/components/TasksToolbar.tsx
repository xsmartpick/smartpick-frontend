import { Filter, X } from 'lucide-react'
import * as React from 'react'

import {
  ToolbarCheckboxMenuItem,
  ToolbarDropdown,
  ToolbarMenuLabel,
} from '~/components/ui/toolbar-dropdown'

import type { TaskFilters, TaskPriority, TaskStatus } from '../types'

interface TasksToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  totalResults?: number
  facets?: {
    status: Record<TaskStatus, number>
    priority: Record<TaskPriority, number>
  }
}

interface FilterOption {
  value: string
  label: string
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
]

const PRIORITY_OPTIONS: FilterOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export function TasksToolbar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  totalResults,
  facets,
}: TasksToolbarProps) {
  const statusCount = filters.status?.length ?? 0
  const priorityCount = filters.priority?.length ?? 0
  const hasFilters =
    statusCount > 0 || priorityCount > 0 || !!filters.assigneeId

  const handleStatusToggle = (status: TaskStatus) => {
    const current = filters.status ?? []
    const newStatus = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status]

    onFiltersChange({
      ...filters,
      status: newStatus.length > 0 ? newStatus : undefined,
    })
  }

  const handlePriorityToggle = (priority: TaskPriority) => {
    const current = filters.priority ?? []
    const newPriority = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority]

    onFiltersChange({
      ...filters,
      priority: newPriority.length > 0 ? newPriority : undefined,
    })
  }

  const handleClearFilters = () => {
    onFiltersChange({})
  }

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            placeholder="Search tasks or batches..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <ToolbarDropdown
            label={
              <span className="inline-flex items-center gap-2">
                <Filter className="h-4 w-4 text-text-secondary" />
                <span className="hidden sm:inline">Status</span>
              </span>
            }
            badge={statusCount || undefined}
            showChevron={false}
          >
            <ToolbarMenuLabel>Filter by Status</ToolbarMenuLabel>
            {STATUS_OPTIONS.map((option) => (
              <ToolbarCheckboxMenuItem
                key={option.value}
                label={option.label}
                checked={
                  filters.status?.includes(option.value as TaskStatus) ?? false
                }
                count={facets?.status[option.value as TaskStatus]}
                onChange={() => handleStatusToggle(option.value as TaskStatus)}
              />
            ))}
          </ToolbarDropdown>

          {/* Priority Filter */}
          <ToolbarDropdown
            label={
              <span className="inline-flex items-center gap-2">
                <Filter className="h-4 w-4 text-text-secondary" />
                <span className="hidden sm:inline">Priority</span>
              </span>
            }
            badge={priorityCount || undefined}
            showChevron={false}
          >
            <ToolbarMenuLabel>Filter by Priority</ToolbarMenuLabel>
            {PRIORITY_OPTIONS.map((option) => (
              <ToolbarCheckboxMenuItem
                key={option.value}
                label={option.label}
                checked={
                  filters.priority?.includes(option.value as TaskPriority) ??
                  false
                }
                count={facets?.priority[option.value as TaskPriority]}
                onChange={() =>
                  handlePriorityToggle(option.value as TaskPriority)
                }
              />
            ))}
          </ToolbarDropdown>

          {/* Clear Filters */}
          {hasFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-2 text-sm text-text-secondary hover:bg-fill hover:text-text"
              type="button"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      {totalResults !== undefined && (
        <div className="mt-3 text-xs text-text-tertiary">
          <span>{totalResults}</span>{' '}
          <span>{totalResults === 1 ? 'task' : 'tasks'}</span>{' '}
          <span>found</span>
        </div>
      )}
    </div>
  )
}
