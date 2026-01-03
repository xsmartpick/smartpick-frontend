import { FolderPlus, ImageIcon, Plus, Search } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { getStableRouterNavigate } from '~/atoms/route'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  StatsCard,
  UserInfo,
} from '~/components/common'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useKeyboardShortcut } from '~/hooks/common'
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

export const Component = () => {
  const { data: batches = [], isLoading, error, refetch } = useBatches()
  const createBatchMutation = useCreateBatch()
  const deleteBatchMutation = useDeleteBatch()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false)
  const [selectedBatchForSplit, setSelectedBatchForSplit] =
    useState<Batch | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

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
        toast.success('Batch created successfully!', {
          description: `${data.name} with ${fileIds.length} images has been created.`,
        })
      } catch (error) {
        console.error('Failed to create batch:', error)
        toast.error('Failed to create batch', {
          description:
            error instanceof Error
              ? error.message
              : 'An error occurred while creating the batch.',
        })
      }
    },
    [createBatchMutation, setIsCreateModalOpen],
  )

  // Handle delete batch
  const handleDeleteBatch = useCallback(
    async (id: string) => {
      try {
        await deleteBatchMutation.mutateAsync(id)
        toast.success('Batch deleted successfully')
      } catch (error) {
        console.error('Failed to delete batch:', error)
        toast.error('Failed to delete batch', {
          description:
            error instanceof Error
              ? error.message
              : 'An error occurred while deleting the batch.',
        })
      }
    },
    [deleteBatchMutation],
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

  // Stats
  const totalImages = useMemo(
    () => batches.reduce((sum, batch) => sum + batch.imageCount, 0),
    [batches],
  )

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={Spring.presets.bouncy}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-md shadow-violet-500/20"
            >
              <FolderPlus className="h-5 w-5" />
            </m.div>
            <div>
              <div className="text-base font-semibold tracking-tight">
                Batches
              </div>
              <div className="text-xs text-text-secondary">
                Upload and manage image batches
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
              New batch
            </Button>
            <UserInfo />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {isLoading ? (
          <LoadingState message="Loading batches..." />
        ) : error ? (
          <ErrorState
            title="Failed to load batches"
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
                label="Total Batches"
                delay={0.05}
              />
              <StatsCard
                icon={<ImageIcon className="h-5 w-5" />}
                iconClassName="bg-violet-500/10 text-violet-500"
                value={totalImages}
                label="Total Images"
                delay={0.1}
              />
              <StatsCard
                icon={<i className="i-mingcute-check-circle-fill h-5 w-5" />}
                iconClassName="bg-green/10 text-green"
                value={batches.filter((b) => b.status === 'completed').length}
                label="Completed"
                delay={0.15}
              />
            </div>

            {/* Search and filter bar */}
            <div className="mb-6 flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  type="search"
                  placeholder="Search batches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              </div>
            </div>

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
                    title="No batches yet"
                    message="Create your first batch to start uploading and organizing images."
                    action={
                      <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="primary"
                        className="mt-4"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first batch
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
                    title="No matching batches"
                    message={`No batches found matching "${searchQuery}"`}
                    action={
                      <Button
                        onClick={() => setSearchQuery('')}
                        variant="secondary"
                        className="mt-4"
                      >
                        Clear search
                      </Button>
                    }
                  />
                )}
              </m.div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filteredBatches.map((batch) => (
                    <BatchCard
                      key={batch.id}
                      batch={batch}
                      onDelete={handleDeleteBatch}
                      onSplit={handleSplitBatch}
                      onClick={(b) => {
                        const navigate = getStableRouterNavigate()
                        if (navigate) navigate(`/batches/${b.id}`)
                      }}
                    />
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
    </div>
  )
}
