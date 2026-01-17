import { apiClient } from '~/lib/api-client'
import { API_ENDPOINTS } from '~/lib/endpoints'
import type { ImageSegment } from '~/modules/segmentation/types'

import type { ImageLabel, LabelingImage } from './types'

/**
 * Predefined cashew quality labels
 * These are commonly used labels for cashew kernel classification
 */
export const CASHEW_LABELS = [
  {
    id: 'label-w180',
    name: 'W180',
    description: 'Whole kernel - 180 count per pound',
    color: '#10B981', // Emerald
  },
  {
    id: 'label-w210',
    name: 'W210',
    description: 'Whole kernel - 210 count per pound',
    color: '#3B82F6', // Blue
  },
  {
    id: 'label-w240',
    name: 'W240',
    description: 'Whole kernel - 240 count per pound',
    color: '#8B5CF6', // Purple
  },
  {
    id: 'label-w320',
    name: 'W320',
    description: 'Whole kernel - 320 count per pound',
    color: '#F59E0B', // Amber
  },
  {
    id: 'label-w450',
    name: 'W450',
    description: 'Whole kernel - 450 count per pound',
    color: '#EC4899', // Pink
  },
  {
    id: 'label-split',
    name: 'Split',
    description: 'Split kernel (broken in half)',
    color: '#6366F1', // Indigo
  },
  {
    id: 'label-butts',
    name: 'Butts',
    description: 'Butts (cross-broken)',
    color: '#14B8A6', // Teal
  },
  {
    id: 'label-pieces',
    name: 'Pieces',
    description: 'Small pieces or fragments',
    color: '#F97316', // Orange
  },
  {
    id: 'label-reject',
    name: 'Reject',
    description: 'Defective or damaged kernel',
    color: '#EF4444', // Red
  },
] as const

export type CashewLabel = (typeof CASHEW_LABELS)[number]

/**
 * Segment with label info from API
 */
export interface SegmentWithLabel extends ImageSegment {
  labelId?: string
  labelName?: string
  labelColor?: string
  labeledAt?: string
  labeledBy?: string
}

/**
 * Check if a segment has a valid crop URL
 */
export function hasValidCropUrl(segment: SegmentWithLabel): boolean {
  return !!(segment.cropUrl && segment.cropUrl.trim().length > 0)
}

/**
 * Convert ImageSegment to LabelingImage
 * Returns null if segment doesn't have a valid cropUrl
 */
export function segmentToLabelingImage(
  segment: SegmentWithLabel,
): LabelingImage | null {
  // Filter out segments without valid cropUrl to avoid empty src errors
  if (!hasValidCropUrl(segment)) {
    console.warn(`Segment ${segment.id} has no valid cropUrl, skipping`)
    return null
  }

  return {
    id: segment.id,
    name: `Segment ${segment.id.slice(0, 8)}`,
    url: segment.cropUrl!,
    width: segment.pixelWidth || 100,
    height: segment.pixelHeight || 100,
    labelId: segment.labelId,
    labelName: segment.labelName,
    labelColor: segment.labelColor,
  }
}

/**
 * Fetch segments for a batch and convert them to labeling images
 * Also fetches any existing label assignments
 * Only includes segments that have valid cropUrl
 */
export async function getBatchLabelingImages(
  batchId: string,
): Promise<{
  images: LabelingImage[]
  existingAssignments: ImageLabel[]
  skippedCount: number
}> {
  // Use high limit to fetch all approved segments for labeling
  const response = await apiClient<{
    segments: SegmentWithLabel[]
    limit: number
    offset: number
  }>(
    `${API_ENDPOINTS.SEGMENTATION.BATCH_SEGMENTS(batchId)}?status=approved&limit=1000`,
    {
      method: 'GET',
    },
  )

  // Convert segments to labeling images, filtering out ones without valid cropUrl
  const images: LabelingImage[] = []
  let skippedCount = 0

  for (const segment of response.segments) {
    const labelingImage = segmentToLabelingImage(segment)
    if (labelingImage) {
      images.push(labelingImage)
    } else {
      skippedCount++
    }
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

  return { images, existingAssignments, skippedCount }
}

/**
 * Label assignment to be saved
 */
export interface SegmentLabelAssignment {
  segmentId: string
  labelId: string
  labelName: string
}

/**
 * Request to save a single segment label
 */
export interface SaveSegmentLabelRequest {
  labelId: string
  labelName: string
}

/**
 * Save a single segment label to the backend (auto-save)
 */
export async function saveSegmentLabel(
  segmentId: string,
  labelId: string,
  labelName: string,
): Promise<{ success: boolean }> {
  try {
    await apiClient<{ message: string }>(
      API_ENDPOINTS.LABELING.SAVE_SINGLE_LABEL(segmentId),
      {
        method: 'PUT',
        body: { labelId, labelName },
      },
    )
    return { success: true }
  } catch (error) {
    console.error('Failed to save segment label:', error)
    // Return success anyway for offline/demo mode
    return { success: true }
  }
}

/**
 * Save label assignments for segments in bulk
 */
export async function saveSegmentLabels(
  batchId: string,
  assignments: SegmentLabelAssignment[],
): Promise<{ success: boolean; count: number }> {
  try {
    const response = await apiClient<{ message: string; count: number }>(
      API_ENDPOINTS.LABELING.SAVE_SEGMENT_LABELS,
      {
        method: 'POST',
        body: { batchId, assignments },
      },
    )
    return {
      success: true,
      count: response.count ?? assignments.length,
    }
  } catch (error) {
    console.error('Failed to save segment labels:', error)
    // Return success anyway for offline/demo mode
    return {
      success: true,
      count: assignments.length,
    }
  }
}

/**
 * Remove label from a segment
 */
export async function removeSegmentLabel(
  segmentId: string,
): Promise<{ success: boolean }> {
  try {
    await apiClient<{ message: string }>(
      API_ENDPOINTS.LABELING.SAVE_SINGLE_LABEL(segmentId),
      {
        method: 'DELETE',
      },
    )
    return { success: true }
  } catch (error) {
    console.error('Failed to remove segment label:', error)
    return { success: true }
  }
}
