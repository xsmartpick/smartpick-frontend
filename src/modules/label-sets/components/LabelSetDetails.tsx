import { Calendar, Clock, Tag, Trash2, User, X } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import * as React from 'react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import { Divider } from '~/components/ui/divider'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/input/Textarea'
import { Label } from '~/components/ui/label'
import { Prompt } from '~/components/ui/prompts/Prompt'
import { ScrollArea } from '~/components/ui/scroll-areas/ScrollArea'
import { Spring } from '~/lib/spring'
import type { LabelSet, UpdateLabelSetRequest } from '~/modules/label-sets'
import {
  useDeleteLabelSet,
  useUpdateLabelSet,
} from '~/modules/label-sets/hooks'

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

export interface LabelSetDetailsProps {
  labelSet: LabelSet | null
  onClose: () => void
  onUpdated?: (labelSet: LabelSet) => void
  onDeleted?: (id: string) => void
}

export function LabelSetDetails({
  labelSet,
  onClose,
  onUpdated,
  onDeleted,
}: LabelSetDetailsProps) {
  const isOpen = labelSet !== null
  const updateLabelSetMutation = useUpdateLabelSet()
  const deleteLabelSetMutation = useDeleteLabelSet()
  const [isEditing, setIsEditing] = React.useState(false)
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')

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
    if (!labelSet) return
    setName(labelSet.name)
    setDescription(labelSet.description ?? '')
    setIsEditing(false)
  }, [labelSet])

  const trimmedName = name.trim()
  const trimmedDescription = description.trim()
  const currentDescription = labelSet?.description ?? ''
  const isDirty = Boolean(
    labelSet &&
      (trimmedName !== labelSet.name ||
        trimmedDescription !== currentDescription),
  )
  const isNameValid = trimmedName.length >= 2
  const isMutating =
    updateLabelSetMutation.isPending || deleteLabelSetMutation.isPending

  const handleCancelEdit = () => {
    if (!labelSet) return
    setName(labelSet.name)
    setDescription(labelSet.description ?? '')
    setIsEditing(false)
  }

  const handleApply = () => {
    if (!labelSet) return
    if (!isNameValid) {
      toast.error('Name must be at least 2 characters.')
      return
    }

    const request: UpdateLabelSetRequest = {}

    if (trimmedName !== labelSet.name) {
      request.name = trimmedName
    }
    if (trimmedDescription !== currentDescription) {
      request.description = trimmedDescription
    }

    if (Object.keys(request).length === 0) {
      toast.info('No changes to apply.')
      return
    }

    updateLabelSetMutation.mutate(
      { id: labelSet.id, request },
      {
        onSuccess: (updated) => {
          onUpdated?.(updated)
          setIsEditing(false)
          toast.success('Label set updated successfully.')
        },
        onError: (err) => {
          toast.error('Failed to update label set.', {
            description:
              err instanceof Error ? err.message : 'An unknown error occurred.',
          })
        },
      },
    )
  }

  const handleDelete = () => {
    if (!labelSet) return

    Prompt.prompt({
      title: 'Delete label set?',
      description: `This will permanently remove "${labelSet.name}".`,
      variant: 'danger',
      onConfirmText: 'Delete',
      onConfirm: async () => {
        try {
          await deleteLabelSetMutation.mutateAsync(labelSet.id)
          toast.success('Label set deleted.')
          onDeleted?.(labelSet.id)
          onClose()
        } catch (err) {
          toast.error('Failed to delete label set.', {
            description:
              err instanceof Error ? err.message : 'An unknown error occurred.',
          })
        }
      },
    })
  }

  return (
    <AnimatePresence>
      {isOpen && labelSet ? (
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
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-text">
                      Label Set Details
                    </h2>
                    <p className="text-xs text-text-secondary">
                      {labelSet.name}
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
                            htmlFor="label-set-name"
                            className="mb-1 block text-xs font-medium text-text-tertiary"
                          >
                            Name
                          </Label>
                          {isEditing ? (
                            <Input
                              id="label-set-name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              maxLength={64}
                              disabled={isMutating}
                            />
                          ) : (
                            <p className="text-sm text-text">{labelSet.name}</p>
                          )}
                        </div>

                        <Divider />

                        <div>
                          <Label
                            htmlFor="label-set-description"
                            className="mb-1 block text-xs font-medium text-text-tertiary"
                          >
                            Description
                          </Label>
                          {isEditing ? (
                            <Textarea
                              id="label-set-description"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              rows={4}
                              maxLength={500}
                              disabled={isMutating}
                            />
                          ) : (
                            <p className="text-sm text-text">
                              {labelSet.description || (
                                <span className="text-text-tertiary italic">
                                  No description provided
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* Labels */}
                    <section>
                      <h3 className="mb-4 text-sm font-semibold text-text">
                        Labels ({labelSet.labels.length})
                      </h3>
                      <div className="space-y-2 rounded-2xl border border-border bg-fill/30 p-4">
                        {labelSet.labels.length === 0 ? (
                          <p className="text-sm text-text-tertiary italic">
                            No labels in this set
                          </p>
                        ) : (
                          labelSet.labels.map((label) => (
                            <div
                              key={label.id}
                              className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
                            >
                              {label.color && (
                                <div
                                  className="h-4 w-4 shrink-0 rounded-full"
                                  style={{ backgroundColor: label.color }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-text">
                                  {label.name}
                                </div>
                                {label.description && (
                                  <div className="text-xs text-text-secondary mt-0.5">
                                    {label.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
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
                              {formatDate(labelSet.createdAt)}
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
                              {formatDate(labelSet.updatedAt)}
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
                              {labelSet.createdBy || (
                                <span className="text-text-tertiary italic">
                                  Unknown
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Label Set ID */}
                    <section>
                      <h3 className="mb-4 text-sm font-semibold text-text">
                        Technical Details
                      </h3>
                      <div className="rounded-2xl border border-border bg-fill/30 p-4">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-text-tertiary">
                            Label Set ID
                          </label>
                          <p className="font-mono text-xs text-text-secondary">
                            {labelSet.id}
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </ScrollArea>

              {/* Footer Actions */}
              <div className="border-t border-border px-6 py-4">
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isMutating}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="ghost"
                          onClick={handleCancelEdit}
                          disabled={isMutating}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleApply}
                          isLoading={updateLabelSetMutation.isPending}
                          disabled={!isDirty || !isNameValid || isMutating}
                        >
                          Apply
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          onClick={onClose}
                          disabled={isMutating}
                        >
                          Close
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => setIsEditing(true)}
                          disabled={isMutating}
                        >
                          Edit Label Set
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </m.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
