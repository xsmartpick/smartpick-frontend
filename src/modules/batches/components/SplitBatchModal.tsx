import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  Scissors,
  Trash2,
  XCircle,
} from 'lucide-react'
import { m } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
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
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'
import { useBatchSegments } from '~/modules/segmentation/hooks'
import type { ImageSegment } from '~/modules/segmentation/types'

import type { Batch } from '../types'

interface SplitBatchModalProps {
  open: boolean
  batch: Batch
  onClose: () => void
  onSubmit: (tasks: TaskSplit[]) => Promise<void>
}

type SplitMode = 'equal' | 'custom'
type SplitBy = 'images' | 'segments'

interface TaskSplit {
  taskNumber: number
  imageCount: number
  segmentCount: number
  startIndex: number
  endIndex: number
  imageIds: string[]
  segmentIds: string[]
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
  const { t } = useTranslation()
  const [mode, setMode] = useState<SplitMode>('equal')
  // Default to 'images' since segments may not be available
  const [splitBy, setSplitBy] = useState<SplitBy>('images')
  const [taskCount, setTaskCount] = useState<number>(1)
  const [customTasks, setCustomTasks] = useState<
    Array<{ id: string; count: number }>
  >([{ id: '1', count: 0 }])
  const [isCreating, setIsCreating] = useState(false)

  // Fetch segments for the batch to enable split by segments
  // Use a high limit to get all approved segments (max 1000 per API)
  const {
    data: segmentsData,
    isLoading: isLoadingSegments,
    error: segmentsError,
  } = useBatchSegments(open ? batch.id : undefined, {
    status: 'approved',
    limit: 1000, // Fetch all approved segments, not default 50
  })

  const segments = segmentsData?.segments || []
  // Track if segments failed to load (e.g., 500 error from backend)
  const segmentsLoadFailed = !!segmentsError
  const totalImages = batch.imageCount
  const totalSegments = segments.length
  const images = batch.images || []

  // Total items depends on split mode
  const totalItems = splitBy === 'segments' ? totalSegments : totalImages

  // Generate tasks based on current configuration
  const generatedTasks = useMemo(() => {
    if (mode === 'equal') {
      return generateEqualSplitTasks(images, segments, taskCount, splitBy)
    } else {
      return generateCustomSplitTasks(images, segments, customTasks, splitBy)
    }
  }, [mode, images, segments, taskCount, customTasks, splitBy])

  // Validate split configuration
  const validation = useMemo<ValidationResult>(() => {
    return validateSplit(
      mode,
      taskCount,
      customTasks,
      totalItems,
      generatedTasks,
      splitBy,
    )
  }, [mode, taskCount, customTasks, totalItems, generatedTasks, splitBy])

  const handleAddCustomTask = useCallback(() => {
    setCustomTasks((prev) => [...prev, { id: Date.now().toString(), count: 0 }])
  }, [])

  const handleRemoveCustomTask = useCallback((id: string) => {
    setCustomTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  const handleCustomTaskChange = useCallback((id: string, count: number) => {
    setCustomTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, count: Math.max(0, count) } : task,
      ),
    )
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!validation.isValid) {
      toast.error(t('batches.split.toast.validationError'))
      return
    }

    setIsCreating(true)
    try {
      await onSubmit(generatedTasks)
      toast.success(t('batches.split.toast.success'), {
        description: t('batches.split.toast.successDesc', {
          count: generatedTasks.length,
          name: batch.name,
        }),
      })
      onClose()
      // Reset form - default to 'images' since segments may not be available
      setMode('equal')
      setSplitBy('images')
      setTaskCount(1)
      setCustomTasks([{ id: '1', count: 0 }])
    } catch (error) {
      console.error('Failed to create tasks:', error)
      toast.error(t('batches.split.toast.error'), {
        description:
          error instanceof Error
            ? error.message
            : t('batches.split.toast.errorDesc'),
      })
    } finally {
      setIsCreating(false)
    }
  }, [validation.isValid, generatedTasks, batch.name, onSubmit, onClose, t])

  const handleClose = useCallback(() => {
    if (!isCreating) {
      onClose()
      // Reset form - default to 'images' since segments may not be available
      setMode('equal')
      setSplitBy('images')
      setTaskCount(1)
      setCustomTasks([{ id: '1', count: 0 }])
    }
  }, [isCreating, onClose])

  // Calculate total allocated items (images or segments)
  const totalAllocated = useMemo(() => {
    if (splitBy === 'segments') {
      return generatedTasks.reduce((sum, task) => sum + task.segmentCount, 0)
    }
    return generatedTasks.reduce((sum, task) => sum + task.imageCount, 0)
  }, [generatedTasks, splitBy])

  const remainingItems = totalItems - totalAllocated

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="!grid-rows-[auto_1fr_auto] max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-accent" />
            {t('batches.split.title')}
          </DialogTitle>
          <DialogDescription>
            {t('batches.split.description', {
              name: batch.name,
              count: totalImages,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto space-y-6">
          {/* Batch Summary Card */}
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={Spring.presets.smooth}
            className="rounded-xl border border-border bg-gradient-to-br from-fill/50 to-transparent p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">
                  {t('batches.split.summary.title')}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {t('batches.split.summary.description', {
                    count: totalImages,
                  })}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-text">{totalImages}</p>
                  <p className="text-xs text-text-secondary">
                    {t('batches.split.summary.images')}
                  </p>
                </div>
                <div className="text-right">
                  {isLoadingSegments ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin text-accent" />
                      <p className="text-xs text-text-secondary">
                        {t('batches.split.summary.loading', {
                          defaultValue: 'Loading...',
                        })}
                      </p>
                    </>
                  ) : segmentsLoadFailed ? (
                    <>
                      <AlertTriangle className="h-6 w-6 text-amber" />
                      <p className="text-xs text-text-secondary">
                        {t('batches.split.summary.error', {
                          defaultValue: 'Error',
                        })}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-accent">
                        {totalSegments}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {t('batches.split.summary.segments', {
                          defaultValue: 'Segments',
                        })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </m.div>

          {/* Segments Loading State */}
          {isLoadingSegments && (
            <m.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={Spring.presets.smooth}
              className="rounded-xl border border-border bg-fill/50 p-4"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                <p className="text-sm text-text-secondary">
                  {t('batches.split.loadingSegments', {
                    defaultValue: 'Loading segments...',
                  })}
                </p>
              </div>
            </m.div>
          )}

          {/* Segments Load Error */}
          {segmentsLoadFailed && (
            <m.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={Spring.presets.smooth}
              className="rounded-xl border border-amber/20 bg-amber/10 p-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber" />
                <div>
                  <p className="text-sm font-medium text-amber">
                    {t('batches.split.segmentsLoadError', {
                      defaultValue: 'Failed to load segments',
                    })}
                  </p>
                  <p className="mt-1 text-xs text-amber/80">
                    {t('batches.split.segmentsLoadErrorDesc', {
                      defaultValue:
                        'You can still split by images. Run auto-segmentation first if you want to split by segments.',
                    })}
                  </p>
                </div>
              </div>
            </m.div>
          )}

          {/* Split By Selector */}
          {totalSegments > 0 && !segmentsLoadFailed && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-text">
                {t('batches.split.splitBy.label', { defaultValue: 'Split By' })}
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSplitBy('segments')}
                  className={cn(
                    'rounded-xl border-2 p-3 text-left transition-all',
                    splitBy === 'segments'
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-background hover:border-accent/30',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full border-2 transition-colors',
                        splitBy === 'segments'
                          ? 'border-accent bg-accent'
                          : 'border-border',
                      )}
                    />
                    <span className="font-medium text-text">
                      {t('batches.split.splitBy.segments', {
                        defaultValue: 'Segments',
                      })}
                    </span>
                    <span className="text-sm text-text-tertiary">
                      ({totalSegments})
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {t('batches.split.splitBy.segmentsDesc', {
                      defaultValue:
                        'Split tasks by individual segmented objects',
                    })}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSplitBy('images')}
                  className={cn(
                    'rounded-xl border-2 p-3 text-left transition-all',
                    splitBy === 'images'
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-background hover:border-accent/30',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'h-4 w-4 rounded-full border-2 transition-colors',
                        splitBy === 'images'
                          ? 'border-accent bg-accent'
                          : 'border-border',
                      )}
                    />
                    <span className="font-medium text-text">
                      {t('batches.split.splitBy.images', {
                        defaultValue: 'Images',
                      })}
                    </span>
                    <span className="text-sm text-text-tertiary">
                      ({totalImages})
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary">
                    {t('batches.split.splitBy.imagesDesc', {
                      defaultValue: 'Split tasks by original images',
                    })}
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Split Mode Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-text">
              {t('batches.split.method.label')}
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
                  <span className="font-medium text-text">
                    {t('batches.split.method.equal.title')}
                  </span>
                </div>
                <p className="mt-2 text-xs text-text-secondary">
                  {t('batches.split.method.equal.description')}
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
                  <span className="font-medium text-text">
                    {t('batches.split.method.custom.title')}
                  </span>
                </div>
                <p className="mt-2 text-xs text-text-secondary">
                  {t('batches.split.method.custom.description')}
                </p>
              </button>
            </div>
          </div>

          {/* Configuration Section */}
          <m.div
            key={`${mode}-${splitBy}`}
            initial={{ opacity: 0, x: mode === 'equal' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={Spring.presets.smooth}
            className="space-y-4"
          >
            {mode === 'equal' ? (
              <div className="space-y-2">
                <Label htmlFor="task-count">
                  {t('batches.split.equal.taskCount')}{' '}
                  <span className="text-red">*</span>
                </Label>
                <Input
                  id="task-count"
                  type="number"
                  min={1}
                  max={totalItems}
                  value={taskCount}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value, 10)
                    if (!Number.isNaN(value) && value > 0) {
                      setTaskCount(Math.min(value, totalItems))
                    }
                  }}
                  className="w-full"
                  enableStepper
                />
                {taskCount > 0 && totalItems > 0 && (
                  <p className="text-xs text-text-secondary">
                    {totalItems % taskCount > 0
                      ? t('batches.split.equal.hintWithRemainderGeneric', {
                          count: Math.floor(totalItems / taskCount),
                          remainder: totalItems % taskCount,
                          unit: splitBy === 'segments' ? 'segments' : 'images',
                          defaultValue: `~${Math.floor(totalItems / taskCount)} ${splitBy === 'segments' ? 'segments' : 'images'} per task (${totalItems % taskCount} extra distributed)`,
                        })
                      : t('batches.split.equal.hintGeneric', {
                          count: Math.floor(totalItems / taskCount),
                          unit: splitBy === 'segments' ? 'segments' : 'images',
                          defaultValue: `${Math.floor(totalItems / taskCount)} ${splitBy === 'segments' ? 'segments' : 'images'} per task`,
                        })}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-text">
                    {t('batches.split.custom.label')}
                  </Label>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAddCustomTask}
                    className="h-8"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    {t('batches.split.custom.addTask')}
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
                          max={totalItems}
                          value={task.count}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value, 10)
                            if (!Number.isNaN(value)) {
                              handleCustomTaskChange(task.id, value)
                            }
                          }}
                          placeholder={t(
                            'batches.split.custom.placeholderGeneric',
                            {
                              unit:
                                splitBy === 'segments' ? 'segments' : 'images',
                              defaultValue: `Number of ${splitBy === 'segments' ? 'segments' : 'images'}`,
                            },
                          )}
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
                      {t('batches.split.custom.totalAllocated')}
                    </span>
                    <span
                      className={cn(
                        'font-medium',
                        totalAllocated === totalItems
                          ? 'text-green'
                          : totalAllocated > totalItems
                            ? 'text-red'
                            : 'text-text',
                      )}
                    >
                      {totalAllocated} / {totalItems}{' '}
                      {splitBy === 'segments' ? 'segments' : 'images'}
                    </span>
                  </div>
                  {remainingItems !== 0 && (
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-text-tertiary">
                        {t('batches.split.custom.remaining')}
                      </span>
                      <span
                        className={cn(
                          remainingItems > 0 ? 'text-amber' : 'text-red',
                        )}
                      >
                        {remainingItems > 0 ? '+' : ''}
                        {Math.abs(remainingItems)}{' '}
                        {splitBy === 'segments' ? 'segments' : 'images'}
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
                    {t('batches.split.validation.errors')}
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
                  <p className="text-sm font-medium text-amber">
                    {t('batches.split.validation.warnings')}
                  </p>
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
                  {t('batches.split.preview.title', {
                    count: generatedTasks.length,
                  })}
                </Label>
                {validation.isValid && totalAllocated === totalItems && (
                  <div className="flex items-center gap-1.5 text-xs text-green">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{t('batches.split.preview.allAllocated')}</span>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-border bg-background overflow-hidden">
                {/* Strictly limit preview table height to ensure footer buttons remain visible */}
                <div className="max-h-32 overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-fill/50 backdrop-blur-sm border-b border-border">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-text-secondary">
                          {t('batches.split.preview.table.task')}
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-text-secondary">
                          {splitBy === 'segments'
                            ? t('batches.split.preview.table.segments', {
                                defaultValue: 'Segments',
                              })
                            : t('batches.split.preview.table.images')}
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-text-secondary">
                          {t('batches.split.preview.table.range')}
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-text-secondary">
                          {t('batches.split.preview.table.status')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {generatedTasks.map((task, index) => {
                        const itemCount =
                          splitBy === 'segments'
                            ? task.segmentCount
                            : task.imageCount
                        return (
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
                              {t('batches.split.preview.table.taskNumber', {
                                number: task.taskNumber,
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm text-text">
                              {itemCount}
                            </td>
                            <td className="px-4 py-3 text-sm text-text-secondary">
                              {itemCount > 0
                                ? `#${task.startIndex + 1} - #${task.endIndex + 1}`
                                : t('batches.split.preview.table.noImages')}
                            </td>
                            <td className="px-4 py-3">
                              {itemCount > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green/10 px-2 py-0.5 text-xs font-medium text-green">
                                  <CheckCircle2 className="h-3 w-3" />
                                  {t('batches.split.preview.table.ready')}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-fill px-2 py-0.5 text-xs font-medium text-text-tertiary">
                                  {t('batches.split.preview.table.empty')}
                                </span>
                              )}
                            </td>
                          </m.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={isCreating}>
            {t('batches.split.buttons.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!validation.isValid || isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('batches.split.buttons.creating')}
              </>
            ) : (
              <>
                <Scissors className="mr-2 h-4 w-4" />
                {t('batches.split.buttons.create', {
                  count: generatedTasks.length,
                })}
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
  segments: ImageSegment[],
  taskCount: number,
  splitBy: SplitBy,
): TaskSplit[] {
  if (taskCount <= 0) {
    return []
  }

  const items = splitBy === 'segments' ? segments : images || []
  if (items.length === 0) {
    return []
  }

  const tasks: TaskSplit[] = []
  const itemsPerTask = Math.floor(items.length / taskCount)
  const remainder = items.length % taskCount

  let currentIndex = 0

  for (let i = 0; i < taskCount; i++) {
    // Add one extra item to the first 'remainder' tasks
    const taskItemCount = i < remainder ? itemsPerTask + 1 : itemsPerTask

    if (splitBy === 'segments') {
      const taskSegments = segments.slice(
        currentIndex,
        currentIndex + taskItemCount,
      )
      const segmentIds = taskSegments.map((seg) => seg.id)
      // Get unique image IDs from segments
      const imageIds = [...new Set(taskSegments.map((seg) => seg.batchItemId))]

      tasks.push({
        taskNumber: i + 1,
        imageCount: imageIds.length,
        segmentCount: taskItemCount,
        startIndex: currentIndex,
        endIndex: currentIndex + taskItemCount - 1,
        imageIds,
        segmentIds,
      })
    } else {
      const taskImages = (images || []).slice(
        currentIndex,
        currentIndex + taskItemCount,
      )
      const imageIds = taskImages.map((img) => img.id)

      tasks.push({
        taskNumber: i + 1,
        imageCount: taskItemCount,
        segmentCount: 0,
        startIndex: currentIndex,
        endIndex: currentIndex + taskItemCount - 1,
        imageIds,
        segmentIds: [],
      })
    }

    currentIndex += taskItemCount
  }

  return tasks
}

function generateCustomSplitTasks(
  images: Batch['images'],
  segments: ImageSegment[],
  customTasks: Array<{ id: string; count: number }>,
  splitBy: SplitBy,
): TaskSplit[] {
  const items = splitBy === 'segments' ? segments : images || []
  if (items.length === 0) {
    return []
  }

  const tasks: TaskSplit[] = []
  let currentIndex = 0

  customTasks.forEach((customTask, index) => {
    const itemCount = Math.min(customTask.count, items.length - currentIndex)

    if (splitBy === 'segments') {
      const taskSegments = segments.slice(
        currentIndex,
        currentIndex + itemCount,
      )
      const segmentIds = taskSegments.map((seg) => seg.id)
      const imageIds = [...new Set(taskSegments.map((seg) => seg.batchItemId))]

      tasks.push({
        taskNumber: index + 1,
        imageCount: imageIds.length,
        segmentCount: itemCount,
        startIndex: currentIndex,
        endIndex: currentIndex + itemCount - 1,
        imageIds,
        segmentIds,
      })
    } else {
      const taskImages = (images || []).slice(
        currentIndex,
        currentIndex + itemCount,
      )
      const imageIds = taskImages.map((img) => img.id)

      tasks.push({
        taskNumber: index + 1,
        imageCount: itemCount,
        segmentCount: 0,
        startIndex: currentIndex,
        endIndex: currentIndex + itemCount - 1,
        imageIds,
        segmentIds: [],
      })
    }

    currentIndex += itemCount
  })

  return tasks
}

function validateSplit(
  mode: SplitMode,
  taskCount: number,
  customTasks: Array<{ id: string; count: number }>,
  totalItems: number,
  generatedTasks: TaskSplit[],
  splitBy: SplitBy,
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const itemLabel = splitBy === 'segments' ? 'segments' : 'images'

  if (totalItems === 0) {
    errors.push(`No ${itemLabel} available to split`)
    return { isValid: false, errors, warnings }
  }

  if (mode === 'equal') {
    if (taskCount <= 0) {
      errors.push('Number of tasks must be greater than 0')
    }
    if (taskCount > totalItems) {
      errors.push(
        `Cannot create more tasks (${taskCount}) than available ${itemLabel} (${totalItems})`,
      )
    }
  } else {
    // Custom mode validation
    const totalAllocated = customTasks.reduce(
      (sum, task) => sum + task.count,
      0,
    )

    if (customTasks.length === 0) {
      errors.push('At least one task is required')
    }

    if (customTasks.some((task) => task.count < 0)) {
      errors.push(
        `${splitBy === 'segments' ? 'Segment' : 'Image'} count cannot be negative`,
      )
    }

    if (totalAllocated === 0) {
      errors.push(`At least one task must have ${itemLabel} allocated`)
    }

    if (totalAllocated > totalItems) {
      errors.push(
        `Total allocated ${itemLabel} (${totalAllocated}) exceeds available ${itemLabel} (${totalItems})`,
      )
    }

    if (totalAllocated < totalItems) {
      warnings.push(
        `${totalItems - totalAllocated} ${itemLabel} will not be assigned to any task`,
      )
    }

    // Check for empty tasks
    const emptyTasks = customTasks.filter((task) => task.count === 0).length
    if (emptyTasks > 0) {
      warnings.push(
        `${emptyTasks} empty task${emptyTasks === 1 ? '' : 's'} will be created`,
      )
    }
  }

  // Check generated tasks
  const totalInTasks =
    splitBy === 'segments'
      ? generatedTasks.reduce((sum, task) => sum + task.segmentCount, 0)
      : generatedTasks.reduce((sum, task) => sum + task.imageCount, 0)

  if (totalInTasks > totalItems) {
    errors.push(`Generated tasks exceed available ${itemLabel}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
