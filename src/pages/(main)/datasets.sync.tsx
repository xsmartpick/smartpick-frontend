import { m } from 'motion/react'
import { useState } from 'react'

import { LoadingCircle } from '~/components/ui/loading'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Spring } from '~/lib/spring'
import type { Dataset } from '~/modules/datasets'
import type { SortDir, SortKey, ViewMode } from '~/modules/datasets/components'
import { DatasetsToolbar } from '~/modules/datasets/components'
import { useDatasets } from '~/modules/datasets/hooks'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function relativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 10) return 'just now'
  if (diffSec < 60) return `${diffSec}s ago`
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return formatDate(dateString)
}

export const Component = () => {
  const { data: datasets = [], isLoading, error } = useDatasets()
  const [view, setView] = useState<ViewMode>('table')
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sortedDatasets = [...datasets].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    if (sortKey === 'updatedAt' || sortKey === 'createdAt') {
      aValue = new Date(a[sortKey]).getTime()
      bValue = new Date(b[sortKey]).getTime()
    } else {
      aValue = a[sortKey].toLowerCase()
      bValue = b[sortKey].toLowerCase()
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDir === 'asc' ? aValue - bValue : bValue - aValue
    }

    const aStr = String(aValue)
    const bStr = String(bValue)
    return sortDir === 'asc'
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr)
  })

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={Spring.presets.smooth}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text mb-2">Datasets</h1>
            <p className="text-text-secondary">
              Manage your datasets here. View and organize your data
              collections.
            </p>
          </div>

          <div className="space-y-4">
            <DatasetsToolbar
              view={view}
              onViewChange={setView}
              sortKey={sortKey}
              sortDir={sortDir}
              onSortChange={(key, dir) => {
                setSortKey(key)
                setSortDir(dir)
              }}
            />

            <div className="rounded-2xl border border-border bg-background p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingCircle size="large" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="text-lg font-semibold text-text mb-2">
                    Failed to load datasets
                  </div>
                  <div className="text-sm text-text-secondary">
                    {error.message}
                  </div>
                </div>
              ) : view === 'table' ? (
                <Table variant="hover">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Media Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDatasets.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-text-tertiary py-8"
                        >
                          No datasets found
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedDatasets.map((dataset: Dataset) => (
                        <TableRow key={dataset.id} variant="clickable">
                          <TableCell className="font-medium text-text">
                            {dataset.name}
                          </TableCell>
                          <TableCell className="text-text-secondary">
                            {dataset.description || '—'}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full border border-border bg-fill px-2 py-0.5 text-xs font-medium text-text">
                              {dataset.mediaType}
                            </span>
                          </TableCell>
                          <TableCell
                            className="text-text-secondary"
                            title={formatDate(dataset.createdAt)}
                          >
                            {relativeTime(dataset.createdAt)}
                          </TableCell>
                          <TableCell
                            className="text-text-secondary"
                            title={formatDate(dataset.updatedAt)}
                          >
                            {relativeTime(dataset.updatedAt)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {sortedDatasets.length === 0 ? (
                    <div className="col-span-2 text-center text-text-tertiary py-8">
                      No datasets found
                    </div>
                  ) : (
                    sortedDatasets.map((dataset) => (
                      <div
                        key={dataset.id}
                        className="rounded-2xl border border-border bg-background p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-text truncate">
                              {dataset.name}
                            </h3>
                            <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                              {dataset.description || '—'}
                            </p>
                          </div>
                          <span className="inline-flex items-center rounded-full border border-border bg-fill px-2 py-0.5 text-xs font-medium text-text shrink-0">
                            {dataset.media}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-text-tertiary">
                          <span title={formatDate(dataset.createdAt)}>
                            Created: {relativeTime(dataset.createdAt)}
                          </span>
                          <span title={formatDate(dataset.updatedAt)}>
                            Updated: {relativeTime(dataset.updatedAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </m.div>
      </div>
    </div>
  )
}
