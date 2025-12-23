import {
  Calendar,
  Clock,
  FileText,
  Image,
  Music,
  Type,
  User,
  Video,
  X,
} from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import * as React from 'react'

import { Button } from '~/components/ui/button'
import { Divider } from '~/components/ui/divider'
import { ScrollArea } from '~/components/ui/scroll-areas/ScrollArea'
import { Spring } from '~/lib/spring'
import type { Dataset, MediaType } from '~/modules/datasets'

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

function getMediaTypeIcon(mediaType: MediaType) {
  switch (mediaType) {
    case 'image': {
      return <Image className="h-4 w-4" />
    }
    case 'video': {
      return <Video className="h-4 w-4" />
    }
    case 'audio': {
      return <Music className="h-4 w-4" />
    }
    case 'text': {
      return <Type className="h-4 w-4" />
    }
    default: {
      return <FileText className="h-4 w-4" />
    }
  }
}

function getMediaTypeLabel(mediaType: MediaType): string {
  return mediaType.charAt(0).toUpperCase() + mediaType.slice(1)
}

export interface DatasetDetailsProps {
  dataset: Dataset | null
  onClose: () => void
}

export function DatasetDetails({ dataset, onClose }: DatasetDetailsProps) {
  const isOpen = dataset !== null

  React.useEffect(() => {
    if (!isOpen) return

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && dataset ? (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={Spring.presets.smooth}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar Panel */}
          <m.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={Spring.presets.smooth}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-background">
                    {getMediaTypeIcon(dataset.mediaType)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-text">
                      Dataset Details
                    </h2>
                    <p className="text-xs text-text-secondary">
                      {dataset.name}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="h-8 w-8 rounded-xl p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <ScrollArea rootClassName="flex-1">
                <div className="px-6 py-6">
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <section>
                      <h3 className="mb-4 text-sm font-semibold text-text">
                        Basic Information
                      </h3>
                      <div className="space-y-4 rounded-2xl border border-border bg-fill/30 p-4">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-text-tertiary">
                            Name
                          </label>
                          <p className="text-sm text-text">{dataset.name}</p>
                        </div>

                        <Divider />

                        <div>
                          <label className="mb-1 block text-xs font-medium text-text-tertiary">
                            Description
                          </label>
                          <p className="text-sm text-text">
                            {dataset.description || (
                              <span className="text-text-tertiary italic">
                                No description provided
                              </span>
                            )}
                          </p>
                        </div>

                        <Divider />

                        <div>
                          <label className="mb-1 block text-xs font-medium text-text-tertiary">
                            Media Type
                          </label>
                          <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-text">
                            {getMediaTypeIcon(dataset.mediaType)}
                            <span>{getMediaTypeLabel(dataset.mediaType)}</span>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Metadata */}
                    <section>
                      <h3 className="mb-4 text-sm font-semibold text-text">
                        Metadata
                      </h3>
                      <div className="space-y-4 rounded-2xl border border-border bg-fill/30 p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-5 w-5 items-center justify-center text-text-secondary">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-text-tertiary">
                              Created At
                            </label>
                            <p className="text-sm text-text">
                              {formatDate(dataset.createdAt)}
                            </p>
                          </div>
                        </div>

                        <Divider />

                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-5 w-5 items-center justify-center text-text-secondary">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-text-tertiary">
                              Updated At
                            </label>
                            <p className="text-sm text-text">
                              {formatDate(dataset.updatedAt)}
                            </p>
                          </div>
                        </div>

                        <Divider />

                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-5 w-5 items-center justify-center text-text-secondary">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <label className="mb-1 block text-xs font-medium text-text-tertiary">
                              Created By
                            </label>
                            <p className="text-sm text-text">
                              {dataset.createdBy || (
                                <span className="text-text-tertiary italic">
                                  Unknown
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Dataset ID */}
                    <section>
                      <h3 className="mb-4 text-sm font-semibold text-text">
                        Technical Details
                      </h3>
                      <div className="rounded-2xl border border-border bg-fill/30 p-4">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-text-tertiary">
                            Dataset ID
                          </label>
                          <p className="font-mono text-xs text-text-secondary">
                            {dataset.id}
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </ScrollArea>

              {/* Footer Actions */}
              <div className="border-t border-border px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" onClick={onClose}>
                    Close
                  </Button>
                  <Button variant="primary">Edit Dataset</Button>
                </div>
              </div>
            </div>
          </m.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
