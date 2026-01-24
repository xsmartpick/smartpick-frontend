import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Circle,
  ClipboardList,
  ImageIcon,
  Tag,
  XCircle,
} from 'lucide-react'
import { m } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useUserValue } from '~/atoms/auth'
import { EmptyState, ErrorState, LoadingState } from '~/components/common'
import { Button } from '~/components/ui/button'
import { relativeTime } from '~/lib/date-utils'
import { isAdmin } from '~/lib/rbac'
import { Spring } from '~/lib/spring'
import { useBatches } from '~/modules/batches/hooks'
import type { Batch } from '~/modules/batches/types'
import { CASHEW_LABELS } from '~/modules/labeling'
import { useBatchSegmentationSummary } from '~/modules/segmentation'
import type { TaskResponse } from '~/modules/tasks/api'
import { useTasks } from '~/modules/tasks/hooks'

type ViewMode = 'tasks' | 'batches'

/**
 * Labeling hub page
 *
 * Shows available tasks and batches that can be labeled
 * Tasks are the primary view - batches are shown as a secondary option
 */
export const Component = () => {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<ViewMode>('tasks')
  const user = useUserValue()
  const isUserAdmin = isAdmin(user)

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useTasks()
  const {
    data: batches = [],
    isLoading: batchesLoading,
    error: batchesError,
    refetch: refetchBatches,
  } = useBatches({ enabled: isUserAdmin })

  const effectiveViewMode: ViewMode = isUserAdmin ? viewMode : 'tasks'

  // Filter batches that have images (ready for labeling)
  const readyBatches = batches.filter(
    (batch) => batch.status === 'completed' || batch.imageCount > 0,
  )

  // Filter tasks that are not completed
  const pendingTasks = tasks.filter(
    (task) => task.labelingProgress.progressPercent < 100,
  )

  const isLoading =
    effectiveViewMode === 'tasks' ? tasksLoading : batchesLoading
  const error = effectiveViewMode === 'tasks' ? tasksError : batchesError
  const refetch = effectiveViewMode === 'tasks' ? refetchTasks : refetchBatches

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Page Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-6">
          <div className="flex items-center gap-4">
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={Spring.presets.bouncy}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-background shadow-lg shadow-accent/20"
            >
              <Tag className="h-6 w-6" />
            </m.div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Labeling</h1>
              <p className="text-sm text-text-secondary">
                {effectiveViewMode === 'tasks'
                  ? 'Select a task to start labeling'
                  : 'Select a batch to start labeling'}
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          {isUserAdmin && (
            <div className="flex items-center gap-1 rounded-xl border border-border bg-fill/30 p-1">
              <button
                onClick={() => setViewMode('tasks')}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'tasks'
                    ? 'bg-background text-text shadow-sm'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                <ClipboardList className="h-4 w-4" />
                Tasks
                {pendingTasks.length > 0 && (
                  <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-xs text-accent">
                    {pendingTasks.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setViewMode('batches')}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'batches'
                    ? 'bg-background text-text shadow-sm'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                <Boxes className="h-4 w-4" />
                Batches
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Available Labels Preview */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={Spring.presets.smooth}
          className="mb-8"
        >
          <h2 className="mb-4 text-sm font-semibold text-text">
            Available Labels
          </h2>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-fill/30 p-4">
            {CASHEW_LABELS.map((label) => (
              <div
                key={label.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5"
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                <span className="text-sm font-medium text-text">
                  {label.name}
                </span>
              </div>
            ))}
          </div>
        </m.div>

        {/* Content Grid */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...Spring.presets.smooth, delay: 0.1 }}
        >
          <h2 className="mb-4 text-sm font-semibold text-text">
            {effectiveViewMode === 'tasks'
              ? 'Tasks Ready for Labeling'
              : 'Batches Ready for Labeling'}
          </h2>

          {isLoading ? (
            <div className="rounded-2xl border border-border bg-background p-8">
              <LoadingState
                message={
                  effectiveViewMode === 'tasks'
                    ? 'Loading tasks...'
                    : 'Loading batches...'
                }
              />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-border bg-background p-8">
              <ErrorState
                title={
                  effectiveViewMode === 'tasks'
                    ? 'Failed to load tasks'
                    : 'Failed to load batches'
                }
                onRetry={() => refetch()}
              />
            </div>
          ) : effectiveViewMode === 'tasks' ? (
            pendingTasks.length === 0 ? (
              <div className="rounded-2xl border border-border bg-background p-8">
                <EmptyState
                  title="No tasks available"
                  message={
                    isUserAdmin
                      ? 'Tasks are created by splitting batches. Go to Batches and split a batch into tasks.'
                      : 'No tasks are assigned to you yet.'
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingTasks.map((task) => (
                  <TaskCard key={task.id} task={task} t={t} />
                ))}
              </div>
            )
          ) : readyBatches.length === 0 ? (
            <div className="rounded-2xl border border-border bg-background p-8">
              <EmptyState
                title="No batches available"
                message="Create a batch and run auto-segmentation to start labeling."
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {readyBatches.map((batch) => (
                <BatchCard key={batch.id} batch={batch} t={t} />
              ))}
            </div>
          )}
        </m.div>
      </div>
    </div>
  )
}

function TaskCard({
  task,
  t,
}: {
  task: TaskResponse
  t: ReturnType<typeof useTranslation>['t']
}) {
  const progress = task.labelingProgress
  // Determine if this is a segment-based task
  const isSegmentBased = task.isSegmentBased || progress.totalSegments > 0

  // Use segment counts for segment-based tasks, image counts otherwise
  const totalItems = isSegmentBased
    ? progress.totalSegments
    : progress.totalImages
  const labeledItems = isSegmentBased
    ? progress.labeledSegments
    : progress.labeledImages
  const remainingItems = totalItems - labeledItems
  const itemLabel = isSegmentBased ? 'segments' : 'images'

  return (
    <m.div
      whileHover={{ scale: 1.02 }}
      transition={Spring.presets.snappy}
      className="group rounded-2xl border border-border bg-background p-4 transition-shadow hover:shadow-lg"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fill">
          <ClipboardList className="h-5 w-5 text-text-secondary" />
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            progress.progressPercent === 100
              ? 'bg-green/10 text-green'
              : progress.progressPercent > 0
                ? 'bg-amber/10 text-amber'
                : 'bg-fill text-text-secondary'
          }`}
        >
          {progress.progressPercent === 100
            ? 'Completed'
            : progress.progressPercent > 0
              ? 'In Progress'
              : 'Todo'}
        </span>
      </div>

      <h3 className="mb-1 font-semibold text-text">{task.name}</h3>
      {task.description && (
        <p className="mb-3 line-clamp-2 text-sm text-text-secondary">
          {task.description}
        </p>
      )}

      <div className="mb-3 flex items-center gap-4 text-sm text-text-tertiary">
        <div className="flex items-center gap-1">
          <ImageIcon className="h-4 w-4" />
          <span>
            {totalItems} {itemLabel}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3 rounded-lg border border-border bg-fill/30 p-2.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-text">Progress</span>
          <span className="text-sm font-semibold text-text">
            {Math.round(progress.progressPercent)}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-fill">
          <m.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.progressPercent}%` }}
            transition={Spring.presets.smooth}
            className="h-full rounded-full bg-accent"
          />
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-text-tertiary">
          <span>{labeledItems} labeled</span>
          <span>•</span>
          <span>{remainingItems} remaining</span>
        </div>
      </div>

      <div className="mb-4 text-xs text-text-tertiary">
        Updated {relativeTime(task.updatedAt, t)}
      </div>

      <Link to={`/label/task/${task.id}`}>
        <Button
          variant="primary"
          className="w-full"
          disabled={totalItems === 0}
        >
          {progress.progressPercent > 0
            ? 'Continue Labeling'
            : 'Start Labeling'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </m.div>
  )
}

function BatchCard({
  batch,
  t,
}: {
  batch: Batch
  t: ReturnType<typeof useTranslation>['t']
}) {
  const { data: segmentSummary } = useBatchSegmentationSummary(batch.id)

  return (
    <m.div
      whileHover={{ scale: 1.02 }}
      transition={Spring.presets.snappy}
      className="group rounded-2xl border border-border bg-background p-4 transition-shadow hover:shadow-lg"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fill">
          <Boxes className="h-5 w-5 text-text-secondary" />
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            batch.status === 'completed'
              ? 'bg-accent/10 text-accent'
              : batch.status === 'processing'
                ? 'bg-warning/10 text-warning'
                : 'bg-fill text-text-secondary'
          }`}
        >
          {batch.status || 'Draft'}
        </span>
      </div>

      <h3 className="mb-1 font-semibold text-text">{batch.name}</h3>
      {batch.description && (
        <p className="mb-3 line-clamp-2 text-sm text-text-secondary">
          {batch.description}
        </p>
      )}

      <div className="mb-3 flex items-center gap-4 text-sm text-text-tertiary">
        <div className="flex items-center gap-1">
          <ImageIcon className="h-4 w-4" />
          <span>{batch.imageCount} images</span>
        </div>
      </div>

      {/* Segment Statistics */}
      {segmentSummary && segmentSummary.totalSegments > 0 && (
        <div className="mb-3 rounded-lg border border-border bg-fill/30 p-2.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-text">Segments</span>
            <span className="text-sm font-semibold text-text">
              {segmentSummary.totalSegments}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {segmentSummary.approvedSegments > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-green/10 px-2 py-0.5 text-xs text-green">
                <CheckCircle2 className="h-3 w-3" />
                {segmentSummary.approvedSegments} approved
              </span>
            )}
            {segmentSummary.pendingSegments > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-amber/10 px-2 py-0.5 text-xs text-amber">
                <Circle className="h-3 w-3" />
                {segmentSummary.pendingSegments} pending
              </span>
            )}
            {segmentSummary.rejectedSegments > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-red/10 px-2 py-0.5 text-xs text-red">
                <XCircle className="h-3 w-3" />
                {segmentSummary.rejectedSegments} rejected
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mb-4 text-xs text-text-tertiary">
        Updated {relativeTime(batch.updatedAt, t)}
      </div>

      <Link to={`/label/${batch.id}`}>
        <Button
          variant="primary"
          className="w-full"
          disabled={batch.imageCount === 0}
        >
          Start Labeling
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </m.div>
  )
}
