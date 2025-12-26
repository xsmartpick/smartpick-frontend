import { FolderPlus, Sparkles } from 'lucide-react'
import { m } from 'motion/react'
import { useCallback, useState } from 'react'
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
  const [step, setStep] = useState<'details' | 'upload'>('details')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<UploadedImage[]>([])
  const [errors, setErrors] = useState<{ name?: string }>({})

  const resetForm = useCallback(() => {
    setStep('details')
    setName('')
    setDescription('')
    // Clean up object URLs
    for (const img of images) {
      URL.revokeObjectURL(img.previewUrl)
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
      newErrors.name = 'Batch name is required'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (name.trim().length > 64) {
      newErrors.name = 'Name must be less than 64 characters'
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

  const handleSubmit = () => {
    if (images.length === 0) {
      toast.error('Please add at least one image')
      return
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      images,
    })
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
            {step === 'details' ? 'Create New Batch' : 'Upload Images'}
          </DialogTitle>
          <DialogDescription>
            {step === 'details'
              ? 'Give your batch a name and optional description. You can add images in the next step.'
              : 'Add images to your batch. You can drag and drop or click to browse.'}
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
              Details
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
              Upload
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
                  Batch Name <span className="text-red">*</span>
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
                  placeholder="e.g. Product Photos - January 2024"
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
                    A descriptive name helps you identify this batch later.
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="batch-description">Description</Label>
                <Textarea
                  id="batch-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's in this batch? Any special notes or context?"
                  rows={4}
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-text-tertiary">
                    Optional. Add context about these images.
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
                    <p className="text-sm font-medium text-text">Pro tip</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      Use descriptive names like "Product A - Side Views" or
                      "Quality Inspection - Batch 42" to easily find and manage
                      your batches later.
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
            >
              <ImageDropzone
                images={images}
                onImagesChange={setImages}
                maxFiles={50}
                maxSizeMB={10}
              />
            </m.div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step === 'details' ? (
            <>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleNext} variant="primary">
                Continue to Upload
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                variant="primary"
                disabled={images.length === 0}
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                Create Batch ({images.length}{' '}
                {images.length === 1 ? 'image' : 'images'})
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
