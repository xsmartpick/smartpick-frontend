import { Loader2, Plus } from 'lucide-react'
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
import { Spring } from '~/lib/spring'
import { UPLOAD_CONFIG } from '~/lib/upload-config'

import { useAddImagesToBatch } from '../hooks'
import { useBulkUpload } from '../hooks/useBulkUpload'
import type { UploadedImage } from '../types'
import { ImageDropzone } from './ImageDropzone'

interface AddImagesModalProps {
  open: boolean
  batchId: string
  batchName: string
  onClose: () => void
  onSuccess?: () => void
}

export function AddImagesModal({
  open,
  batchId,
  batchName,
  onClose,
  onSuccess,
}: AddImagesModalProps) {
  const { t } = useTranslation()
  const [images, setImages] = useState<UploadedImage[]>([])
  const addImagesMutation = useAddImagesToBatch()

  const { uploadFiles, isUploading, progress } = useBulkUpload({
    onProgress: (progress) => {
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

      if (failedCount === 0) {
        toast.success(
          t('batches.addImages.toast.uploadSuccess', {
            count: successCount,
          }),
        )
      } else {
        toast.warning(t('batches.addImages.toast.someFailed'), {
          description: t('batches.addImages.toast.someFailedDesc', {
            successCount,
            failedCount,
          }),
        })
      }
    },
    onError: (error) => {
      toast.error(t('batches.addImages.toast.uploadFailed'), {
        description:
          error.message || t('batches.addImages.toast.uploadFailedDesc'),
      })
    },
  })

  const resetForm = useCallback(() => {
    for (const img of images) {
      if (img.previewUrl) {
        URL.revokeObjectURL(img.previewUrl)
      }
    }
    setImages([])
  }, [images])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [onClose, resetForm])

  const handleSubmit = async () => {
    if (images.length === 0) {
      toast.error(t('batches.addImages.toast.noImages'))
      return
    }

    if (isUploading) {
      return
    }

    try {
      // Upload files first
      const uploadResults = await uploadFiles(images)

      // Get successfully uploaded file IDs
      const fileIds = uploadResults
        .filter((r) => r.status === 'uploaded')
        .map((r) => r.fileId)

      if (fileIds.length === 0) {
        toast.error(t('batches.addImages.toast.noFilesUploaded'))
        return
      }

      // Add images to batch
      await addImagesMutation.mutateAsync({
        batchId,
        request: { fileIds },
      })

      toast.success(t('batches.addImages.toast.addedSuccess'), {
        description: t('batches.addImages.toast.addedSuccessDesc', {
          count: fileIds.length,
          batchName,
        }),
      })

      handleClose()
      onSuccess?.()
    } catch (error) {
      console.error('Add images error:', error)
      toast.error(t('batches.addImages.toast.addedError'))
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
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isUploading ? 'Uploading Files...' : 'Add Images to Batch'}
          </DialogTitle>
          <DialogDescription>
            {isUploading
              ? `Uploading ${progress.completed + progress.uploading}/${progress.total} files...`
              : `Add more images to "${batchName}"`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Upload Progress */}
          {isUploading && progress.total > 0 && (
            <m.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={Spring.presets.smooth}
              className="rounded-xl border border-border bg-fill/50 p-4 mb-4"
            >
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-text">Upload Progress</span>
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
                <span>✓ {progress.completed} completed</span>
                {progress.uploading > 0 && (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {progress.uploading} uploading
                  </span>
                )}
                {progress.failed > 0 && (
                  <span className="text-red">✗ {progress.failed} failed</span>
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
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={
              images.length === 0 || isUploading || addImagesMutation.isPending
            }
          >
            {isUploading || addImagesMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? 'Uploading...' : 'Adding...'}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add {images.length} Image{images.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
