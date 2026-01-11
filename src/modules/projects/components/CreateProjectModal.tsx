import { FolderKanban, Loader2, Sparkles } from 'lucide-react'
import { m } from 'motion/react'
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
import { Spring } from '~/lib/spring'

import type { CreateProjectFormData } from '../types'

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateProjectFormData) => void
  isLoading?: boolean
}

export function CreateProjectModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<{ name?: string }>({})

  const resetForm = useCallback(() => {
    setName('')
    setDescription('')
    setErrors({})
  }, [])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [onClose, resetForm])

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
      <DialogContent
        className="max-w-lg"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={Spring.presets.bouncy}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-violet-500 text-white"
            >
              <FolderKanban className="h-5 w-5" />
            </m.div>
            <div>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Set up a new project to organize your labeling work.
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
            <Label htmlFor="project-name">
              Project Name <span className="text-red">*</span>
            </Label>
            <Input
              id="project-name"
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
              aria-describedby={errors.name ? 'name-error' : undefined}
              disabled={isLoading}
            />
            {errors.name ? (
              <p id="name-error" className="text-sm text-red">
                {errors.name}
              </p>
            ) : (
              <p className="text-xs text-text-tertiary">
                Choose a descriptive name for your project.
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about? Add any relevant context..."
              rows={3}
              maxLength={500}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-tertiary">
                Optional. Describe the project goals.
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
                <p className="text-sm font-medium text-text">Getting started</p>
                <p className="mt-1 text-xs text-text-secondary">
                  After creating a project, you can add batches of images and
                  start labeling. Projects help you organize related batches
                  and track progress across your labeling work.
                </p>
              </div>
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
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <FolderKanban className="mr-2 h-4 w-4" />
                Create Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
