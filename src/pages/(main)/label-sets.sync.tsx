import { Plus, Tag } from 'lucide-react'
import { m } from 'motion/react'
import { useState } from 'react'
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
import { Spring } from '~/lib/spring'
import type { LabelSet } from '~/modules/label-sets'
import type {
  CreateLabelSetFormData,
  SortDir,
  SortKey,
  ViewMode,
} from '~/modules/label-sets/components'
import {
  CreateLabelSetModal,
  LabelSetDetails,
  LabelSetsToolbar,
} from '~/modules/label-sets/components'
import { useCreateLabelSet, useLabelSets } from '~/modules/label-sets/hooks'

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
  const { data: labelSets = [], isLoading, error, refetch } = useLabelSets()
  const createLabelSetMutation = useCreateLabelSet()
  const [view, setView] = useState<ViewMode>('table')
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedLabelSet, setSelectedLabelSet] = useState<LabelSet | null>(
    null,
  )

  // Keyboard shortcut: N to create new label set
  useKeyboardShortcut({
    key: 'n',
    handler: () => setIsCreateModalOpen(true),
  })

  const sortedLabelSets = [...labelSets].sort((a, b) => {
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

  const handleCreateLabelSet = (formData: CreateLabelSetFormData) => {
    createLabelSetMutation.mutate(
      {
        name: formData.name,
        description: formData.description,
      },
      {
        onSuccess: (createdLabelSet) => {
          setIsCreateModalOpen(false)
          toast.success('Label set created successfully!', {
            description: `${createdLabelSet.name} has been added to your label sets.`,
          })
        },
        onError: (err) => {
          toast.error('Failed to create label set', {
            description:
              err instanceof Error ? err.message : 'An unknown error occurred',
          })
        },
      },
    )
  }

  const handleLabelSetUpdated = (updatedLabelSet: LabelSet) => {
    setSelectedLabelSet(updatedLabelSet)
  }

  const handleLabelSetDeleted = (id: string) => {
    setSelectedLabelSet((current) => (current?.id === id ? null : current))
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
              <Tag className="h-6 w-6" />
            </m.div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Label Sets</h1>
              <p className="text-sm text-text-secondary">
                Manage your label collections
              </p>
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
              New label set
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
            <LabelSetsToolbar
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
                <LoadingState message="Loading label sets..." />
              ) : error ? (
                <ErrorState
                  title="Failed to load label sets"
                  onRetry={() => refetch()}
                />
              ) : sortedLabelSets.length === 0 ? (
                <EmptyState
                  title="No label sets found"
                  message="Get started by creating your first label set."
                />
              ) : view === 'table' ? (
                <Table variant="hover">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Labels</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLabelSets.map((labelSet: LabelSet) => (
                      <TableRow
                        key={labelSet.id}
                        variant="clickable"
                        onClick={() => setSelectedLabelSet(labelSet)}
                      >
                        <TableCell className="font-medium text-text">
                          {labelSet.name}
                        </TableCell>
                        <TableCell className="text-text-secondary">
                          {labelSet.description || '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-text">
                              {labelSet.labels.length}
                            </span>
                            <span className="text-xs text-text-tertiary">
                              {labelSet.labels.length === 1
                                ? 'label'
                                : 'labels'}
                            </span>
                            {labelSet.labels.length > 0 && (
                              <div className="ml-2 flex items-center gap-1">
                                {labelSet.labels.slice(0, 3).map((label) => (
                                  <div
                                    key={label.id}
                                    className="h-3 w-3 rounded-full border border-border"
                                    style={{
                                      backgroundColor: label.color || '#6B7280',
                                    }}
                                    title={label.name}
                                  />
                                ))}
                                {labelSet.labels.length > 3 && (
                                  <span className="text-xs text-text-tertiary">
                                    +{labelSet.labels.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className="text-text-secondary"
                          title={formatDate(labelSet.createdAt)}
                        >
                          {relativeTime(labelSet.createdAt)}
                        </TableCell>
                        <TableCell
                          className="text-text-secondary"
                          title={formatDate(labelSet.updatedAt)}
                        >
                          {relativeTime(labelSet.updatedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {sortedLabelSets.map((labelSet) => (
                    <div
                      key={labelSet.id}
                      className="cursor-pointer rounded-2xl border border-border bg-background p-4 transition-shadow hover:shadow-md"
                      onClick={() => setSelectedLabelSet(labelSet)}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-text">
                            {labelSet.name}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                            {labelSet.description || '—'}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="inline-flex items-center rounded-full border border-border bg-fill px-2 py-0.5 text-xs font-medium text-text">
                            {`${labelSet.labels.length} ${
                              labelSet.labels.length === 1 ? 'label' : 'labels'
                            }`}
                          </span>
                        </div>
                      </div>
                      <div className="mb-3 flex items-center gap-2">
                        {labelSet.labels.length > 0 ? (
                          <>
                            {labelSet.labels.map((label) => (
                              <div
                                key={label.id}
                                className="flex items-center gap-1.5 rounded-lg border border-border bg-fill/50 px-2 py-1"
                              >
                                {label.color && (
                                  <div
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ backgroundColor: label.color }}
                                  />
                                )}
                                <span className="text-xs font-medium text-text">
                                  {label.name}
                                </span>
                              </div>
                            ))}
                          </>
                        ) : (
                          <span className="text-xs text-text-tertiary">
                            No labels
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-text-tertiary">
                        <span title={formatDate(labelSet.createdAt)}>
                          Created: {relativeTime(labelSet.createdAt)}
                        </span>
                        <span title={formatDate(labelSet.updatedAt)}>
                          Updated: {relativeTime(labelSet.updatedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <CreateLabelSetModal
            open={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateLabelSet}
          />

          <LabelSetDetails
            labelSet={selectedLabelSet}
            onClose={() => setSelectedLabelSet(null)}
            onUpdated={handleLabelSetUpdated}
            onDeleted={handleLabelSetDeleted}
          />
        </m.div>
      </div>
    </div>
  )
}
