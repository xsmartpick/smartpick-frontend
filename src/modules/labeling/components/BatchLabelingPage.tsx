import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ImageIcon } from 'lucide-react'
import { m } from 'motion/react'
import { useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { ErrorState, LoadingState } from '~/components/common'
import { Button } from '~/components/ui/button'
import { Spring } from '~/lib/spring'
import type { Label } from '~/modules/label-sets/api'
import { segmentationKeys } from '~/modules/segmentation'

import type { SegmentLabelAssignment } from '../api'
import {
  CASHEW_LABELS,
  removeSegmentLabel,
  saveSegmentLabel,
  saveSegmentLabels,
} from '../api'
import { labelingKeys, useBatchLabelingImages } from '../hooks/useBatchLabeling'
import type { ImageLabel } from '../types'
import { LabelingPage } from './LabelingPage'

interface BatchLabelingPageProps {
  batchId: string
}

/**
 * Wrapper component that fetches real batch data and renders the labeling page
 */
export function BatchLabelingPage({ batchId }: BatchLabelingPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading, error, refetch } = useBatchLabelingImages(batchId)

  // Extract images and existing assignments
  const images = useMemo(() => data?.images || [], [data])
  const existingAssignments = useMemo(
    () => data?.existingAssignments || [],
    [data],
  )

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
        const result = await saveSegmentLabels(batchId, segmentAssignments)
        if (result.success) {
          toast.success(`Labels saved successfully!`, {
            description: `${result.count} label${result.count === 1 ? '' : 's'} saved.`,
          })
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: labelingKeys.all })
        }
      } catch (err) {
        toast.error('Failed to save labels', {
          description: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    },
    [batchId, queryClient],
  )

  // Complete handler - navigates back to batch after saving
  const handleComplete = useCallback(() => {
    // Invalidate queries to refresh data when returning to batch page
    queryClient.invalidateQueries({ queryKey: labelingKeys.all })
    // Also invalidate segmentation queries so batch detail page shows updated labels
    queryClient.invalidateQueries({
      queryKey: segmentationKeys.batchSegments(batchId, {}),
    })
    // Navigate back to batch detail page
    navigate(`/batches/${batchId}`)
  }, [batchId, navigate, queryClient])

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <div className="flex items-center gap-4 border-b border-border px-6 py-4">
          <Link to={`/batches/${batchId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Batch
            </Button>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <LoadingState message="Loading segments for labeling..." />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <div className="flex items-center gap-4 border-b border-border px-6 py-4">
          <Link to={`/batches/${batchId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Batch
            </Button>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center p-8">
          <ErrorState
            title="Failed to load segments"
            message={
              error instanceof Error ? error.message : 'An error occurred'
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
          <Link to={`/batches/${batchId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Batch
            </Button>
          </Link>
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
              No Segments Available
            </h2>
            <p className="mb-6 max-w-md text-sm text-text-secondary">
              This batch doesn't have any approved segments for labeling. Run
              auto-segmentation first and approve segments before labeling.
            </p>
            <Link to={`/batches/${batchId}`}>
              <Button variant="primary">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Batch
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
