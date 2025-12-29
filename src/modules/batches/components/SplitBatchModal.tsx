import {
  CheckCircle2,
  Loader2,
  Plus,
  Scissors,
  Trash2,
  XCircle,
} from 'lucide-react'
import { m } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
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
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'

import type { Batch } from '../types'

interface SplitBatchModalProps {
  open: boolean
  batch: Batch
  onClose: () => void
  onSubmit: (tasks: TaskSplit[]) => Promise<void>
}

type SplitMode = 'equal' | 'custom'

interface TaskSplit {
  taskNumber: number
  imageCount: number
  startIndex: number
  endIndex: number
  imageIds: string[]
}

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function SplitBatchModal({
  open,
  batch,
  onClose,
  onSubmit,
}: SplitBatchModalProps) {
  const [mode, setMode] = useState<SplitMode>('equal')
  const [taskCount, setTaskCount] = useState<number>(1)
  const [customTasks, setCustomTasks] = useState<
    Array<{ id: string; imageCount: number }>
  >([{ id: '1', imageCount: 0 }])
  const [isCreating, setIsCreating] = useState(false)

  const totalImages = batch.imageCount
  const images = batch.images || []

  // Generate tasks based on current configuration
  const generatedTasks = useMemo(() => {
    if (mode === 'equal') {
      return generateEqualSplitTasks(images, taskCount)
    } else {
      return generateCustomSplitTasks(images, customTasks)
    }
  }, [mode, images, taskCount, customTasks])

  // Validate split configuration
  const validation = useMemo<ValidationResult>(() => {
    return validateSplit(
      mode,
      taskCount,
      customTasks,
      totalImages,
      generatedTasks,
    )
  }, [mode, taskCount, customTasks, totalImages, generatedTasks])

  const handleAddCustomTask = useCallback(() => {
    setCustomTasks((prev) => [
      ...prev,
      { id: Date.now().toString(), imageCount: 0 },
    ])
  }, [])

  const handleRemoveCustomTask = useCallback((id: string) => {
    setCustomTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  const handleCustomTaskChange = useCallback(
    (id: string, imageCount: number) => {
      setCustomTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? { ...task, imageCount: Math.max(0, imageCount) }
            : task,
        ),
      )
    },
    [],
  )

  const handleSubmit = useCallback(async () => {
    if (!validation.isValid) {
      toast.error('Please fix validation errors before creating tasks')
      return
    }

    setIsCreating(true)
    try {
      await onSubmit(generatedTasks)
      toast.success('Tasks created successfully!', {
        description: `Created ${generatedTasks.length} task${generatedTasks.length === 1 ? '' : 's'} from batch "${batch.name}"`,
      })
      onClose()
      // Reset form
      setMode('equal')
      setTaskCount(1)
      setCustomTasks([{ id: '1', imageCount: 0 }])
    } catch (error) {
      console.error('Failed to create tasks:', error)
      toast.error('Failed to create tasks', {
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred while creating tasks.',
      })
    } finally {
      setIsCreating(false)
    }
  }, [validation.isValid, generatedTasks, batch.name, onSubmit, onClose])

  const handleClose = useCallback(() => {
    if (!isCreating) {
      onClose()
      // Reset form
      setMode('equal')
      setTaskCount(1)
      setCustomTasks([{ id: '1', imageCount: 0 }])
    }
  }, [isCreating, onClose])

  // Calculate total allocated images
  const totalAllocated = useMemo(() => {
    return generatedTasks.reduce((sum, task) => sum + task.imageCount, 0)
  }, [generatedTasks])

  const remainingImages = totalImages - totalAllocated

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-accent" />
            Split Batch into Tasks
          </DialogTitle>
          <DialogDescription>
            Split "{batch.name}" ({totalImages} image
            {totalImages === 1 ? '' : 's'}) into multiple labeling tasks
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Batch Summary Card */}
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={Spring.presets.smooth}
            className="rounded-xl border border-border bg-gradient-to-br from-fill/50 to-transparent p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">Batch Summary</p>
                <p className="mt-1 text-xs text-text-secondary">
                  {totalImages} total image{totalImages === 1 ? '' : 's'}{' '}
                  available for splitting
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-text">{totalImages}</p>
                <p className="text-xs text-text-secondary">Images</p>
              </div>
            </div>
          </m.div>

          {/* Split Mode Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-text">
              Split Method
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('equal')}
                className={cn(
                  'rounded-xl border-2 p-4 text-left transition-all',
                  mode === 'equal'
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-background hover:border-accent/30',
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full border-2 transition-colors',
                      mode === 'equal'
                        ? 'border-accent bg-accent'
                        : 'border-border',
                    )}
                  >
                    {mode === 'equal' && (
                      <div className="h-full w-full rounded-full bg-accent" />
                    )}
                  </div>
                  <span className="font-medium text-text">Equal Split</span>
                </div>
                <p className="mt-2 text-xs text-text-secondary">
                  Divide images equally across tasks
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('custom')}
                className={cn(
                  'rounded-xl border-2 p-4 text-left transition-all',
                  mode === 'custom'
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-background hover:border-accent/30',
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full border-2 transition-colors',
                      mode === 'custom'
                        ? 'border-accent bg-accent'
                        : 'border-border',
                    )}
                  >
                    {mode === 'custom' && (
                      <div className="h-full w-full rounded-full bg-accent" />
                    )}
                  </div>
                  <span className="font-medium text-text">Custom Split</span>
                </div>
                <p className="mt-2 text-xs text-text-secondary">
                  Set custom image count per task
                </p>
              </button>
            </div>
          </div>

          {/* Configuration Section */}
          <m.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'equal' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={Spring.presets.smooth}
            className="space-y-4"
          >
            {mode === 'equal' ? (
              <div className="space-y-2">
                <Label htmlFor="task-count">
                  Number of Tasks <span className="text-red">*</span>
                </Label>
                <Input
                  id="task-count"
                  type="number"
                  min={1}
                  max={totalImages}
                  value={taskCount}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value, 10)
                    if (!Number.isNaN(value) && value > 0) {
                      setTaskCount(Math.min(value, totalImages))
                    }
                  }}
                  className="w-full"
                  enableStepper
                />
                {taskCount > 0 && (
                  <p className="text-xs text-text-secondary">
                    Each task will have approximately{' '}
                    <span className="font-medium text-text">
                      {Math.floor(totalImages / taskCount)}
                    </span>{' '}
                    images
                    {totalImages % taskCount !== 0 && (
                      <span className="text-amber">
                        {' '}
                        (with {totalImages % taskCount} remainder image
                        {totalImages % taskCount === 1 ? '' : 's'} in the last
                        task)
                      </span>
                    )}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-text">
                    Custom Task Configuration
                  </Label>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddCustomTask}
                    className="h-8"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Task
                  </Button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {customTasks.map((task, index) => (
                    <m.div
                      key={task.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={Spring.presets.smooth}
                      className="flex items-center gap-2 rounded-lg border border-border bg-background p-3"
                    >
                      <span className="text-sm font-medium text-text-secondary w-8">
                        #{index + 1}
                      </span>
                      <div className="flex-1">
                        <Input
                          type="number"
                          min={0}
                          max={totalImages}
                          value={task.imageCount}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value, 10)
                            if (!Number.isNaN(value)) {
                              handleCustomTaskChange(task.id, value)
                            }
                          }}
                          placeholder="Images per task"
                          className="w-full"
                          enableStepper
                        />
                      </div>
                      {customTasks.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCustomTask(task.id)}
                          className="h-8 w-8 p-0 text-text-tertiary hover:text-red"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </m.div>
                  ))}
                </div>

                <div className="rounded-lg border border-border bg-fill/50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">
                      Total Allocated:
                    </span>
                    <span
                      className={cn(
                        'font-medium',
                        totalAllocated === totalImages
                          ? 'text-green'
                          : totalAllocated > totalImages
                            ? 'text-red'
                            : 'text-text',
                      )}
                    >
                      {totalAllocated} / {totalImages}
                    </span>
                  </div>
                  {remainingImages !== 0 && (
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-text-tertiary">Remaining:</span>
                      <span
                        className={cn(
                          remainingImages > 0 ? 'text-amber' : 'text-red',
                        )}
                      >
                        {remainingImages > 0 ? '+' : ''}
                        {remainingImages} image
                        {Math.abs(remainingImages) === 1 ? '' : 's'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </m.div>

          {/* Validation Messages */}
          {validation.errors.length > 0 && (
            <m.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-red/20 bg-red/10 p-3"
            >
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 shrink-0 text-red mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-red">
                    Validation Errors
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-red/80">
                    {validation.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </m.div>
          )}

          {validation.warnings.length > 0 && validation.errors.length === 0 && (
            <m.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-amber/20 bg-amber/10 p-3"
            >
              <div className="flex items-start gap-2">
                <div className="h-4 w-4 shrink-0 rounded-full bg-amber mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-amber">Warnings</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-amber/80">
                    {validation.warnings.map((warning, idx) => (
                      <li key={idx}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </m.div>
          )}

          {/* Preview Table */}
          {generatedTasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-text">
                  Preview ({generatedTasks.length} task
                  {generatedTasks.length === 1 ? '' : 's'})
                </Label>
                {validation.isValid && totalAllocated === totalImages && (
                  <div className="flex items-center gap-1.5 text-xs text-green">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>All images allocated</span>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border bg-background overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-fill/50 backdrop-blur-sm border-b border-border">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-text-secondary">
                          Task
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-text-secondary">
                          Images
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-text-secondary">
                          Range
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-text-secondary">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedTasks.map((task, index) => (
                        <m.tr
                          key={task.taskNumber}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            ...Spring.presets.smooth,
                            delay: index * 0.02,
                          }}
                          className="border-b border-border last:border-0 hover:bg-fill/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-text">
                            Task #{task.taskNumber}
                          </td>
                          <td className="px-4 py-3 text-sm text-text">
                            {task.imageCount}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-secondary">
                            {task.imageCount > 0
                              ? `Images ${task.startIndex + 1}-${task.endIndex + 1}`
                              : 'No images'}
                          </td>
                          <td className="px-4 py-3">
                            {task.imageCount > 0 ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-2 py-0.5 text-xs font-medium text-green">
                                <CheckCircle2 className="h-3 w-3" />
                                Ready
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-fill px-2 py-0.5 text-xs font-medium text-text-tertiary">
                                Empty
                              </span>
                            )}
                          </td>
                        </m.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!validation.isValid || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Tasks...
              </>
            ) : (
              <>
                <Scissors className="mr-2 h-4 w-4" />
                Create {generatedTasks.length} Task
                {generatedTasks.length === 1 ? '' : 's'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper Functions

function generateEqualSplitTasks(
  images: Batch['images'],
  taskCount: number,
): TaskSplit[] {
  if (!images || images.length === 0 || taskCount <= 0) {
    return []
  }

  const tasks: TaskSplit[] = []
  const imagesPerTask = Math.floor(images.length / taskCount)
  const remainder = images.length % taskCount

  let currentIndex = 0

  for (let i = 0; i < taskCount; i++) {
    // Add one extra image to the first 'remainder' tasks
    const taskImageCount = i < remainder ? imagesPerTask + 1 : imagesPerTask

    const taskImages = images.slice(currentIndex, currentIndex + taskImageCount)
    const imageIds = taskImages.map((img) => img.id)

    tasks.push({
      taskNumber: i + 1,
      imageCount: taskImageCount,
      startIndex: currentIndex,
      endIndex: currentIndex + taskImageCount - 1,
      imageIds,
    })

    currentIndex += taskImageCount
  }

  return tasks
}

function generateCustomSplitTasks(
  images: Batch['images'],
  customTasks: Array<{ id: string; imageCount: number }>,
): TaskSplit[] {
  if (!images || images.length === 0) {
    return []
  }

  const tasks: TaskSplit[] = []
  let currentIndex = 0

  customTasks.forEach((customTask, index) => {
    const imageCount = Math.min(
      customTask.imageCount,
      images.length - currentIndex,
    )
    const taskImages = images.slice(currentIndex, currentIndex + imageCount)
    const imageIds = taskImages.map((img) => img.id)

    tasks.push({
      taskNumber: index + 1,
      imageCount,
      startIndex: currentIndex,
      endIndex: currentIndex + imageCount - 1,
      imageIds,
    })

    currentIndex += imageCount
  })

  return tasks
}

function validateSplit(
  mode: SplitMode,
  taskCount: number,
  customTasks: Array<{ id: string; imageCount: number }>,
  totalImages: number,
  generatedTasks: TaskSplit[],
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (mode === 'equal') {
    if (taskCount <= 0) {
      errors.push('Number of tasks must be greater than 0')
    }
    if (taskCount > totalImages) {
      errors.push(
        `Cannot create more tasks (${taskCount}) than available images (${totalImages})`,
      )
    }
  } else {
    // Custom mode validation
    const totalAllocated = customTasks.reduce(
      (sum, task) => sum + task.imageCount,
      0,
    )

    if (customTasks.length === 0) {
      errors.push('At least one task is required')
    }

    if (customTasks.some((task) => task.imageCount < 0)) {
      errors.push('Image count cannot be negative')
    }

    if (totalAllocated === 0) {
      errors.push('At least one task must have images allocated')
    }

    if (totalAllocated > totalImages) {
      errors.push(
        `Total allocated images (${totalAllocated}) exceeds available images (${totalImages})`,
      )
    }

    if (totalAllocated < totalImages) {
      warnings.push(
        `${totalImages - totalAllocated} image${totalImages - totalAllocated === 1 ? '' : 's'} will not be assigned to any task`,
      )
    }

    // Check for empty tasks
    const emptyTasks = customTasks.filter(
      (task) => task.imageCount === 0,
    ).length
    if (emptyTasks > 0) {
      warnings.push(
        `${emptyTasks} empty task${emptyTasks === 1 ? '' : 's'} will be created`,
      )
    }
  }

  // Check generated tasks
  const totalInTasks = generatedTasks.reduce(
    (sum, task) => sum + task.imageCount,
    0,
  )
  if (totalInTasks > totalImages) {
    errors.push('Generated tasks exceed available images')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
