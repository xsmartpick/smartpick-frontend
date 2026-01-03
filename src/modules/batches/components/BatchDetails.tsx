import {
  ArrowLeft,
  Calendar,
  Download,
  ImageIcon,
  MoreHorizontal,
  Scissors,
  Trash2,
} from 'lucide-react'
import { m } from 'motion/react'
import { useCallback, useState } from 'react'
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

import { useDeleteBatch } from '../hooks'
import type { Batch } from '../types'
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

function getStatusLabel(status: Batch['status']) {
  switch (status) {
    case 'completed': {
      return 'Completed'
    }
    case 'processing': {
      return 'Processing'
    }
    case 'failed': {
      return 'Failed'
    }
    default: {
      return 'Draft'
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
  const navigate = getStableRouterNavigate()
  const isMobile = useMobile()
  const deleteBatchMutation = useDeleteBatch()
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  )
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false)

  const handleBack = useCallback(() => {
    if (navigate) navigate('/batches', { replace: false })
  }, [navigate])

  const handleDelete = useCallback(async () => {
    try {
      await deleteBatchMutation.mutateAsync(batch.id)
      toast.success('Batch deleted successfully')
      // Navigate back to batches list after successful delete
      if (navigate) navigate('/batches', { replace: true })
    } catch (error) {
      console.error('Failed to delete batch:', error)
      toast.error('Failed to delete batch', {
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred while deleting the batch.',
      })
    }
  }, [batch.id, deleteBatchMutation, navigate])

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
                  {getStatusLabel(batch.status)}
                </span>
              )}

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
                    Split into Tasks
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Export batch
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red focus:text-red"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete batch
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
          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  <p className="text-xs text-text-secondary">Total Images</p>
                </div>
              </div>
            </m.div>

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
                  <p className="text-xs text-text-secondary">Uploaded</p>
                </div>
              </div>
            </m.div>

            <m.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...Spring.presets.smooth, delay: 0.15 }}
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
                  <p className="text-xs text-text-secondary">Processing</p>
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
                  <i className="i-mingcute-close-circle-fill h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-text">
                    {imageStats.failed}
                  </p>
                  <p className="text-xs text-text-secondary">Failed</p>
                </div>
              </div>
            </m.div>
          </div>

          {/* Metadata */}
          <div className="mb-8 rounded-2xl border border-border bg-background p-6">
            <h2 className="mb-4 text-base font-semibold text-text">
              Batch Information
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-text-tertiary" />
                <div>
                  <p className="text-xs font-medium text-text-secondary">
                    Created
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
                    Last Updated
                  </p>
                  <p className="mt-0.5 text-sm text-text">
                    {formatDate(batch.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="rounded-2xl border border-border bg-background">
            <div className="border-b border-border p-6">
              <h2 className="text-base font-semibold text-text">Images</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {images.length === 0
                  ? 'No images in this batch'
                  : `${images.length} image${images.length === 1 ? '' : 's'}`}
              </p>
            </div>

            {images.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-fill text-text-tertiary">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <p className="mt-4 text-sm text-text-secondary">
                  This batch doesn't have any images yet.
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
        onSubmit={async (_) => {
          // UI-only implementation
          // TODO: BE integration

          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }}
      />
    </div>
  )
}
