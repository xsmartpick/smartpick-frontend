import { Check, ChevronDown, FolderPlus, SortAsc, SortDesc } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import * as React from 'react'
import { useState } from 'react'

import { clsxm } from '~/lib/cn'
import { Spring } from '~/lib/spring'

import { SectionTitle } from './SectionTitle'

export type ViewMode = 'cards' | 'table'

export type SortKey = 'updatedAt' | 'name' | 'createdAt'

export type SortDir = 'asc' | 'desc'

export interface DatasetsToolbarProps {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  sortKey: SortKey
  sortDir: SortDir
  onSortChange: (key: SortKey, dir: SortDir) => void
}

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
}: {
  label: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(open, () => setOpen(false))

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsxm(
          'inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm',
          'hover:bg-fill focus:outline-none focus:ring-2 focus:ring-primary/20',
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        type="button"
      >
        {label}
        <ChevronDown className="h-4 w-4 text-text-tertiary" />
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
            <div className="p-1" onClick={() => setOpen(false)}>
              {children}
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function MenuItem({
  icon,
  label,
  danger,
  onClick,
}: {
  icon?: React.ReactNode
  label: string
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={clsxm(
        'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition',
        danger ? 'text-red-700 hover:bg-red-50' : 'text-text hover:bg-fill',
      )}
      type="button"
    >
      {icon ? (
        <span
          className={clsxm(
            'h-4 w-4',
            danger ? 'text-red-700' : 'text-text-secondary',
          )}
        >
          {icon}
        </span>
      ) : null}
      <span className="flex-1">{label}</span>
    </button>
  )
}

export function DatasetsToolbar({
  view,
  onViewChange,
  sortKey,
  sortDir,
  onSortChange,
}: DatasetsToolbarProps) {
  return (
    <div className="rounded-3xl border border-border bg-background p-4 shadow-sm">
      <SectionTitle
        icon={<FolderPlus className="h-5 w-5 text-text-secondary" />}
        title="Datasets"
        subtitle="Create and manage datasets before you start labeling."
        right={
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex">
              <div className="inline-flex rounded-2xl border border-border bg-background p-1">
                <button
                  onClick={() => onViewChange('cards')}
                  className={clsxm(
                    'rounded-xl px-3 py-1.5 text-sm transition',
                    view === 'cards'
                      ? 'bg-accent text-background'
                      : 'hover:bg-fill text-text',
                  )}
                  type="button"
                >
                  Cards
                </button>
                <button
                  onClick={() => onViewChange('table')}
                  className={clsxm(
                    'rounded-xl px-3 py-1.5 text-sm transition',
                    view === 'table'
                      ? 'bg-accent text-background'
                      : 'hover:bg-fill text-text',
                  )}
                  type="button"
                >
                  Table
                </button>
              </div>
            </div>

            <Dropdown
              label={
                <span className="inline-flex items-center gap-2">
                  {sortDir === 'asc' ? (
                    <SortAsc className="h-4 w-4 text-text-secondary" />
                  ) : (
                    <SortDesc className="h-4 w-4 text-text-secondary" />
                  )}
                  <span className="hidden sm:inline">Sort</span>
                  <span className="sm:hidden">Sort</span>
                </span>
              }
            >
              <div className="px-2 pb-2 pt-1 text-xs font-semibold text-text-tertiary">
                Sort by
              </div>
              {(
                [
                  ['updatedAt', 'Last updated'],
                  ['name', 'Name'],
                  ['createdAt', 'Created'],
                ] as const
              ).map(([k, label]) => (
                <MenuItem
                  key={k}
                  label={label}
                  icon={
                    sortKey === k ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <span className="h-4 w-4" />
                    )
                  }
                  onClick={() => onSortChange(k, sortDir)}
                />
              ))}
              <div className="my-1 border-t border-border" />
              <MenuItem
                label={sortDir === 'asc' ? 'Ascending' : 'Descending'}
                icon={
                  sortDir === 'asc' ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )
                }
                onClick={() =>
                  onSortChange(sortKey, sortDir === 'asc' ? 'desc' : 'asc')
                }
              />
            </Dropdown>
          </div>
        }
      />
    </div>
  )
}
