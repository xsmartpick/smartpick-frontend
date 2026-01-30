import { ImageIcon } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useMobile } from '~/hooks/common/useMobile'
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'
import type { Label } from '~/modules/label-sets/api'
import {
  LabelingNavigation,
  LabelingStatusIndicator,
  useLabelingKeyboardShortcuts,
} from '~/modules/labeling'

import { useLabeling } from '../hooks'
import type { ImageLabel, LabelingImage } from '../types'
import { ImageViewer } from './ImageViewer'
import { LabelingComplete } from './LabelingComplete'
import { LabelingHeader } from './LabelingHeader'
import { LabelPanel } from './LabelPanel'

interface LabelingPageProps {
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
  onComplete?: () => void // Called when user confirms completion at 100%
}

/**
 * Main labeling page component - orchestrates labeling workflow
 */
export function LabelingPage({
  images,
  labels,
  initialAssignments = [],
  onSave,
  onLabelChange,
  onComplete,
}: LabelingPageProps) {
  const isMobile = useMobile()
  const [showCompleteOverlay, setShowCompleteOverlay] = useState(false)
  const { t } = useTranslation()

  const {
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
  } = useLabeling({
    images,
    labels,
    initialAssignments,
    onSave,
    onLabelChange,
    onComplete: () => setShowCompleteOverlay(true), // Show overlay when 100%
    autoAdvance: true, // Auto-advance when label is selected
  })

  // Handle save from complete overlay - saves and navigates back
  const handleCompleteSave = () => {
    handleSave()
    setShowCompleteOverlay(false)
    onComplete?.()
  }

  // Handle review from complete overlay - just close overlay to review
  const handleCompleteReview = () => {
    setShowCompleteOverlay(false)
  }

  // Setup keyboard shortcuts
  useLabelingKeyboardShortcuts({
    onPrevious: goToPrevious,
    onNext: goToNext,
    onSave: handleSave,
    onLabelSelect: handleLabelSelect,
    labels,
  })

  if (!currentImage) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-text-tertiary" />
          <p className="mt-4 text-text-secondary">
            {t('label.labelingPage.empty')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <LabelingHeader
        progress={progress}
        assignmentCount={assignments.length}
        onSave={handleSave}
      />

      {/* Main content */}
      <div
        className={cn(
          'relative flex flex-1 overflow-hidden',
          isMobile ? 'flex-col' : 'flex-row',
        )}
      >
        {/* Image viewer - top on mobile, left on desktop */}
        <div
          className={cn(
            'flex flex-col overflow-hidden',
            isMobile ? 'flex-1 min-h-0 p-2' : 'flex-1 p-6',
          )}
        >
          <div className={cn('flex-1 min-h-0', isMobile ? 'mb-2' : 'mb-4')}>
            <AnimatePresence mode="wait">
              <m.div
                key={currentImage.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={Spring.presets.smooth}
                className="flex h-full"
              >
                <ImageViewer image={currentImage} className="h-full w-full" />
              </m.div>
            </AnimatePresence>
          </div>

          <LabelingNavigation
            images={images}
            currentIndex={currentIndex}
            assignments={assignments}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onImageSelect={goToImage}
          />
        </div>

        {/* Label panel - bottom on mobile, right on desktop */}
        <div
          className={cn(
            'border-border bg-background',
            isMobile ? 'border-t flex-shrink-0' : 'w-80 border-l',
          )}
        >
          <LabelPanel
            labels={labels}
            selectedLabelIds={selectedLabelIds}
            onLabelSelect={handleLabelSelect}
            className="h-full"
          />
        </div>
      </div>

      <LabelingStatusIndicator
        isVisible={isCurrentImageLabeled}
        labelCount={selectedLabelIds.length}
      />

      {/* Completion overlay */}
      <AnimatePresence>
        {showCompleteOverlay && (
          <LabelingComplete
            totalLabeled={progress.labeled}
            onSave={handleCompleteSave}
            onReview={handleCompleteReview}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
