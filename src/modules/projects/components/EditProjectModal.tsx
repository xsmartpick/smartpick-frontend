import { Edit3, Loader2 } from 'lucide-react'
import { m } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'

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

import type { Project } from '../types'

interface EditProjectModalProps {
  open: boolean
  project: Project
  onClose: () => void
  onSubmit: (data: { name: string; description?: string }) => void
  isLoading?: boolean
}

export function EditProjectModal({
  open,
  project,
  onClose,
  onSubmit,
  isLoading = false,
}: EditProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<{ name?: string }>({})

  // Reset form when project changes or modal opens
  useEffect(() => {
    if (open && project) {
      setName(project.name)
      setDescription(project.description || '')
      setErrors({})
    }
  }, [open, project])

  const handleClose = useCallback(() => {
    setErrors({})
    onClose()
  }, [onClose])

  const validate = (): boolean => {
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = 'Project name is required'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (name.trim().length > 64) {
      newErrors.name = 'Name must be less than 64 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const hasChanges =
    name.trim() !== project.name ||
    description.trim() !== (project.description || '')

  const handleSubmit = () => {
    if (isLoading) return

    if (validate()) {
      onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
      })
    }
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
          <div className="flex items-center gap-3">
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={Spring.presets.bouncy}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-fill text-text"
            >
              <Edit3 className="h-5 w-5" />
            </m.div>
            <div>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update your project details.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={Spring.presets.smooth}
          className="space-y-4 py-4"
        >
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-project-name">
              Project Name <span className="text-red">*</span>
            </Label>
            <Input
              id="edit-project-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }))
                }
              }}
              placeholder="e.g. Product Classification 2024"
              maxLength={64}
              hasError={!!errors.name}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'edit-name-error' : undefined}
              disabled={isLoading}
            />
            {errors.name && (
              <p id="edit-name-error" className="text-sm text-red">
                {errors.name}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="edit-project-description">Description</Label>
            <Textarea
              id="edit-project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={4}
              maxLength={500}
              disabled={isLoading}
            />
            <div className="flex items-center justify-end">
              <p className="text-xs text-text-tertiary">
                {description.length}/500
              </p>
            </div>
          </div>
        </m.div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            disabled={isLoading || !hasChanges}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
