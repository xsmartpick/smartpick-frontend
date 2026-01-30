import { Check, ChevronDown, LayoutGrid, List, ListTodo } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { clsxm } from '~/lib/cn'
import { Spring } from '~/lib/spring'

import type { TaskStatus } from '../types'

export interface TasksToolbarProps {
  search: string
  onSearchChange: (value: string) => void

  status: TaskStatus | 'all'
  onStatusChange: (status: TaskStatus | 'all') => void

  viewMode: 'card' | 'table'
  onViewModeChange: (mode: 'card' | 'table') => void
}

/* ================= Dropdown ================= */

function Dropdown({
  label,
  children,
}: {
  label: React.ReactNode
  children: (close: () => void) => React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm hover:bg-fill"
      >
        {label}
        <ChevronDown className="h-4 w-4 text-text-tertiary" />
      </button>

      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={Spring.presets.smooth}
            className="absolute right-0 z-20 mt-2 min-w-[180px]
                         rounded-2xl border border-border bg-background shadow-xl"
          >
            <div className="p-1">{children(close)}</div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================= Menu Item ================= */

function MenuItem({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsxm(
        'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm',
        active ? 'bg-fill font-medium' : 'hover:bg-fill text-text',
      )}
    >
      <span className="h-4 w-4">{active && <Check className="h-4 w-4" />}</span>
      <span className="flex-1">{label}</span>
    </button>
  )
}

/* ================= Toolbar ================= */

export function TasksToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  viewMode,
  onViewModeChange,
}: TasksToolbarProps) {
  const { t } = useTranslation()
  const statusLabels = {
    all: t('tasks.toolbar.status.all'),
    todo: t('tasks.toolbar.status.todo'),
    in_progress: t('tasks.toolbar.status.inProgress'),
    done: t('tasks.toolbar.status.done'),
  }

  return (
    <div className="mb-6 rounded-3xl border border-border bg-background p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Title */}
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-text-secondary" />
          <span className="text-base font-semibold">
            {t('tasks.toolbar.title')}
          </span>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <input
            type="text"
            placeholder={t('tasks.toolbar.searchPlaceholder')}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className={clsxm(
              'w-48 rounded-xl border border-border bg-background',
              'px-3 py-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary/20',
            )}
          />

          {/* View mode */}
          <div className="inline-flex rounded-2xl border border-border bg-background p-1">
            <button
              type="button"
              onClick={() => onViewModeChange('card')}
              className={clsxm(
                'inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm transition',
                viewMode === 'card'
                  ? 'bg-accent text-background'
                  : 'hover:bg-fill text-text',
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              {t('components.toolbar.viewModes.cards')}
            </button>

            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={clsxm(
                'inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm transition',
                viewMode === 'table'
                  ? 'bg-accent text-background'
                  : 'hover:bg-fill text-text',
              )}
            >
              <List className="h-4 w-4" />
              {t('components.toolbar.viewModes.table')}
            </button>
          </div>

          {/* Status filter */}
          <Dropdown
            label={
              <span className="text-sm">
                {t('tasks.toolbar.status.prefix', {
                  status: statusLabels[status],
                })}
              </span>
            }
          >
            {(close) => (
              <>
                <MenuItem
                  label={t('tasks.toolbar.status.all')}
                  active={status === 'all'}
                  onClick={() => {
                    onStatusChange('all')
                    close()
                  }}
                />
                <MenuItem
                  label={t('tasks.toolbar.status.todo')}
                  active={status === 'todo'}
                  onClick={() => {
                    onStatusChange('todo')
                    close()
                  }}
                />
                <MenuItem
                  label={t('tasks.toolbar.status.inProgress')}
                  active={status === 'in_progress'}
                  onClick={() => {
                    onStatusChange('in_progress')
                    close()
                  }}
                />
                <MenuItem
                  label={t('tasks.toolbar.status.done')}
                  active={status === 'done'}
                  onClick={() => {
                    onStatusChange('done')
                    close()
                  }}
                />
              </>
            )}
          </Dropdown>
        </div>
      </div>
    </div>
  )
}
