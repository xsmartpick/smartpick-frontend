import { CheckCircle2 } from 'lucide-react'

import { cn } from '~/lib/cn'

import type { ImageLabel, LabelingImage } from '../types'

interface ThumbnailStripProps {
  images: LabelingImage[]
  currentIndex: number
  assignments: ImageLabel[]
  onImageSelect: (index: number) => void
}

export function ThumbnailStrip({
  images,
  currentIndex,
  assignments,
  onImageSelect,
}: ThumbnailStripProps) {
  return (
    <div className="flex flex-1 items-center justify-center gap-2 overflow-x-auto px-4">
      {images.map((img, idx) => {
        const isLabeled = assignments.some((a) => a.imageId === img.id)
        const isCurrent = idx === currentIndex

        return (
          <button
            key={img.id}
            onClick={() => onImageSelect(idx)}
            className={cn(
              'group relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
              isCurrent
                ? 'border-accent shadow-lg shadow-accent/20'
                : 'border-border hover:border-accent/50',
            )}
          >
            <img
              src={img.url}
              alt={img.name}
              className="h-full w-full object-cover"
            />
            {isLabeled && (
              <div className="absolute inset-0 flex items-center justify-center bg-accent/20">
                <CheckCircle2 className="h-5 w-5 text-accent" />
              </div>
            )}
            {isCurrent && (
              <div className="absolute inset-0 border-2 border-accent" />
            )}
          </button>
        )
      })}
    </div>
  )
}
