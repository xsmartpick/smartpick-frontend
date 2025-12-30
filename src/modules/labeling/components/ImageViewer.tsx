import { ZoomIn, ZoomOut } from 'lucide-react'
import { m } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '~/components/ui/button'
import { useMobile } from '~/hooks/common/useMobile'
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'

import type { LabelingImage } from '../types'

interface ImageViewerProps {
  image: LabelingImage
  className?: string
}

export function ImageViewer({ image, className }: ImageViewerProps) {
  const isMobile = useMobile()
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const minScale = 0.5
  const maxScale = 3
  const scaleStep = 0.25

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + scaleStep, maxScale))
  }, [maxScale, scaleStep])

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - scaleStep, minScale))
  }, [minScale, scaleStep])

  const handleReset = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -scaleStep : scaleStep
        setScale((prev) => {
          const newScale = Math.max(minScale, Math.min(maxScale, prev + delta))
          return newScale
        })
      }
    },
    [minScale, maxScale, scaleStep],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        setIsDragging(true)
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        })
      }
    },
    [position],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
    },
    [isDragging, dragStart],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Reset position when image changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleReset()
  }, [image.id, handleReset])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.key) {
      case '+': 
      case '=': {
        e.preventDefault()
        handleZoomIn()
      
      break;
      }
      case '-': {
        e.preventDefault()
        handleZoomOut()
      
      break;
      }
      case '0': {
        e.preventDefault()
        handleReset()
      
      break;
      }
      // No default
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleZoomIn, handleZoomOut, handleReset])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-fill',
        className,
      )}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default',
      }}
    >
      <m.div
        ref={imageRef}
        animate={{
          scale,
          x: position.x,
          y: position.y,
        }}
        transition={Spring.presets.smooth}
        className="relative max-h-full max-w-full select-none"
        style={{
          transformOrigin: 'center center',
        }}
      >
        <img
          src={image.url}
          alt={image.name}
          className={cn(
            'max-w-full object-contain',
            isMobile ? 'max-h-[50vh]' : 'max-h-[80vh]',
          )}
          draggable={false}
        />
      </m.div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 rounded-lg border border-border bg-background/90 p-2 shadow-lg backdrop-blur-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          disabled={scale >= maxScale}
          className="h-8 w-8 p-0"
          title="Zoom in (+)"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="px-2 text-xs font-medium text-text-secondary">
          {Math.round(scale * 100)}%
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          disabled={scale <= minScale}
          className="h-8 w-8 p-0"
          title="Zoom out (-)"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        {scale !== 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 w-8 p-0 text-xs"
            title="Reset zoom (0)"
          >
            1:1
          </Button>
        )}
      </div>

      {/* Image info overlay - Desktop only */}
      {!isMobile && (
        <div className="absolute top-4 left-4 rounded-lg border border-border bg-background/90 px-3 py-2 text-xs backdrop-blur-sm">
          <div className="font-medium text-text">{image.name}</div>
          <div className="text-text-secondary">
            {image.width} × {image.height}
          </div>
        </div>
      )}
    </div>
  )
}
