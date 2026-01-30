import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import type { Label } from '~/modules/label-sets/api'

import type { ImageLabel, LabelingImage } from './types'

interface UseLabelingOptions {
  images: LabelingImage[]
  labels: Label[]
  initialAssignments?: ImageLabel[]
  onSave?: (assignments: ImageLabel[]) => void
  onLabelChange?: (
    imageId: string,
    labelId: string,
    labelName: string,
    isAdding: boolean,
  ) => void
  onComplete?: () => void // Called when labeling reaches 100%
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
  isComplete: boolean
  isCurrentImageLabeled: boolean
  goToPrevious: () => void
  goToNext: () => void
  goToImage: (index: number) => void
  goToNextUnlabeled: () => void
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
  onLabelChange,
  onComplete,
  autoAdvance = true, // Default to true for better UX
}: UseLabelingOptions): UseLabelingReturn {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [assignments, setAssignments] =
    useState<ImageLabel[]>(initialAssignments)

  // Use ref to track if completion callback has been fired (to prevent re-triggering)
  const hasCalledCompleteRef = useRef(false)

  // Use ref to track pending auto-advance to prevent race conditions
  const pendingAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track the current index in a ref to avoid stale closures
  const currentIndexRef = useRef(currentIndex)

  // Sync ref with state in effect
  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])

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

  // Check if labeling is complete (100%)
  const isComplete = progress.percentage >= 100 && images.length > 0

  // Trigger onComplete callback when labeling reaches 100%
  useEffect(() => {
    if (isComplete && !hasCalledCompleteRef.current && onComplete) {
      hasCalledCompleteRef.current = true
      // Delay slightly to allow the last label change to be processed
      const timer = setTimeout(() => {
        onComplete()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isComplete, onComplete])

  // Check if current image is labeled
  const isCurrentImageLabeled = selectedLabelIds.length > 0

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    // Cancel any pending auto-advance
    if (pendingAdvanceRef.current) {
      clearTimeout(pendingAdvanceRef.current)
      pendingAdvanceRef.current = null
    }
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const goToNext = useCallback(() => {
    // Cancel any pending auto-advance
    if (pendingAdvanceRef.current) {
      clearTimeout(pendingAdvanceRef.current)
      pendingAdvanceRef.current = null
    }
    setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1))
  }, [images.length])

  const goToImage = useCallback(
    (index: number) => {
      // Cancel any pending auto-advance
      if (pendingAdvanceRef.current) {
        clearTimeout(pendingAdvanceRef.current)
        pendingAdvanceRef.current = null
      }
      if (index >= 0 && index < images.length) {
        setCurrentIndex(index)
      }
    },
    [images.length],
  )

  // Find and go to next unlabeled image
  const goToNextUnlabeled = useCallback(() => {
    // Cancel any pending auto-advance
    if (pendingAdvanceRef.current) {
      clearTimeout(pendingAdvanceRef.current)
      pendingAdvanceRef.current = null
    }

    const labeledImageIds = new Set(assignments.map((a) => a.imageId))

    // Find next unlabeled image starting from current position
    for (let i = currentIndexRef.current + 1; i < images.length; i++) {
      if (!labeledImageIds.has(images[i].id)) {
        setCurrentIndex(i)
        return
      }
    }

    // If not found after current position, wrap around
    for (let i = 0; i < currentIndexRef.current; i++) {
      if (!labeledImageIds.has(images[i].id)) {
        setCurrentIndex(i)
        return
      }
    }

    // All images are labeled, just go to next
    if (currentIndexRef.current < images.length - 1) {
      setCurrentIndex(currentIndexRef.current + 1)
    }
  }, [images, assignments])

  // Label selection handler
  const handleLabelSelect = useCallback(
    (labelId: string) => {
      if (!currentImage) return

      const label = labels.find((l) => l.id === labelId)
      if (!label) return

      // Cancel any pending auto-advance when selecting a new label
      if (pendingAdvanceRef.current) {
        clearTimeout(pendingAdvanceRef.current)
        pendingAdvanceRef.current = null
      }

      // Check if current image now has any labels and auto-advance
      const existingAssignment = assignments.find(
        (a) => a.imageId === currentImage.id && a.labelId === labelId,
      )
      const wasSelected = !!existingAssignment

      setAssignments((prev) => {
        if (wasSelected) {
          // Remove assignment
          return prev.filter(
            (a) => !(a.imageId === currentImage.id && a.labelId === labelId),
          )
        } else {
          // Add assignment
          return [
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
        }
      })

      // Call onLabelChange for auto-save
      if (onLabelChange) {
        onLabelChange(currentImage.id, labelId, label.name, !wasSelected)
      }

      // Only auto-advance when adding a label (not removing)
      if (
        !wasSelected &&
        autoAdvance &&
        currentIndexRef.current < images.length - 1
      ) {
        pendingAdvanceRef.current = setTimeout(() => {
          pendingAdvanceRef.current = null
          // Use functional update to get the latest index
          setCurrentIndex((prevIndex) => {
            // Only advance if we're still at the same position (user didn't navigate manually)
            if (prevIndex === currentIndexRef.current) {
              return Math.min(prevIndex + 1, images.length - 1)
            }
            return prevIndex
          })
        }, 200) // Reduced delay for snappier feel
      }
    },
    [
      currentImage,
      labels,
      assignments,
      autoAdvance,
      images.length,
      onLabelChange,
    ],
  )

  // Save handler
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(assignments)
      toast.success(t('label.labelingPage.toast.saveSuccess'), {
        description: t('label.labelingPage.toast.saveDesc', {
          count: assignments.length,
        }),
      })
    } else {
      toast.info(t('label.labelingPage.toast.updateTitle'), {
        description: t('label.labelingPage.toast.updateDesc', {
          count: assignments.length,
        }),
      })
    }
  }, [assignments, onSave, t])

  return {
    currentIndex,
    currentImage,
    assignments,
    selectedLabelIds,
    progress,
    isComplete,
    isCurrentImageLabeled,
    goToPrevious,
    goToNext,
    goToImage,
    goToNextUnlabeled,
    handleLabelSelect,
    handleSave,
  }
}
