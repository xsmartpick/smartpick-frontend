import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  ClipboardList,
  Download,
  ImageIcon,
  MoreHorizontal,
  Plus,
  ScanSearch,
  Scissors,
  Tag,
  Trash2,
  XCircle,
} from 'lucide-react'
import { m } from 'motion/react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toast } from 'sonner'

import { getStableRouterNavigate } from '~/atoms/route'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu/DropdownMenu'
import { useMobile } from '~/hooks/common'
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'
import {
  SegmentationPanel,
  useBatchSegmentationSummary,
} from '~/modules/segmentation'
import { createTask } from '~/modules/tasks/api'
import { useBatchTaskCount } from '~/modules/tasks/hooks'

import { useDeleteBatch } from '../hooks'
import type { Batch } from '../types'
import { AddImagesModal } from './AddImagesModal'
import { SplitBatchModal } from './SplitBatchModal'

interface BatchDetailsProps {
  batch: Batch
}

function getStatusColor(status: Batch['status']) {
  switch (status) {
    case 'completed': {
      return 'bg-green/10 text-green border-green/20'
    }
    case 'processing': {
      return 'bg-amber/10 text-amber border-amber/20'
    }
    case 'failed': {
      return 'bg-red/10 text-red border-red/20'
    }
    default: {
      return 'bg-fill text-text-secondary border-border'
    }
  }
}

function getStatusLabel(status: Batch['status'], t: (key: string) => string) {
  switch (status) {
    case 'completed': {
      return t('batches.details.status.completed')
    }
    case 'processing': {
      return t('batches.details.status.processing')
    }
    case 'failed': {
      return t('batches.details.status.failed')
    }
    default: {
      return t('batches.details.status.draft')
    }
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function BatchDetails({ batch }: BatchDetailsProps) {
  const { t } = useTranslation()
  const navigate = getStableRouterNavigate()
  const isMobile = useMobile()
  const deleteBatchMutation = useDeleteBatch()
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  )
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false)
  const [isAddImagesModalOpen, setIsAddImagesModalOpen] = useState(false)

  // Fetch segment summary for this batch
  const { data: segmentSummary } = useBatchSegmentationSummary(batch.id)

  // Fetch task count for this batch
  const { data: taskCount = 0 } = useBatchTaskCount(batch.id)

  const handleBack = useCallback(() => {
    if (navigate) navigate('/batches', { replace: false })
  }, [navigate])

  const handleDelete = useCallback(async () => {
    try {
      await deleteBatchMutation.mutateAsync(batch.id)
      toast.success(t('batches.details.toast.deleteSuccess'))
      // Navigate back to batches list after successful delete
      if (navigate) navigate('/batches', { replace: true })
    } catch (error) {
      console.error('Failed to delete batch:', error)
      toast.error(t('batches.details.toast.deleteError'), {
        description:
          error instanceof Error
            ? error.message
            : t('batches.details.toast.deleteErrorDesc'),
      })
    }
  }, [batch.id, deleteBatchMutation, navigate, t])

  const images = batch.images || []

  // Group images by upload status for stats
  const imageStats = (() => {
    const stats = {
      uploaded: 0,
      processing: 0,
      failed: 0,
      pending: 0,
    }
    images.forEach((img) => {
      const status = img.uploadStatus.toLowerCase()
      switch (status) {
        case 'uploaded': {
          stats.uploaded++
          break
        }
        case 'processing': {
          stats.processing++
          break
        }
        case 'failed': {
          stats.failed++
          break
        }
        default: {
          stats.pending++
        }
      }
    })
    return stats
  })()

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div
          className={cn(
            'mx-auto max-w-7xl',
            isMobile ? 'px-3 py-2.5' : 'px-6 py-4',
          )}
        >
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-9 w-9 shrink-0 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h1
                  className={cn(
                    'truncate font-semibold text-text',
                    isMobile ? 'text-base' : 'text-xl',
                  )}
                >
                  {batch.name}
                </h1>
                {batch.description && !isMobile && (
                  <p className="mt-0.5 truncate text-sm text-text-secondary">
                    {batch.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {!isMobile && (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
                    getStatusColor(batch.status),
                  )}
                >
                  {getStatusLabel(batch.status, t)}
                </span>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAddImagesModalOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Images
              </Button>

              <Link to={`/label/${batch.id}`}>
                <Button variant="primary" size="sm">
                  <Tag className="mr-2 h-4 w-4" />
                  Start Labeling
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 shrink-0 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsSplitModalOpen(true)}>
                    <Scissors className="mr-2 h-4 w-4" />
                    {t('batches.details.actions.split')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    {t('batches.details.actions.export')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red focus:text-red"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('batches.details.actions.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={Spring.presets.smooth}
        >
          {/* Stats Grid - Organized by Category */}
          <div className="mb-8 space-y-6">
            {/* Overview Stats */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                {t('batches.details.stats.overview', {
                  defaultValue: 'Overview',
                })}
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <m.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...Spring.presets.smooth, delay: 0.05 }}
                  className="rounded-2xl border border-border bg-gradient-to-br from-fill/50 to-transparent p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text">
                        {batch.imageCount}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t('batches.details.stats.totalImages')}
                      </p>
                    </div>
                  </div>
                </m.div>

                <m.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...Spring.presets.smooth, delay: 0.07 }}
                  className="rounded-2xl border border-border bg-gradient-to-br from-fill/50 to-transparent p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple/10 text-purple">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text">
                        {taskCount}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t('batches.details.stats.tasks', {
                          defaultValue: 'Tasks',
                        })}
                      </p>
                    </div>
                  </div>
                </m.div>

                {segmentSummary && segmentSummary.totalSegments > 0 && (
                  <m.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...Spring.presets.smooth, delay: 0.09 }}
                    className="rounded-2xl border border-border bg-gradient-to-br from-fill/50 to-transparent p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue/10 text-blue">
                        <ScanSearch className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-text">
                          {segmentSummary.totalSegments}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {t('batches.details.stats.totalSegments', {
                            defaultValue: 'Segments',
                          })}
                        </p>
                      </div>
                    </div>
                  </m.div>
                )}
              </div>
            </div>

            {/* Image Upload Status */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                {t('batches.details.stats.imageUploadStatus', {
                  defaultValue: 'Image Upload Status',
                })}
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <m.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...Spring.presets.smooth, delay: 0.1 }}
                  className="rounded-2xl border border-border bg-gradient-to-br from-fill/50 to-transparent p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green/10 text-green">
                      <i className="i-mingcute-check-circle-fill h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text">
                        {imageStats.uploaded}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t('batches.details.stats.uploaded')}
                      </p>
                    </div>
                  </div>
                </m.div>

                <m.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...Spring.presets.smooth, delay: 0.12 }}
                  className="rounded-2xl border border-border bg-gradient-to-br from-fill/50 to-transparent p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber/10 text-amber">
                      <i className="i-mingcute-loading-line h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text">
                        {imageStats.processing}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t('batches.details.stats.processing')}
                      </p>
                    </div>
                  </div>
                </m.div>

                <m.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...Spring.presets.smooth, delay: 0.14 }}
                  className="rounded-2xl border border-border bg-gradient-to-br from-fill/50 to-transparent p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red/10 text-red">
                      <i className="i-mingcute-close-circle-fill h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-text">
                        {imageStats.failed}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t('batches.details.stats.uploadFailed', {
                          defaultValue: 'Upload Failed',
                        })}
                      </p>
                    </div>
                  </div>
                </m.div>
              </div>
            </div>

            {/* Segment Review Status */}
            {segmentSummary && segmentSummary.totalSegments > 0 && (
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  {t('batches.details.stats.segmentReviewStatus', {
                    defaultValue: 'Segment Review Status',
                  })}
                </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <m.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...Spring.presets.smooth, delay: 0.16 }}
                    className="rounded-2xl border border-border bg-gradient-to-br from-fill/50 to-transparent p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green/10 text-green">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-text">
                          {segmentSummary.approvedSegments}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {t('batches.details.stats.approved', {
                            defaultValue: 'Approved',
                          })}
                        </p>
                      </div>
                    </div>
                  </m.div>

                  <m.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...Spring.presets.smooth, delay: 0.18 }}
                    className="rounded-2xl border border-border bg-gradient-to-br from-fill/50 to-transparent p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber/10 text-amber">
                        <Circle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-text">
                          {segmentSummary.pendingSegments}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {t('batches.details.stats.pendingReview', {
                            defaultValue: 'Pending Review',
                          })}
                        </p>
                      </div>
                    </div>
                  </m.div>

                  <m.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...Spring.presets.smooth, delay: 0.2 }}
                    className="rounded-2xl border border-border bg-gradient-to-br from-fill/50 to-transparent p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red/10 text-red">
                        <XCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-text">
                          {segmentSummary.rejectedSegments}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {t('batches.details.stats.rejected', {
                            defaultValue: 'Rejected',
                          })}
                        </p>
                      </div>
                    </div>
                  </m.div>
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="mb-8 rounded-2xl border border-border bg-background p-6">
            <h2 className="mb-4 text-base font-semibold text-text">
              {t('batches.details.info.title')}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
                <div>
                  <p className="text-xs font-medium text-text-secondary">
                    {t('batches.details.info.created')}
                  </p>
                  <p className="mt-0.5 text-sm text-text">
                    {formatDate(batch.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
                <div>
                  <p className="text-xs font-medium text-text-secondary">
                    {t('batches.details.info.updated')}
                  </p>
                  <p className="mt-0.5 text-sm text-text">
                    {formatDate(batch.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Segmentation Panel - Auto split images into objects */}
          <SegmentationPanel batchId={batch.id} className="mb-8" />

          {/* Image Gallery */}
          <div className="rounded-2xl border border-border bg-background">
            <div className="border-b border-border p-6">
              <h2 className="text-base font-semibold text-text">
                {t('batches.details.gallery.title')}
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                {images.length === 0
                  ? t('batches.details.gallery.noImages')
                  : t('batches.details.gallery.imageCount', {
                      count: images.length,
                    })}
              </p>
            </div>

            {images.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-fill text-text-tertiary">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <p className="mt-4 text-sm text-text-secondary">
                  {t('batches.details.gallery.empty')}
                </p>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {images.map((image, index) => (
                    <m.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        ...Spring.presets.smooth,
                        delay: index * 0.02,
                      }}
                      className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-border bg-fill transition-all hover:border-accent/30 hover:shadow-lg"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={image.downloadUrl}
                        alt={image.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <p className="truncate text-xs font-medium text-white">
                          {image.name}
                        </p>
                        <p className="text-xs text-white/80">
                          {formatFileSize(image.size)}
                        </p>
                      </div>
                      {image.uploadStatus !== 'uploaded' && (
                        <div className="absolute top-2 right-2">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                              image.uploadStatus === 'processing' &&
                                'bg-amber/10 text-amber border-amber/20',
                              image.uploadStatus === 'failed' &&
                                'bg-red/10 text-red border-red/20',
                              image.uploadStatus === 'pending' &&
                                'bg-fill text-text-secondary border-border',
                            )}
                          >
                            {image.uploadStatus}
                          </span>
                        </div>
                      )}
                    </m.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </m.div>
      </div>

      {/* Image Modal/Viewer (simplified - can be enhanced later) */}
      {selectedImageIndex !== null && images[selectedImageIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImageIndex(null)}
        >
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={Spring.presets.smooth}
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedImageIndex].downloadUrl}
              alt={images[selectedImageIndex].name}
              className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-9 w-9 bg-black/50 p-0 text-white hover:bg-black/70"
              onClick={() => setSelectedImageIndex(null)}
            >
              ×
            </Button>
          </m.div>
        </div>
      )}

      {/* Split Batch Modal */}
      <SplitBatchModal
        open={isSplitModalOpen}
        batch={batch}
        onClose={() => setIsSplitModalOpen(false)}
        onSubmit={async (tasks) => {
          // Create each task sequentially via API
          for (const task of tasks) {
            // Skip empty tasks
            const hasItems =
              task.segmentIds.length > 0 || task.imageIds.length > 0
            if (!hasItems) continue

            const isSegmentBased = task.segmentIds.length > 0
            const description = isSegmentBased
              ? `Task ${task.taskNumber} of ${tasks.length} (${task.segmentCount} segments from ${task.imageCount} images)`
              : `Task ${task.taskNumber} of ${tasks.length} (${task.imageCount} images)`

            await createTask({
              batchId: batch.id,
              name: `${batch.name} - Task ${task.taskNumber}`,
              description,
              batchItemIds: task.imageIds,
              segmentIds: isSegmentBased ? task.segmentIds : undefined,
            })
          }
        }}
      />

      {/* Add Images Modal */}
      <AddImagesModal
        open={isAddImagesModalOpen}
        batchId={batch.id}
        batchName={batch.name}
        onClose={() => setIsAddImagesModalOpen(false)}
        onSuccess={() => {
          // Refresh will happen automatically via query invalidation
        }}
      />
    </div>
  )
}
