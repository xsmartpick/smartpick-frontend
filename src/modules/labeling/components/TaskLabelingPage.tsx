import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ImageIcon } from 'lucide-react'
import { m } from 'motion/react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { ErrorState, LoadingState } from '~/components/common'
import { Button } from '~/components/ui/button'
import { Spring } from '~/lib/spring'
import type { Label } from '~/modules/label-sets/api'
import { taskKeys } from '~/modules/tasks/hooks'

import type { SegmentLabelAssignment } from '../api'
import {
  CASHEW_LABELS,
  removeSegmentLabel,
  saveSegmentLabel,
  saveSegmentLabels,
} from '../api'
import { useTaskLabelingImages } from '../hooks/useTaskLabeling'
import type { ImageLabel } from '../types'
import { LabelingPage } from './LabelingPage'

interface TaskLabelingPageProps {
  taskId: string
}

/**
 * Wrapper component that fetches task segments and renders the labeling page
 * Only loads segments assigned to the specific task, not all batch segments
 */
export function TaskLabelingPage({ taskId }: TaskLabelingPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading, error, refetch } = useTaskLabelingImages(taskId)

  // Extract images and existing assignments
  const images = useMemo(() => data?.images || [], [data])
  const existingAssignments = useMemo(
    () => data?.existingAssignments || [],
    [data],
  )
  const taskName = data?.taskName

  // Convert cashew labels to Label interface
  const labels: Label[] = CASHEW_LABELS.map((l) => ({
    id: l.id,
    name: l.name,
    description: l.description,
    color: l.color,
  }))

  // Auto-save handler - called when a label is added or removed
  const handleLabelChange = useCallback(
    async (
      imageId: string,
      labelId: string,
      labelName: string,
      isAdding: boolean,
    ) => {
      try {
        if (isAdding) {
          await saveSegmentLabel(imageId, labelId, labelName)
        } else {
          await removeSegmentLabel(imageId)
        }
        // No toast for auto-save to avoid spam
      } catch (err) {
        console.error('Auto-save failed:', err)
        // Silent fail for auto-save
      }
    },
    [],
  )

  // Manual save handler - for bulk save button
  const handleSave = useCallback(
    async (assignments: ImageLabel[]) => {
      // Convert to segment label assignments
      const segmentAssignments: SegmentLabelAssignment[] = assignments.map(
        (a) => ({
          segmentId: a.imageId,
          labelId: a.labelId,
          labelName: a.labelName,
        }),
      )

      try {
        // Use taskId as batchId for bulk save (the API handles it)
        const result = await saveSegmentLabels(taskId, segmentAssignments)
        if (result.success) {
          toast.success(t('label.batchLabeling.save.success'), {
            description: t('label.batchLabeling.save.successDesc', {
              count: result.count,
            }),
          })
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: taskKeys.all })
        }
      } catch (err) {
        toast.error(t('label.batchLabeling.save.error'), {
          description:
            err instanceof Error
              ? err.message
              : t('label.batchLabeling.save.unknownError'),
        })
      }
    },
    [taskId, queryClient, t],
  )

  // Complete handler - navigates back to labeling hub after saving
  const handleComplete = useCallback(() => {
    // Invalidate queries to refresh data when returning
    queryClient.invalidateQueries({ queryKey: taskKeys.all })
    // Navigate back to labeling hub
    navigate('/label')
  }, [navigate, queryClient])

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <div className="flex items-center gap-4 border-b border-border px-6 py-4">
          <Link to="/label">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('label.taskLabeling.backButton')}
            </Button>
          </Link>
          {taskName && (
            <span className="text-sm text-text-secondary">{taskName}</span>
          )}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <LoadingState message={t('label.taskLabeling.loading')} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <div className="flex items-center gap-4 border-b border-border px-6 py-4">
          <Link to="/label">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('label.taskLabeling.backButton')}
            </Button>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center p-8">
          <ErrorState
            title={t('label.taskLabeling.error.title')}
            message={
              error instanceof Error
                ? error.message
                : t('label.taskLabeling.error.unknown')
            }
            onRetry={() => refetch()}
          />
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <div className="flex items-center gap-4 border-b border-border px-6 py-4">
          <Link to="/label">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('label.taskLabeling.backButton')}
            </Button>
          </Link>
          {taskName && (
            <span className="text-sm text-text-secondary">{taskName}</span>
          )}
        </div>
        <div className="flex flex-1 items-center justify-center">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={Spring.presets.smooth}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-fill">
              <ImageIcon className="h-8 w-8 text-text-tertiary" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-text">
              {t('label.taskLabeling.empty.title')}
            </h2>
            <p className="mb-6 max-w-md text-sm text-text-secondary">
              {t('label.taskLabeling.empty.message')}
            </p>
            <Link to="/label">
              <Button variant="primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('label.taskLabeling.backButton')}
              </Button>
            </Link>
          </m.div>
        </div>
      </div>
    )
  }

  return (
    <LabelingPage
      images={images}
      labels={labels}
      initialAssignments={existingAssignments}
      onSave={handleSave}
      onLabelChange={handleLabelChange}
      onComplete={handleComplete}
    />
  )
}
