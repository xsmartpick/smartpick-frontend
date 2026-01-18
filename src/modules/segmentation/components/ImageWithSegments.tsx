import { Check, X } from 'lucide-react'
import { m } from 'motion/react'
import { useCallback, useRef, useState } from 'react'

import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'

import type { ImageSegment, SegmentStatus } from '../types'

interface ImageWithSegmentsProps {
  imageUrl: string
  segments: ImageSegment[]
  selectedSegmentId?: string
  onSegmentClick?: (segment: ImageSegment) => void
  onSegmentHover?: (segment: ImageSegment | null) => void
  showLabels?: boolean
  className?: string
}

function getSegmentColor(
  status: SegmentStatus,
  isSelected: boolean,
  isHovered: boolean,
) {
  const opacity = isSelected ? 1 : isHovered ? 0.9 : 0.7

  switch (status) {
    case 'approved': {
      return {
        border: `rgba(34, 197, 94, ${opacity})`,
        fill: `rgba(34, 197, 94, ${isSelected || isHovered ? 0.2 : 0.1})`,
        text: 'text-green',
      }
    }
    case 'rejected': {
      return {
        border: `rgba(239, 68, 68, ${opacity})`,
        fill: `rgba(239, 68, 68, ${isSelected || isHovered ? 0.2 : 0.1})`,
        text: 'text-red',
      }
    }
    case 'manual': {
      return {
        border: `rgba(59, 130, 246, ${opacity})`,
        fill: `rgba(59, 130, 246, ${isSelected || isHovered ? 0.2 : 0.1})`,
        text: 'text-blue',
      }
    }
    default: {
      return {
        border: `rgba(251, 191, 36, ${opacity})`,
        fill: `rgba(251, 191, 36, ${isSelected || isHovered ? 0.2 : 0.1})`,
        text: 'text-amber',
      }
    }
  }
}

function StatusIcon({ status }: { status: SegmentStatus }) {
  switch (status) {
    case 'approved': {
      return <Check className="h-3 w-3" />
    }
    case 'rejected': {
      return <X className="h-3 w-3" />
    }
    default: {
      return null
    }
  }
}

export function ImageWithSegments({
  imageUrl,
  segments,
  selectedSegmentId,
  onSegmentClick,
  onSegmentHover,
  showLabels = true,
  className,
}: ImageWithSegmentsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredSegmentId, setHoveredSegmentId] = useState<string | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleSegmentHover = useCallback(
    (segment: ImageSegment | null) => {
      setHoveredSegmentId(segment?.id ?? null)
      onSegmentHover?.(segment)
    },
    [onSegmentHover],
  )

  // Sort segments so smaller ones render on top
  const sortedSegments = [...segments].sort((a, b) => {
    const areaA = a.bboxWidth * a.bboxHeight
    const areaB = b.bboxWidth * b.bboxHeight
    return areaB - areaA // Larger segments first (behind smaller ones)
  })

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
    >
      {/* Base image */}
      <img
        src={imageUrl}
        alt="Batch item"
        className="h-full w-full object-contain"
        onLoad={() => setImageLoaded(true)}
      />

      {/* Segment overlays */}
      {imageLoaded && (
        <div className="absolute inset-0">
          {sortedSegments.map((segment) => {
            const isSelected = segment.id === selectedSegmentId
            const isHovered = segment.id === hoveredSegmentId
            const colors = getSegmentColor(
              segment.status,
              isSelected,
              isHovered,
            )

            return (
              <m.div
                key={segment.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={Spring.presets.snappy}
                style={{
                  position: 'absolute',
                  left: `${segment.bboxX * 100}%`,
                  top: `${segment.bboxY * 100}%`,
                  width: `${segment.bboxWidth * 100}%`,
                  height: `${segment.bboxHeight * 100}%`,
                  borderColor: colors.border,
                  backgroundColor: colors.fill,
                }}
                className={cn(
                  'cursor-pointer border-2 transition-all duration-150',
                  isSelected && 'ring-2 ring-white ring-offset-1',
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onSegmentClick?.(segment)
                }}
                onMouseEnter={() => handleSegmentHover(segment)}
                onMouseLeave={() => handleSegmentHover(null)}
              >
                {/* Confidence badge */}
                {showLabels && (isHovered || isSelected) && (
                  <m.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'absolute -top-6 left-0 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm',
                      colors.text,
                    )}
                  >
                    <StatusIcon status={segment.status} />
                    <span>{Math.round(segment.confidence * 100)}%</span>
                  </m.div>
                )}

                {/* Corner resize handles (visual only for now) */}
                {isSelected && (
                  <>
                    <div className="absolute -left-1 -top-1 h-2 w-2 rounded-full border-2 border-white bg-accent" />
                    <div className="absolute -right-1 -top-1 h-2 w-2 rounded-full border-2 border-white bg-accent" />
                    <div className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full border-2 border-white bg-accent" />
                    <div className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full border-2 border-white bg-accent" />
                  </>
                )}
              </m.div>
            )
          })}
        </div>
      )}

      {/* Segment count badge */}
      {segments.length > 0 && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-black/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {segments.length} segment{segments.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
