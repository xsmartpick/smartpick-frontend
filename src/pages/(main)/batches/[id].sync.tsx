import { ArrowLeft, Calendar, ImageIcon, Loader2 } from 'lucide-react'
import { m } from 'motion/react'
import { useNavigate, useParams } from 'react-router'

import { ErrorState, LoadingState } from '~/components/common'
import { Button } from '~/components/ui/button'
import { Spring } from '~/lib/spring'
import { useBatch } from '~/modules/batches'

/**
 * FemtoHell: Batch Detail Page
 * Uses GetBatch endpoint which returns presigned URLs for images (5min expiry)
 * This is the only place where we load full batch with images
 */
export const Component = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: batch, isLoading, error } = useBatch(id!)

  if (isLoading) {
    return <LoadingState message="Loading batch details..." />
  }

  if (error || !batch) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ErrorState
          title="Failed to load batch"
          message={error?.message || 'Batch not found'}
          onRetry={() => navigate('/batches')}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/batches')}
            className="shrink-0"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex-1">
            <h1 className="text-xl font-bold">{batch.name}</h1>
            {batch.description && (
              <p className="text-sm text-text-secondary">{batch.description}</p>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-text-tertiary">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>
                {batch.imageCount} {batch.imageCount === 1 ? 'image' : 'images'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(batch.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={Spring.presets.smooth}
        >
          {/* Images Grid */}
          {batch.images && batch.images.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {batch.images.map((image, idx) => (
                <m.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02, ...Spring.presets.smooth }}
                  className="group relative overflow-hidden rounded-xl border border-border bg-fill"
                >
                  <div className="aspect-square overflow-hidden">
                    {image.uploadStatus === 'uploaded' && image.downloadUrl ? (
                      <img
                        src={image.downloadUrl}
                        alt={image.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-fill">
                        <div className="flex flex-col items-center gap-2 text-text-tertiary">
                          {image.uploadStatus === 'pending' ||
                          image.uploadStatus === 'uploading' ? (
                            <>
                              <Loader2 className="h-8 w-8 animate-spin" />
                              <span className="text-xs">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <ImageIcon className="h-8 w-8" />
                              <span className="text-xs">No preview</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Image info overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="truncate text-xs font-medium text-white">
                      {image.name}
                    </p>
                    <p className="text-xs text-white/70">
                      {(image.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </m.div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-border bg-fill/50">
              <div className="flex flex-col items-center gap-3 text-text-tertiary">
                <ImageIcon className="h-12 w-12" />
                <p className="text-sm">No images in this batch</p>
              </div>
            </div>
          )}
        </m.div>
      </div>
    </div>
  )
}
