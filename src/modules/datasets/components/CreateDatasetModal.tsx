import { Plus } from 'lucide-react'
import { useCallback, useState } from 'react'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

export type MediaType = 'image' | 'video' | 'audio' | 'text'

export interface CreateDatasetFormData {
  name: string
  description: string
  mediaType: MediaType
}

export interface CreateDatasetModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateDatasetFormData) => void
}

export function CreateDatasetModal({
  open,
  onClose,
  onSubmit,
}: CreateDatasetModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [mediaType, setMediaType] = useState<MediaType | ''>('')
  const [errors, setErrors] = useState<{
    name?: string
    mediaType?: string
  }>({})

  const resetForm = useCallback(() => {
    setName('')
    setDescription('')
    setMediaType('')
    setErrors({})
  }, [])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [onClose, resetForm])

  const validate = (): boolean => {
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (name.trim().length > 64) {
      newErrors.name = 'Name must be less than 64 characters'
    }

    if (!mediaType) {
      newErrors.mediaType = 'Media type is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      mediaType: mediaType as MediaType,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
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
      <DialogContent className="max-w-lg" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Create Dataset</DialogTitle>
          <DialogDescription>
            Create a new dataset to organize your labeling tasks. You can add
            items to label later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="dataset-name">
              Name <span className="text-red">*</span>
            </Label>
            <Input
              id="dataset-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }))
                }
              }}
              placeholder="e.g. Cashew Images Dataset"
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
                Keep it short and descriptive. Max 64 characters.
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="dataset-description">Description</Label>
            <Textarea
              id="dataset-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you labeling here? Any specific instructions or context?"
              rows={4}
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-tertiary">
                Optional. Helpful for future labelers.
              </p>
              <p className="text-xs text-text-tertiary">
                {description.length}/500
              </p>
            </div>
          </div>

          {/* Media Type Field */}
          <div className="space-y-2">
            <Label htmlFor="dataset-media-type">
              Media Type <span className="text-red">*</span>
            </Label>
            <Select
              value={mediaType}
              onValueChange={(value) => {
                setMediaType(value as MediaType)
                if (errors.mediaType) {
                  setErrors((prev) => ({ ...prev, mediaType: undefined }))
                }
              }}
            >
              <SelectTrigger
                id="dataset-media-type"
                className={errors.mediaType ? 'border-red' : ''}
                aria-invalid={!!errors.mediaType}
                aria-describedby={
                  errors.mediaType ? 'media-type-error' : undefined
                }
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
            {errors.mediaType ? (
              <p id="media-type-error" className="text-sm text-red">
                {errors.mediaType}
              </p>
            ) : (
              <p className="text-xs text-text-tertiary">
                The type of media files this dataset will contain.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
