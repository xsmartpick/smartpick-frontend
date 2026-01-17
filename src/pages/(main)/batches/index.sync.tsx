import { Database, FolderPlus, ImageIcon, Plus, Search, X } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { getStableRouterNavigate } from '~/atoms/route'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  StatsCard,
} from '~/components/common'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { useKeyboardShortcut } from '~/hooks/common'
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'
import type { Batch, CreateBatchFormData } from '~/modules/batches'
import {
  BatchCard,
  CreateBatchModal,
  SplitBatchModal,
  useBatches,
  useCreateBatch,
  useDeleteBatch,
} from '~/modules/batches'
import { CreateDatasetFromBatchesModal } from '~/modules/datasets/components'

export const Component = () => {
  const { t } = useTranslation()
  const { data: batches = [], isLoading, error, refetch } = useBatches()
  const createBatchMutation = useCreateBatch()
  const deleteBatchMutation = useDeleteBatch()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false)
  const [isCreateDatasetModalOpen, setIsCreateDatasetModalOpen] =
    useState(false)
  const [selectedBatchForSplit, setSelectedBatchForSplit] =
    useState<Batch | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(
    new Set(),
  )

  // Keyboard shortcut: N to create new batch
  useKeyboardShortcut({
    key: 'n',
    handler: () => setIsCreateModalOpen(true),
  })

  // Filter batches by search query
  const filteredBatches = !searchQuery.trim()
    ? batches
    : batches.filter((batch) => {
        const query = searchQuery.toLowerCase()
        return (
          batch.name.toLowerCase().includes(query) ||
          batch.description.toLowerCase().includes(query)
        )
      })

  // Handle create batch
  const handleCreateBatch = useCallback(
    async (data: CreateBatchFormData) => {
      try {
        // Extract fileIds from successfully uploaded images
        const fileIds = data.images
          .filter((img) => img.uploadStatus === 'uploaded' && img.fileId)
          .map((img) => img.fileId!)
          .filter((id): id is string => id !== undefined)

        await createBatchMutation.mutateAsync({
          name: data.name,
          description: data.description || undefined,
          datasetId: undefined, // TODO: Add dataset selection if needed
          fileIds: fileIds.length > 0 ? fileIds : undefined,
        })

        setIsCreateModalOpen(false)
        toast.success(t('batches.toast.createSuccess'), {
          description: t('batches.toast.createSuccessDesc', {
            name: data.name,
            count: fileIds.length,
          }),
        })
      } catch (error) {
        console.error('Failed to create batch:', error)
        toast.error(t('batches.toast.createError'), {
          description:
            error instanceof Error
              ? error.message
              : t('batches.toast.createErrorDesc'),
        })
      }
    },
    [createBatchMutation, setIsCreateModalOpen, t],
  )

  // Handle delete batch
  const handleDeleteBatch = useCallback(
    async (id: string) => {
      try {
        await deleteBatchMutation.mutateAsync(id)
        toast.success(t('batches.toast.deleteSuccess'))
      } catch (error) {
        console.error('Failed to delete batch:', error)
        toast.error(t('batches.toast.deleteError'), {
          description:
            error instanceof Error
              ? error.message
              : t('batches.toast.deleteErrorDesc'),
        })
      }
    },
    [deleteBatchMutation, t],
  )

  // Handle split batch
  const handleSplitBatch = useCallback((batch: Batch) => {
    setSelectedBatchForSplit(batch)
    setIsSplitModalOpen(true)
  }, [])

  const handleCloseSplitModal = useCallback(() => {
    setIsSplitModalOpen(false)
    setSelectedBatchForSplit(null)
  }, [])

  // Batch selection handlers
  const handleToggleBatchSelection = useCallback((batchId: string) => {
    setSelectedBatchIds((prev) => {
      const next = new Set(prev)
      if (next.has(batchId)) {
        next.delete(batchId)
      } else {
        next.add(batchId)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedBatchIds.size === filteredBatches.length) {
      setSelectedBatchIds(new Set())
    } else {
      setSelectedBatchIds(new Set(filteredBatches.map((b) => b.id)))
    }
  }, [filteredBatches, selectedBatchIds.size])

  const handleClearSelection = useCallback(() => {
    setSelectedBatchIds(new Set())
  }, [])

  const selectedBatches = useMemo(
    () => batches.filter((b) => selectedBatchIds.has(b.id)),
    [batches, selectedBatchIds],
  )

  const handleCreateDatasetSuccess = useCallback((_datasetId: string) => {
    setSelectedBatchIds(new Set())
    const navigate = getStableRouterNavigate()
    if (navigate) {
      navigate(`/datasets`)
    }
  }, [])

  // Stats
  const totalImages = useMemo(
    () => batches.reduce((sum, batch) => sum + batch.imageCount, 0),
    [batches],
  )

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
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20"
            >
              <FolderPlus className="h-6 w-6" />
            </m.div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {t('batches.title')}
              </h1>
              <p className="text-sm text-text-secondary">
                {t('batches.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-fill/50 px-3 py-2 text-xs text-text-tertiary md:flex">
              <span className="font-medium text-text">
                {t('batches.shortcuts.label')}
              </span>
              <span className="rounded-md bg-fill px-1.5 py-0.5">N</span>
              <span>{t('batches.shortcuts.new')}</span>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('batches.newBatch')}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {isLoading ? (
          <LoadingState message={t('batches.loading')} />
        ) : error ? (
          <ErrorState
            title={t('batches.error.title')}
            message={error.message}
            onRetry={() => refetch()}
          />
        ) : (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={Spring.presets.smooth}
          >
            {/* Stats cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatsCard
                icon={<FolderPlus className="h-5 w-5" />}
                iconClassName="bg-accent/10 text-accent"
                value={batches.length}
                label={t('batches.stats.totalBatches')}
                delay={0.05}
              />
              <StatsCard
                icon={<ImageIcon className="h-5 w-5" />}
                iconClassName="bg-violet-500/10 text-violet-500"
                value={totalImages}
                label={t('batches.stats.totalImages')}
                delay={0.1}
              />
              <StatsCard
                icon={<i className="i-mingcute-check-circle-fill h-5 w-5" />}
                iconClassName="bg-green/10 text-green"
                value={batches.filter((b) => b.status === 'completed').length}
                label={t('batches.stats.completed')}
                delay={0.15}
              />
            </div>

            {/* Search and filter bar */}
            <div className="mb-6 flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  type="search"
                  placeholder={t('batches.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              </div>
              {filteredBatches.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  {selectedBatchIds.size === filteredBatches.length
                    ? t('common.deselectAll', { defaultValue: 'Deselect All' })
                    : t('common.selectAll', { defaultValue: 'Select All' })}
                </Button>
              )}
            </div>

            {/* Selection Action Bar */}
            {selectedBatchIds.size > 0 && (
              <m.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={Spring.presets.smooth}
                className="mb-6 flex items-center justify-between rounded-xl border border-accent/30 bg-accent/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text">
                    {t('batches.selection.count', {
                      count: selectedBatchIds.size,
                      defaultValue: `${selectedBatchIds.size} batch(es) selected`,
                    })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    className="h-7 px-2 text-xs"
                  >
                    <X className="mr-1 h-3 w-3" />
                    {t('common.clear', { defaultValue: 'Clear' })}
                  </Button>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateDatasetModalOpen(true)}
                >
                  <Database className="mr-2 h-4 w-4" />
                  {t('batches.selection.createDataset', {
                    defaultValue: 'Create Dataset',
                  })}
                </Button>
              </m.div>
            )}

            {/* Batch grid or empty state */}
            {filteredBatches.length === 0 ? (
              <m.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={Spring.presets.smooth}
                className="rounded-2xl border border-border bg-background p-12"
              >
                {batches.length === 0 ? (
                  <EmptyState
                    icon={
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-500">
                        <FolderPlus className="h-8 w-8" />
                      </div>
                    }
                    title={t('batches.empty.title')}
                    message={t('batches.empty.message')}
                    action={
                      <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="primary"
                        className="mt-4"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t('batches.empty.button')}
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState
                    icon={
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-fill text-text-tertiary">
                        <Search className="h-8 w-8" />
                      </div>
                    }
                    title={t('batches.noResults.title')}
                    message={t('batches.noResults.message', {
                      query: searchQuery,
                    })}
                    action={
                      <Button
                        onClick={() => setSearchQuery('')}
                        variant="secondary"
                        className="mt-4"
                      >
                        {t('batches.noResults.button')}
                      </Button>
                    }
                  />
                )}
              </m.div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filteredBatches.map((batch) => (
                    <div key={batch.id} className="relative">
                      {/* Selection checkbox overlay */}
                      <div
                        className={cn(
                          'absolute left-3 top-3 z-10 transition-opacity',
                          selectedBatchIds.size > 0
                            ? 'opacity-100'
                            : 'opacity-0 group-hover:opacity-100',
                        )}
                      >
                        <Checkbox
                          checked={selectedBatchIds.has(batch.id)}
                          onCheckedChange={() =>
                            handleToggleBatchSelection(batch.id)
                          }
                          className="h-5 w-5 bg-background/80 backdrop-blur-sm"
                        />
                      </div>
                      <BatchCard
                        batch={batch}
                        onDelete={handleDeleteBatch}
                        onSplit={handleSplitBatch}
                        onClick={(b) => {
                          // If in selection mode, toggle selection instead of navigating
                          if (selectedBatchIds.size > 0) {
                            handleToggleBatchSelection(b.id)
                          } else {
                            const navigate = getStableRouterNavigate()
                            if (navigate) navigate(`/batches/${b.id}`)
                          }
                        }}
                        className={cn(
                          selectedBatchIds.has(batch.id) &&
                            'ring-2 ring-accent ring-offset-2 ring-offset-background',
                        )}
                      />
                    </div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </m.div>
        )}
      </div>

      {/* Create Batch Modal */}
      <CreateBatchModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBatch}
      />

      {/* Split Batch Modal */}
      {selectedBatchForSplit && (
        <SplitBatchModal
          open={isSplitModalOpen}
          batch={selectedBatchForSplit}
          onClose={handleCloseSplitModal}
          onSubmit={async (_) => {
            // UI-only implementation
            // TODO: BE integration

            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }}
        />
      )}

      {/* Create Dataset from Batches Modal */}
      <CreateDatasetFromBatchesModal
        open={isCreateDatasetModalOpen}
        batches={selectedBatches}
        onClose={() => setIsCreateDatasetModalOpen(false)}
        onSuccess={handleCreateDatasetSuccess}
      />
    </div>
  )
}
