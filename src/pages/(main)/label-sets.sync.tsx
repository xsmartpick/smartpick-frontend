import { Plus, Tag } from 'lucide-react'
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
import { formatDate, relativeTime } from '~/lib/date-utils'
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

export const Component = () => {
  const { t } = useTranslation()
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
          toast.success(t('labelSets.toast.createSuccess'), {
            description: t('labelSets.toast.createSuccessDesc', {
              name: createdLabelSet.name,
            }),
          })
        },
        onError: (err) => {
          toast.error(t('labelSets.toast.createError'), {
            description:
              err instanceof Error
                ? err.message
                : t('labelSets.toast.createErrorUnknown'),
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
              <h1 className="text-xl font-bold tracking-tight">
                {t('labelSets.page.title')}
              </h1>
              <p className="text-sm text-text-secondary">
                {t('labelSets.page.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-fill/50 px-3 py-2 text-xs text-text-tertiary md:flex">
              <span className="font-medium text-text">
                {t('labelSets.shortcuts.label')}
              </span>
              <span className="rounded-md bg-fill px-1.5 py-0.5">N</span>
              <span>{t('labelSets.shortcuts.new')}</span>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('labelSets.newLabelSet')}
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
                <LoadingState message={t('labelSets.loading')} />
              ) : error ? (
                <ErrorState
                  title={t('labelSets.error.title')}
                  onRetry={() => refetch()}
                />
              ) : sortedLabelSets.length === 0 ? (
                <EmptyState
                  title={t('labelSets.empty.title')}
                  message={t('labelSets.empty.message')}
                />
              ) : view === 'table' ? (
                <Table variant="hover">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('labelSets.table.headers.name')}</TableHead>
                      <TableHead>
                        {t('labelSets.table.headers.description')}
                      </TableHead>
                      <TableHead>
                        {t('labelSets.table.headers.labels')}
                      </TableHead>
                      <TableHead>
                        {t('labelSets.table.headers.created')}
                      </TableHead>
                      <TableHead>
                        {t('labelSets.table.headers.updated')}
                      </TableHead>
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
                              {t('labelSets.labels.unit', {
                                count: labelSet.labels.length,
                              })}
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
                          {relativeTime(labelSet.createdAt, t)}
                        </TableCell>
                        <TableCell
                          className="text-text-secondary"
                          title={formatDate(labelSet.updatedAt)}
                        >
                          {relativeTime(labelSet.updatedAt, t)}
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
                            {t('labelSets.labels.count', {
                              count: labelSet.labels.length,
                            })}
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
                            {t('labelSets.labels.empty')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-text-tertiary">
                        <span title={formatDate(labelSet.createdAt)}>
                          {t('common.created')}:{' '}
                          {relativeTime(labelSet.createdAt, t)}
                        </span>
                        <span title={formatDate(labelSet.updatedAt)}>
                          {t('common.updated')}:{' '}
                          {relativeTime(labelSet.updatedAt, t)}
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
