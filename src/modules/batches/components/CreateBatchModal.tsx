import { Loader2, Sparkles, Upload } from 'lucide-react'
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
import { Textarea } from '~/components/ui/input/Textarea'
import { Label } from '~/components/ui/label'
import { Spring } from '~/lib/spring'
import { UPLOAD_CONFIG } from '~/lib/upload-config'

import { useBulkUpload } from '../hooks/useBulkUpload'
import type { CreateBatchFormData, UploadedImage } from '../types'
import { ImageDropzone } from './ImageDropzone'

interface CreateBatchModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateBatchFormData) => void
}

export function CreateBatchModal({
  open,
  onClose,
  onSubmit,
}: CreateBatchModalProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState<'details' | 'upload'>('details')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])
  const [errors, setErrors] = useState<{ name?: string }>({})

  const { uploadFiles, isUploading, progress } = useBulkUpload({
    onProgress: (progress) => {
      // Update image upload statuses based on progress
      setImages((prev) =>
        prev.map((img, idx) => {
          const status: UploadedImage['uploadStatus'] =
            idx < progress.completed
              ? 'uploaded'
              : idx < progress.completed + progress.uploading
                ? 'uploading'
                : idx <
                    progress.completed + progress.uploading + progress.failed
                  ? 'failed'
                  : 'pending'
          return { ...img, uploadStatus: status }
        }),
      )
    },
    onComplete: (results) => {
      const successCount = results.filter((r) => r.status === 'uploaded').length
      const failedCount = results.filter((r) => r.status === 'failed').length
      const errors = results.filter((r) => r.error).map((r) => r.error)

      if (failedCount === 0) {
        toast.success('All files uploaded successfully!', {
          description: `${successCount} file${successCount === 1 ? '' : 's'} uploaded.`,
        })
      } else {
        const errorMessage =
          errors.length > 0
            ? `${successCount} succeeded, ${failedCount} failed. ${errors[0]}`
            : `${successCount} succeeded, ${failedCount} failed.`
        toast.warning('Some files failed to upload', {
          description: errorMessage,
        })
      }
    },
    onError: (error) => {
      toast.error('Upload failed', {
        description: error.message || 'An error occurred during upload.',
      })
    },
  })

  const resetForm = useCallback(() => {
    setStep('details')
    setName('')
    setDescription('')
    // Clean up object URLs
    for (const img of images) {
      if (img.previewUrl) {
        URL.revokeObjectURL(img.previewUrl)
      }
    }
    setImages([])
    setErrors({})
  }, [images])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [onClose, resetForm])

  const validateDetails = (): boolean => {
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = t('batches.modal.validation.nameRequired')
    } else if (name.trim().length < 2) {
      newErrors.name = t('batches.modal.validation.nameMin')
    } else if (name.trim().length > 64) {
      newErrors.name = t('batches.modal.validation.nameMax')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateDetails()) {
      setStep('upload')
    }
  }

  const handleBack = () => {
    setStep('details')
  }

  const handleSubmit = async () => {
    if (images.length === 0) {
      toast.error(t('batches.modal.errors.noImages'))
      return
    }

    if (isUploading) {
      return // Prevent multiple submissions
    }

    try {
      // Upload files first
      const uploadResults = await uploadFiles(images)

      // Update images with fileIds from upload results
      // Upload results contain the UUID fileIds that were sent to server
      const updatedImages: UploadedImage[] = images.map((img, idx) => {
        // Match by index first (order should match), then by fileId if available
        const result =
          uploadResults[idx] ||
          uploadResults.find((r) => r.fileId === img.fileId)
        const uploadStatus: UploadedImage['uploadStatus'] =
          result?.status === 'uploaded' ? 'uploaded' : 'failed'
        return {
          ...img,
          fileId: result?.fileId || img.fileId, // Use UUID from upload result
          uploadStatus,
        }
      })

      // Only proceed if at least one file uploaded successfully
      const successCount = uploadResults.filter(
        (r) => r.status === 'uploaded',
      ).length
      if (successCount === 0) {
        toast.error(t('batches.modal.errors.uploadFailed'))
        return
      }

      // Call onSubmit with updated images
      onSubmit({
        name: name.trim(),
        description: description.trim(),
        images: updatedImages,
      })
    } catch (error) {
      // Error handling is done in the hook's onError callback
      console.error('Submit error:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (step === 'details') {
        handleNext()
      } else {
        handleSubmit()
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose()
        }
      }}
    >
      <DialogContent
        className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle>
            {step === 'details'
              ? t('batches.modal.title.details')
              : isUploading
                ? t('batches.modal.title.uploading')
                : t('batches.modal.title.upload')}
          </DialogTitle>
          <DialogDescription>
            {step === 'details'
              ? t('batches.modal.description.details')
              : isUploading
                ? t('batches.modal.description.uploading', {
                    current: progress.completed + progress.uploading,
                    total: progress.total,
                  })
                : t('batches.modal.description.upload')}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 py-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                step === 'details'
                  ? 'bg-accent text-background'
                  : 'bg-accent/20 text-accent'
              }`}
            >
              1
            </div>
            <span
              className={`text-sm ${
                step === 'details'
                  ? 'font-medium text-text'
                  : 'text-text-secondary'
              }`}
            >
              {t('batches.modal.steps.details')}
            </span>
          </div>
          <div className="h-px flex-1 bg-border" />
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                step === 'upload'
                  ? 'bg-accent text-background'
                  : 'bg-fill text-text-tertiary'
              }`}
            >
              2
            </div>
            <span
              className={`text-sm ${
                step === 'upload'
                  ? 'font-medium text-text'
                  : 'text-text-tertiary'
              }`}
            >
              {t('batches.modal.steps.upload')}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {step === 'details' ? (
            <m.div
              key="details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={Spring.presets.smooth}
              className="space-y-4"
            >
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="batch-name">
                  {t('batches.modal.nameLabel')}{' '}
                  <span className="text-red">*</span>
                </Label>
                <Input
                  id="batch-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: undefined }))
                    }
                  }}
                  placeholder={t('batches.modal.namePlaceholder')}
                  maxLength={64}
                  hasError={!!errors.name}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name ? (
                  <p id="name-error" className="text-sm text-red">
                    {errors.name}
                  </p>
                ) : (
                  <p className="text-xs text-text-tertiary">
                    {t('batches.modal.nameHint')}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="batch-description">
                  {t('batches.modal.descriptionLabel')}
                </Label>
                <Textarea
                  id="batch-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('batches.modal.descriptionPlaceholder')}
                  rows={4}
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-text-tertiary">
                    {t('batches.modal.descriptionHint')}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {description.length}/500
                  </p>
                </div>
              </div>

              {/* Tips */}
              <div className="rounded-xl bg-fill/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">
                      {t('batches.modal.tips.title')}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {t('batches.modal.tips.content')}
                    </p>
                  </div>
                </div>
              </div>
            </m.div>
          ) : (
            <m.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={Spring.presets.smooth}
              className="space-y-4"
            >
              {/* Upload Progress */}
              {isUploading && progress.total > 0 && (
                <m.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={Spring.presets.smooth}
                  className="rounded-xl border border-border bg-fill/50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-text">
                      {t('batches.modal.upload.progress')}
                    </span>
                    <span className="text-text-secondary">
                      {progress.completed + progress.uploading}/{progress.total}
                    </span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-fill">
                    <m.div
                      className="h-full bg-accent"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          ((progress.completed + progress.uploading) /
                            progress.total) *
                          100
                        }%`,
                      }}
                      transition={Spring.presets.smooth}
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-text-secondary">
                    <span>
                      ✓{' '}
                      {t('batches.modal.upload.completed', {
                        count: progress.completed,
                      })}
                    </span>
                    {progress.uploading > 0 && (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {t('batches.modal.upload.uploading', {
                          count: progress.uploading,
                        })}
                      </span>
                    )}
                    {progress.failed > 0 && (
                      <span className="text-red">
                        ✗{' '}
                        {t('batches.modal.upload.failed', {
                          count: progress.failed,
                        })}
                      </span>
                    )}
                  </div>
                </m.div>
              )}

              <ImageDropzone
                images={images}
                onImagesChange={setImages}
                maxFiles={UPLOAD_CONFIG.MAX_FILES_PER_BATCH}
                maxSizeMB={UPLOAD_CONFIG.MAX_FILE_SIZE_MB}
                disabled={isUploading}
              />
            </m.div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step === 'details' ? (
            <>
              <Button variant="ghost" onClick={handleClose}>
                {t('batches.modal.buttons.cancel')}
              </Button>
              <Button onClick={handleNext} variant="primary">
                {t('batches.modal.buttons.continue')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleBack}>
                {t('batches.modal.buttons.back')}
              </Button>
              <Button
                onClick={handleSubmit}
                variant="primary"
                disabled={images.length === 0 || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('batches.modal.buttons.uploading')}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {t('batches.modal.buttons.uploadCreate', {
                      count: images.length,
                    })}
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
