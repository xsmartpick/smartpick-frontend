import { Plus, Tag } from 'lucide-react'
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
        labels: formData.labels,
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

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-background shadow-sm">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight">
                Label Sets
              </div>
              <div className="text-xs text-text-secondary">
                Manage your label collections
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
              New label set
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
                              label{labelSet.labels.length !== 1 ? 's' : ''}
                            </span>
                            {labelSet.labels.length > 0 && (
                              <div className="flex items-center gap-1 ml-2">
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
                      className="rounded-2xl border border-border bg-background p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedLabelSet(labelSet)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-text truncate">
                            {labelSet.name}
                          </h3>
                          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                            {labelSet.description || '—'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="inline-flex items-center rounded-full border border-border bg-fill px-2 py-0.5 text-xs font-medium text-text">
                            {labelSet.labels.length} label
                            {labelSet.labels.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
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
          />
        </m.div>
      </div>
    </div>
  )
}
