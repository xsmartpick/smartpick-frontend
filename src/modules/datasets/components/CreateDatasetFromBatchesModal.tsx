import { Database, Loader2 } from 'lucide-react'
import { m } from 'motion/react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Spring } from '~/lib/spring'
import type { Batch } from '~/modules/batches/types'

import { useCreateDatasetFromBatches } from '../hooks'

interface CreateDatasetFromBatchesModalProps {
  open: boolean
  batches: Batch[]
  onClose: () => void
  onSuccess?: (datasetId: string) => void
}

export function CreateDatasetFromBatchesModal({
  open,
  batches,
  onClose,
  onSuccess,
}: CreateDatasetFromBatchesModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const createDatasetMutation = useCreateDatasetFromBatches()

  const totalImages = batches.reduce((sum, b) => sum + b.imageCount, 0)

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      toast.error(
        t('datasets.create.validation.nameRequired', {
          defaultValue: 'Dataset name is required',
        }),
      )
      return
    }

    try {
      const dataset = await createDatasetMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        batchIds: batches.map((b) => b.id),
      })

      toast.success(
        t('datasets.create.success', {
          defaultValue: 'Dataset created successfully',
        }),
        {
          description: t('datasets.create.successDesc', {
            name: dataset.name,
            count: batches.length,
            defaultValue: `${dataset.name} created with ${batches.length} batch(es)`,
          }),
        },
      )

      onClose()
      setName('')
      setDescription('')
      onSuccess?.(dataset.id)
    } catch (error) {
      console.error('Failed to create dataset:', error)
      toast.error(
        t('datasets.create.error', {
          defaultValue: 'Failed to create dataset',
        }),
        {
          description: error instanceof Error ? error.message : undefined,
        },
      )
    }
  }, [name, description, batches, createDatasetMutation, onClose, onSuccess, t])

  const handleClose = useCallback(() => {
    if (!createDatasetMutation.isPending) {
      onClose()
      setName('')
      setDescription('')
    }
  }, [createDatasetMutation.isPending, onClose])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-accent" />
            {t('datasets.create.title', { defaultValue: 'Create Dataset' })}
          </DialogTitle>
          <DialogDescription>
            {t('datasets.create.description', {
              count: batches.length,
              defaultValue: `Create a new dataset from ${batches.length} selected batch(es)`,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Summary Card */}
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={Spring.presets.smooth}
            className="rounded-xl border border-border bg-gradient-to-br from-fill/50 to-transparent p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">
                  {t('datasets.create.summary.title', {
                    defaultValue: 'Selected Batches',
                  })}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {t('datasets.create.summary.description', {
                    batches: batches.length,
                    images: totalImages,
                    defaultValue: `${batches.length} batch(es) with ${totalImages} images`,
                  })}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-text">
                    {batches.length}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {t('datasets.create.summary.batches', {
                      defaultValue: 'Batches',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">
                    {totalImages}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {t('datasets.create.summary.images', {
                      defaultValue: 'Images',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </m.div>

          {/* Batch List */}
          <div className="max-h-32 overflow-y-auto rounded-lg border border-border bg-fill/30 p-2">
            <div className="space-y-1">
              {batches.map((batch) => (
                <div
                  key={batch.id}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
                >
                  <span className="font-medium text-text">{batch.name}</span>
                  <span className="text-text-secondary">
                    {batch.imageCount} images
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="dataset-name">
                {t('datasets.create.form.name', {
                  defaultValue: 'Dataset Name',
                })}{' '}
                <span className="text-red">*</span>
              </Label>
              <Input
                id="dataset-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('datasets.create.form.namePlaceholder', {
                  defaultValue: 'e.g., Cashew Classification Dataset v1',
                })}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataset-description">
                {t('datasets.create.form.description', {
                  defaultValue: 'Description',
                })}
              </Label>
              <Input
                id="dataset-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('datasets.create.form.descriptionPlaceholder', {
                  defaultValue: 'Optional description for the dataset',
                })}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={createDatasetMutation.isPending}
          >
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!name.trim() || createDatasetMutation.isPending}
          >
            {createDatasetMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('datasets.create.creating', { defaultValue: 'Creating...' })}
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                {t('datasets.create.submit', {
                  defaultValue: 'Create Dataset',
                })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
