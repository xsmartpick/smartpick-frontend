import { ImageIcon } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'

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
import { LabelingHeader } from './LabelingHeader'
import { LabelPanel } from './LabelPanel'

interface LabelingPageProps {
  images: LabelingImage[]
  labels: Label[]
  initialAssignments?: ImageLabel[]
  onSave?: (assignments: ImageLabel[]) => void
}

/**
 * Main labeling page component - orchestrates labeling workflow
 */
export function LabelingPage({
  images,
  labels,
  initialAssignments = [],
  onSave,
}: LabelingPageProps) {
  const isMobile = useMobile()

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
    autoAdvance: true, // Auto-advance when label is selected
  })

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
          <p className="mt-4 text-text-secondary">No images to label</p>
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
    </div>
  )
}
