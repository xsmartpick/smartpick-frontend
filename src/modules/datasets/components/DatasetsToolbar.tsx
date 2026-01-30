import { Check, FolderPlus, SortAsc, SortDesc } from 'lucide-react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()

  return (
    <div className="rounded-3xl border border-border bg-background p-4 shadow-sm">
      <SectionTitle
        icon={<FolderPlus className="h-5 w-5 text-text-secondary" />}
        title={t('datasets.toolbar.title')}
        subtitle={t('datasets.toolbar.subtitle')}
        right={
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={t('components.toolbar.search', {
                resource: t('datasets.toolbar.title'),
              })}
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
                  {t('components.toolbar.viewModes.cards')}
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
                  {t('components.toolbar.viewModes.table')}
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
                  <span className="hidden sm:inline">
                    {t('components.toolbar.sort')}
                  </span>
                  <span className="sm:hidden">
                    {t('components.toolbar.sort')}
                  </span>
                </span>
              }
            >
              <ToolbarMenuLabel>
                {t('components.toolbar.sortBy')}
              </ToolbarMenuLabel>
              {(
                [
                  ['updatedAt', t('components.toolbar.sortOptions.updatedAt')],
                  ['name', t('components.toolbar.sortOptions.name')],
                  ['createdAt', t('components.toolbar.sortOptions.createdAt')],
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
                label={
                  sortDir === 'asc'
                    ? t('components.toolbar.sortOptions.ascending')
                    : t('components.toolbar.sortOptions.descending')
                }
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
