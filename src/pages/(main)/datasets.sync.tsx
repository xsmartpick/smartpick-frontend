import { Database, Plus } from 'lucide-react'
import { m } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  EmptyState,
  ErrorState,
  LoadingState,
  UserInfo,
} from '~/components/common'
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
  const { data: datasets = [], isLoading, error, refetch } = useDatasets()
  const createDatasetMutation = useCreateDataset()
  const [view, setView] = useState<ViewMode>('table')
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)

  // Keyboard shortcut: N to create new dataset
  useKeyboardShortcut({
    key: 'n',
    handler: () => setIsCreateModalOpen(true),
  })

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
          toast.success('Dataset created successfully!', {
            description: `${createdDataset.name} has been added to your datasets.`,
          })
        },
        onError: (err) => {
          toast.error('Failed to create dataset', {
            description:
              err instanceof Error ? err.message : 'An unknown error occurred',
          })
        },
      },
    )
  }

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-background shadow-sm">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight">
                Datasets
              </div>
              <div className="text-xs text-text-secondary">
                Manage your data collections
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-fill/50 px-3 py-2 text-xs text-text-tertiary md:flex">
              <span className="font-medium text-text">Shortcuts</span>
              <span className="rounded-md bg-fill px-1.5 py-0.5">N</span>
              <span>new</span>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              New dataset
            </Button>
            <UserInfo />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
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
            />

            <div className="rounded-2xl border border-border bg-background p-6">
              {isLoading ? (
                <LoadingState message="Loading datasets..." />
              ) : error ? (
                <ErrorState
                  title="Failed to load datasets"
                  onRetry={() => refetch()}
                />
              ) : sortedDatasets.length === 0 ? (
                <EmptyState
                  title="No datasets found"
                  message="Get started by creating your first dataset."
                />
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
                          {relativeTime(dataset.createdAt)}
                        </TableCell>
                        <TableCell
                          className="text-text-secondary"
                          title={formatDate(dataset.updatedAt)}
                        >
                          {relativeTime(dataset.updatedAt)}
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
                      className="rounded-2xl border border-border bg-background p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedDataset(dataset)}
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
                          {dataset.mediaType}
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
