import { Check, FolderPlus, SortAsc, SortDesc } from 'lucide-react'
import * as React from 'react'

import { SectionTitle } from '~/components/common'
import {
  ToolbarDropdown,
  ToolbarMenuDivider,
  ToolbarMenuItem,
  ToolbarMenuLabel,
} from '~/components/ui/toolbar-dropdown'
import { clsxm } from '~/lib/cn'

export type ViewMode = 'cards' | 'table'

export type SortKey = 'updatedAt' | 'name' | 'createdAt'

export type SortDir = 'asc' | 'desc'

export interface DatasetsToolbarProps {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  sortKey: SortKey
  sortDir: SortDir
  onSortChange: (key: SortKey, dir: SortDir) => void

  search: string
  onSearchChange: (value: string) => void
}

export function DatasetsToolbar({
  view,
  onViewChange,
  sortKey,
  sortDir,
  onSortChange,
  search,
  onSearchChange,
}: DatasetsToolbarProps) {
  return (
    <div className="rounded-3xl border border-border bg-background p-4 shadow-sm">
      <SectionTitle
        icon={<FolderPlus className="h-5 w-5 text-text-secondary" />}
        title="Datasets"
        subtitle="Create and manage datasets before you start labeling."
        right={
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search datasets..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="
                hidden sm:block
                w-56 rounded-xl border border-border bg-background
                px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-primary/20
              "
            />
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

            <ToolbarDropdown
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
              <ToolbarMenuLabel>Sort by</ToolbarMenuLabel>
              {(
                [
                  ['updatedAt', 'Last updated'],
                  ['name', 'Name'],
                  ['createdAt', 'Created'],
                ] as const
              ).map(([k, label]) => (
                <ToolbarMenuItem
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
              <ToolbarMenuDivider />
              <ToolbarMenuItem
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
            </ToolbarDropdown>
          </div>
        }
      />
    </div>
  )
}
