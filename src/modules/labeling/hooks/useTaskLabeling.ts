import { useQuery } from '@tanstack/react-query'

import { getTaskSegments } from '~/modules/tasks/api'

import type { ImageLabel, LabelingImage } from '../types'

/**
 * Query keys for task labeling
 */
export const taskLabelingKeys = {
  all: ['task-labeling'] as const,
  taskSegments: (taskId: string) =>
    [...taskLabelingKeys.all, 'task-segments', taskId] as const,
}

/**
 * Check if a segment has a valid crop URL
 */
function hasValidCropUrl(segment: { cropUrl?: string }): boolean {
  return !!(segment.cropUrl && segment.cropUrl.trim().length > 0)
}

/**
 * Hook to fetch labeling images for a task
 * Only fetches segments assigned to the specific task
 */
export function useTaskLabelingImages(taskId: string | undefined) {
  return useQuery({
    queryKey: taskLabelingKeys.taskSegments(taskId || ''),
    queryFn: async () => {
      const response = await getTaskSegments(taskId!)

      // Convert segments to labeling images, filtering out ones without valid cropUrl
      const images: LabelingImage[] = []
      let skippedCount = 0

      for (const segment of response.segments) {
        if (!hasValidCropUrl(segment)) {
          console.warn(`Segment ${segment.id} has no valid cropUrl, skipping`)
          skippedCount++
          continue
        }

        images.push({
          id: segment.id,
          name: `Segment ${segment.id.slice(0, 8)}`,
          url: segment.cropUrl!,
          width: segment.pixelWidth || 100,
          height: segment.pixelHeight || 100,
          labelId: segment.labelId,
          labelName: segment.labelName,
          labelColor: segment.labelColor,
        })
      }

      if (skippedCount > 0) {
        console.warn(`Skipped ${skippedCount} segments without valid cropUrl`)
      }

      // Extract existing assignments from segments that have labels AND valid cropUrl
      const existingAssignments: ImageLabel[] = response.segments
        .filter((seg) => seg.labelId && hasValidCropUrl(seg))
        .map((seg) => ({
          imageId: seg.id,
          labelId: seg.labelId!,
          labelName: seg.labelName || '',
          labelColor: seg.labelColor,
          assignedAt: seg.labeledAt || new Date().toISOString(),
        }))

      return {
        images,
        existingAssignments,
        skippedCount,
        taskName: response.taskName,
        total: response.total,
      }
    },
    enabled: !!taskId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
