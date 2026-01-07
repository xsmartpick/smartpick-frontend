import { Check, Filter, X } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import * as React from 'react'
import { useState } from 'react'

import { clsxm } from '~/lib/cn'
import { Spring } from '~/lib/spring'

import type { TaskFilters, TaskPriority, TaskStatus } from '../types'

interface TasksToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  totalResults?: number
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

function useClickOutside<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
): React.RefObject<T | null> {
  const ref = React.useRef<T>(null)

  React.useEffect(() => {
    if (!open) return

    function onDown(e: MouseEvent) {
      const el = ref.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) onClose()
    }

    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open, onClose])

  return ref
}

function Dropdown({
  label,
  children,
  align = 'right',
  badge,
}: {
  label: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
  badge?: number
}) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false))

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsxm(
          'inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm',
          'hover:bg-fill focus:outline-none focus:ring-2 focus:ring-accent/20',
          badge && 'pr-2',
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        type="button"
      >
        {label}
        {badge ? (
          <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-semibold text-background">
            {badge}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <m.div
            role="menu"
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.99 }}
            transition={Spring.presets.smooth}
            className={clsxm(
              'absolute z-20 mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-border bg-background shadow-xl',
              align === 'right' ? 'right-0' : 'left-0',
            )}
          >
            <div className="p-1">{children}</div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function CheckboxMenuItem({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsxm(
        'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition',
        'text-text hover:bg-fill',
      )}
      type="button"
    >
      <span className="h-4 w-4">
        {checked ? <Check className="h-4 w-4 text-accent" /> : null}
      </span>
      <span className="flex-1">{label}</span>
    </button>
  )
}

export function TasksToolbar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  totalResults,
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
          <Dropdown
            label={
              <span className="inline-flex items-center gap-2">
                <Filter className="h-4 w-4 text-text-secondary" />
                <span className="hidden sm:inline">Status</span>
              </span>
            }
            badge={statusCount || undefined}
          >
            <div className="px-2 pb-2 pt-1 text-xs font-semibold text-text-tertiary">
              Filter by Status
            </div>
            {STATUS_OPTIONS.map((option) => (
              <CheckboxMenuItem
                key={option.value}
                label={option.label}
                checked={
                  filters.status?.includes(option.value as TaskStatus) ?? false
                }
                onChange={() => handleStatusToggle(option.value as TaskStatus)}
              />
            ))}
          </Dropdown>

          {/* Priority Filter */}
          <Dropdown
            label={
              <span className="inline-flex items-center gap-2">
                <Filter className="h-4 w-4 text-text-secondary" />
                <span className="hidden sm:inline">Priority</span>
              </span>
            }
            badge={priorityCount || undefined}
          >
            <div className="px-2 pb-2 pt-1 text-xs font-semibold text-text-tertiary">
              Filter by Priority
            </div>
            {PRIORITY_OPTIONS.map((option) => (
              <CheckboxMenuItem
                key={option.value}
                label={option.label}
                checked={
                  filters.priority?.includes(option.value as TaskPriority) ??
                  false
                }
                onChange={() =>
                  handlePriorityToggle(option.value as TaskPriority)
                }
              />
            ))}
          </Dropdown>

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
