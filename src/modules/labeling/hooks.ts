import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { Label } from '~/modules/label-sets/api'

import type { ImageLabel, LabelingImage } from './types'

interface UseLabelingOptions {
  images: LabelingImage[]
  labels: Label[]
  initialAssignments?: ImageLabel[]
  onSave?: (assignments: ImageLabel[]) => void
  autoAdvance?: boolean // Auto-advance to next image when label is selected
}

interface UseLabelingReturn {
  currentIndex: number
  currentImage: LabelingImage | undefined
  assignments: ImageLabel[]
  selectedLabelIds: string[]
  progress: {
    current: number
    total: number
    labeled: number
    percentage: number
  }
  isCurrentImageLabeled: boolean
  goToPrevious: () => void
  goToNext: () => void
  goToImage: (index: number) => void
  handleLabelSelect: (labelId: string) => void
  handleSave: () => void
}

/**
 * Hook for managing labeling state and operations
 */
export function useLabeling({
  images,
  labels,
  initialAssignments = [],
  onSave,
  autoAdvance = true, // Default to true for better UX
}: UseLabelingOptions): UseLabelingReturn {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [assignments, setAssignments] =
    useState<ImageLabel[]>(initialAssignments)

  const currentImage = images[currentIndex]

  // Get selected labels for current image
  const selectedLabelIds = !currentImage
    ? []
    : assignments
        .filter((a) => a.imageId === currentImage.id)
        .map((a) => a.labelId)

  // Progress calculation
  const progress = useMemo(() => {
    const labeledCount = new Set(assignments.map((a) => a.imageId)).size
    return {
      current: currentIndex + 1,
      total: images.length,
      labeled: labeledCount,
      percentage: images.length > 0 ? (labeledCount / images.length) * 100 : 0,
    }
  }, [currentIndex, images.length, assignments])

  // Check if current image is labeled
  const isCurrentImageLabeled = selectedLabelIds.length > 0

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1))
  }, [images.length])

  const goToImage = useCallback(
    (index: number) => {
      if (index >= 0 && index < images.length) {
        setCurrentIndex(index)
      }
    },
    [images.length],
  )

  // Label selection handler
  const handleLabelSelect = useCallback(
    (labelId: string) => {
      if (!currentImage) return

      const label = labels.find((l) => l.id === labelId)
      if (!label) return

      setAssignments((prev) => {
        const existingIndex = prev.findIndex(
          (a) => a.imageId === currentImage.id && a.labelId === labelId,
        )

        const wasSelected = existingIndex !== -1

        if (wasSelected) {
          // Remove assignment
          return prev.filter((_, idx) => idx !== existingIndex)
        } else {
          // Add assignment
          const newAssignments = [
            ...prev.filter(
              (a) => !(a.imageId === currentImage.id && a.labelId === labelId),
            ),
            {
              imageId: currentImage.id,
              labelId: label.id,
              labelName: label.name,
              labelColor: label.color,
              assignedAt: new Date().toISOString(),
            },
          ]

          // Auto-advance to next image if enabled and not at the end
          if (autoAdvance && currentIndex < images.length - 1) {
            // Use setTimeout to allow state update to complete first
            setTimeout(() => {
              setCurrentIndex((prev) => Math.min(prev + 1, images.length - 1))
            }, 300) // Small delay for better UX - user sees the selection
          }

          return newAssignments
        }
      })
    },
    [currentImage, labels, autoAdvance, currentIndex, images.length],
  )

  // Save handler
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(assignments)
      toast.success('Labels saved successfully!', {
        description: `${assignments.length} label assignment${assignments.length === 1 ? '' : 's'} saved.`,
      })
    } else {
      toast.info('Labels updated', {
        description: `${assignments.length} label assignment${assignments.length === 1 ? '' : 's'} recorded.`,
      })
    }
  }, [assignments, onSave])

  return {
    currentIndex,
    currentImage,
    assignments,
    selectedLabelIds,
    progress,
    isCurrentImageLabeled,
    goToPrevious,
    goToNext,
    goToImage,
    handleLabelSelect,
    handleSave,
  }
}
