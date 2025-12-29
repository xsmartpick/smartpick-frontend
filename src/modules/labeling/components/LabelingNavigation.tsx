import { ArrowLeft, ArrowRight } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { useMobile } from '~/hooks/common/useMobile'
import { cn } from '~/lib/cn'

import type { ImageLabel, LabelingImage } from '../types'
import { ThumbnailStrip } from './ThumbnailStrip'

interface LabelingNavigationProps {
  images: LabelingImage[]
  currentIndex: number
  assignments: ImageLabel[]
  onPrevious: () => void
  onNext: () => void
  onImageSelect: (index: number) => void
}

export function LabelingNavigation({
  images,
  currentIndex,
  assignments,
  onPrevious,
  onNext,
  onImageSelect,
}: LabelingNavigationProps) {
  const isMobile = useMobile()

  return (
    <div
      className={cn(
        'mt-4 flex items-center justify-between gap-2',
        isMobile && 'mt-2 gap-1',
      )}
    >
      <Button
        variant="secondary"
        onClick={onPrevious}
        disabled={currentIndex === 0}
        size={isMobile ? 'sm' : 'md'}
        className={isMobile ? 'flex-1' : undefined}
      >
        <ArrowLeft className={cn('h-4 w-4', isMobile ? '' : 'mr-2')} />
        {!isMobile && 'Previous (←)'}
      </Button>

      {!isMobile && (
        <ThumbnailStrip
          images={images}
          currentIndex={currentIndex}
          assignments={assignments}
          onImageSelect={onImageSelect}
        />
      )}

      <Button
        variant="secondary"
        onClick={onNext}
        disabled={currentIndex === images.length - 1}
        size={isMobile ? 'sm' : 'md'}
        className={isMobile ? 'flex-1' : undefined}
      >
        {!isMobile && 'Next (→)'}
        <ArrowRight className={cn('h-4 w-4', isMobile ? '' : 'ml-2')} />
      </Button>
    </div>
  )
}
