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
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { Divider } from '~/components/ui/divider'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/input/Textarea'
import { Label } from '~/components/ui/label'
import { ScrollArea } from '~/components/ui/scroll-areas/ScrollArea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Spring } from '~/lib/spring'
import type {
  Dataset,
  MediaType,
  UpdateDatasetRequest,
} from '~/modules/datasets'
import { useDeleteDataset } from '~/modules/datasets'
import { useUpdateDataset } from '~/modules/datasets/hooks'

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

function getMediaTypeIcon(mediaType?: MediaType) {
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

function getMediaTypeLabel(mediaType?: MediaType): string {
  if (!mediaType) return 'Unknown'

  return mediaType.charAt(0).toUpperCase() + mediaType.slice(1)
}

export interface DatasetDetailsProps {
  dataset: Dataset | null
  onClose: () => void
  onUpdated?: (dataset: Dataset) => void
}

export function DatasetDetails({
  dataset,
  onClose,
  onUpdated,
}: DatasetDetailsProps) {
  const isOpen = dataset !== null
  const updateDatasetMutation = useUpdateDataset()
  const deleteDatasetMutation = useDeleteDataset()
  const [isEditing, setIsEditing] = React.useState(false)
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [mediaType, setMediaType] = React.useState<MediaType>('image')

  function handleDelete() {
    if (!dataset) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this dataset? This action cannot be undone.',
    )

    if (!confirmed) return

    deleteDatasetMutation.mutate(dataset.id, {
      onSuccess: () => {
        onClose()
      },
    })
  }

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

  React.useEffect(() => {
    if (!dataset) return
    setName(dataset.name)
    setDescription(dataset.description ?? '')
    setMediaType(dataset.mediaType)
    setIsEditing(false)
  }, [dataset])

  const trimmedName = name.trim()
  const trimmedDescription = description.trim()
  const currentDescription = dataset?.description ?? ''
  const isDirty = Boolean(
    dataset &&
      (trimmedName !== dataset.name ||
        trimmedDescription !== currentDescription ||
        mediaType !== dataset.mediaType),
  )
  const isNameValid = trimmedName.length >= 2

  const handleCancelEdit = () => {
    if (!dataset) return
    setName(dataset.name)
    setDescription(dataset.description ?? '')
    setMediaType(dataset.mediaType)
    setIsEditing(false)
  }

  const handleApply = () => {
    if (!dataset) return
    if (!isNameValid) {
      toast.error('Name must be at least 2 characters.')
      return
    }

    const request: UpdateDatasetRequest = {}

    if (trimmedName !== dataset.name) {
      request.name = trimmedName
    }
    if (trimmedDescription !== currentDescription) {
      request.description = trimmedDescription
    }
    if (mediaType !== dataset.mediaType) {
      request.mediaType = mediaType
    }

    if (Object.keys(request).length === 0) {
      toast.info('No changes to apply.')
      return
    }

    updateDatasetMutation.mutate(
      { id: dataset.id, request },
      {
        onSuccess: (updated) => {
          onUpdated?.(updated)
          setIsEditing(false)
          toast.success('Dataset updated successfully.')
        },
        onError: (err) => {
          toast.error('Failed to update dataset.', {
            description:
              err instanceof Error ? err.message : 'An unknown error occurred.',
          })
        },
      },
    )
  }

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
                          <Label
                            htmlFor="dataset-name"
                            className="mb-1 block text-xs font-medium text-text-tertiary"
                          >
                            Name
                          </Label>
                          {isEditing ? (
                            <Input
                              id="dataset-name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              disabled={updateDatasetMutation.isPending}
                            />
                          ) : (
                            <p className="text-sm text-text">{dataset.name}</p>
                          )}
                        </div>

                        <Divider />

                        <div>
                          <Label
                            htmlFor="dataset-description"
                            className="mb-1 block text-xs font-medium text-text-tertiary"
                          >
                            Description
                          </Label>
                          {isEditing ? (
                            <Textarea
                              id="dataset-description"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              rows={4}
                              disabled={updateDatasetMutation.isPending}
                            />
                          ) : (
                            <p className="text-sm text-text">
                              {dataset.description || (
                                <span className="text-text-tertiary italic">
                                  No description provided
                                </span>
                              )}
                            </p>
                          )}
                        </div>

                        <Divider />

                        <div>
                          <Label
                            htmlFor="dataset-media-type"
                            className="mb-1 block text-xs font-medium text-text-tertiary"
                          >
                            Media Type
                          </Label>
                          {isEditing ? (
                            <Select
                              value={mediaType}
                              onValueChange={(value) =>
                                setMediaType(value as MediaType)
                              }
                            >
                              <SelectTrigger
                                id="dataset-media-type"
                                disabled={updateDatasetMutation.isPending}
                              >
                                <SelectValue placeholder="Select media type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="image">Image</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="audio">Audio</SelectItem>
                                <SelectItem value="text">Text</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-text">
                              {getMediaTypeIcon(dataset.mediaType)}
                              <span>
                                {getMediaTypeLabel(dataset.mediaType)}
                              </span>
                            </div>
                          )}
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
                  {isEditing ? (
                    <>
                      <Button
                        variant="ghost"
                        onClick={handleCancelEdit}
                        disabled={updateDatasetMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleApply}
                        isLoading={updateDatasetMutation.isPending}
                        disabled={!isDirty || !isNameValid}
                      >
                        Apply
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={deleteDatasetMutation.isPending}
                      >
                        Close
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Dataset
                      </Button>
                    </>
                  )}
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteDatasetMutation.isPending}
                  >
                    Delete Dataset
                  </Button>
                </div>
              </div>
            </div>
          </m.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
