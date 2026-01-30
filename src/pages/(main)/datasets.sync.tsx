import { Database, Plus } from 'lucide-react'
import { m } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { EmptyState, ErrorState, LoadingState } from '~/components/common'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { useKeyboardShortcut } from '~/hooks/common'
import { relativeTime } from '~/lib/date-utils'
import { Spring } from '~/lib/spring'
import type { Dataset } from '~/modules/datasets'
import type {
  CreateDatasetFormData,
  SortDir,
  SortKey,
  ViewMode,
} from '~/modules/datasets/components'
import {
  CreateDatasetModal,
  DatasetDetails,
  DatasetsToolbar,
} from '~/modules/datasets/components'
import { useCreateDataset, useDatasets } from '~/modules/datasets/hooks'

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

export const Component = () => {
  const { t } = useTranslation()
  const { data: datasets = [], isLoading, error, refetch } = useDatasets()
  const createDatasetMutation = useCreateDataset()
  const [view, setView] = useState<ViewMode>('table')
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)

  // Keyboard shortcut: N to create new dataset
  useKeyboardShortcut({
    key: 'n',
    handler: () => setIsCreateModalOpen(true),
  })

  const filteredDatasets = datasets.filter((dataset) => {
    if (!search.trim()) return true

    const keyword = search.toLowerCase()

    return (
      dataset.name.toLowerCase().includes(keyword) ||
      (dataset.description ?? '').toLowerCase().includes(keyword)
    )
  })

  const sortedDatasets = [...filteredDatasets].sort((a, b) => {
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

    return sortDir === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue))
  })

  const handleCreateDataset = (formData: CreateDatasetFormData) => {
    createDatasetMutation.mutate(
      {
        name: formData.name,
        description: formData.description,
        mediaType: formData.mediaType,
      },
      {
        onSuccess: (createdDataset) => {
          setIsCreateModalOpen(false)
          toast.success(t('datasets.toast.createSuccess'), {
            description: t('datasets.toast.createSuccessDesc', {
              name: createdDataset.name,
            }),
          })
        },
        onError: (err) => {
          toast.error(t('datasets.toast.createError'), {
            description:
              err instanceof Error
                ? err.message
                : t('datasets.toast.createErrorUnknown'),
          })
        },
      },
    )
  }

  return (
    <div className="min-h-screen bg-background text-text">
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
              <Database className="h-6 w-6" />
            </m.div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {t('datasets.page.title')}
              </h1>
              <p className="text-sm text-text-secondary">
                {t('datasets.page.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-fill/50 px-3 py-2 text-xs text-text-tertiary md:flex">
              <span className="font-medium text-text">
                {t('datasets.shortcuts.label')}
              </span>
              <span className="rounded-md bg-fill px-1.5 py-0.5">N</span>
              <span>{t('datasets.shortcuts.new')}</span>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('datasets.newDataset')}
            </Button>
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
            {/* Toolbar for view/sort controls */}
            <DatasetsToolbar
              view={view}
              onViewChange={setView}
              sortKey={sortKey}
              sortDir={sortDir}
              onSortChange={(key, dir) => {
                setSortKey(key)
                setSortDir(dir)
              }}
              search={search}
              onSearchChange={setSearch}
            />

            <div className="rounded-2xl border border-border bg-background p-6">
              {isLoading ? (
                <LoadingState message={t('datasets.loading')} />
              ) : error ? (
                <ErrorState
                  title={t('datasets.error.title')}
                  onRetry={() => refetch()}
                />
              ) : sortedDatasets.length === 0 ? (
                <EmptyState
                  title={t('datasets.empty.title')}
                  message={t('datasets.empty.message')}
                />
              ) : view === 'table' ? (
                <Table variant="hover">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('datasets.table.headers.name')}</TableHead>
                      <TableHead>
                        {t('datasets.table.headers.description')}
                      </TableHead>
                      <TableHead>
                        {t('datasets.table.headers.mediaType')}
                      </TableHead>
                      <TableHead>
                        {t('datasets.table.headers.created')}
                      </TableHead>
                      <TableHead>
                        {t('datasets.table.headers.updated')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDatasets.map((dataset: Dataset) => (
                      <TableRow
                        key={dataset.id}
                        variant="clickable"
                        onClick={() => setSelectedDataset(dataset)}
                      >
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
                          {relativeTime(dataset.createdAt, t)}
                        </TableCell>
                        <TableCell
                          className="text-text-secondary"
                          title={formatDate(dataset.updatedAt)}
                        >
                          {relativeTime(dataset.updatedAt, t)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {sortedDatasets.map((dataset) => (
                    <div
                      key={dataset.id}
                      className="cursor-pointer rounded-2xl border border-border bg-background p-4 transition-shadow hover:shadow-md"
                      onClick={() => setSelectedDataset(dataset)}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-text">
                            {dataset.name}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                            {dataset.description || '—'}
                          </p>
                        </div>
                        <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-fill px-2 py-0.5 text-xs font-medium text-text">
                          {dataset.mediaType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-text-tertiary">
                        <span title={formatDate(dataset.createdAt)}>
                          {t('common.created')}:{' '}
                          {relativeTime(dataset.createdAt, t)}
                        </span>
                        <span title={formatDate(dataset.updatedAt)}>
                          {t('common.updated')}:{' '}
                          {relativeTime(dataset.updatedAt, t)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <CreateDatasetModal
            open={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateDataset}
          />

          <DatasetDetails
            dataset={selectedDataset}
            onClose={() => setSelectedDataset(null)}
            onUpdated={(updated) => setSelectedDataset(updated)}
          />
        </m.div>
      </div>
    </div>
  )
}
