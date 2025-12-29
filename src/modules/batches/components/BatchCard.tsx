import {
  Calendar,
  ImageIcon,
  MoreHorizontal,
  Scissors,
  Trash2,
} from 'lucide-react'
import { m } from 'motion/react'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu/DropdownMenu'
import { cn } from '~/lib/cn'
import { formatDate, relativeTime } from '~/lib/date-utils'
import { Spring } from '~/lib/spring'

import type { Batch } from '../types'

interface BatchCardProps {
  batch: Batch
  onDelete?: (id: string) => void
  onSplit?: (batch: Batch) => void
  onClick?: (batch: Batch) => void
  className?: string
}

function getStatusColor(status: Batch['status']) {
  switch (status) {
    case 'completed': {
      return 'bg-green/10 text-green border-green/20'
    }
    case 'processing': {
      return 'bg-amber/10 text-amber border-amber/20'
    }
    case 'failed': {
      return 'bg-red/10 text-red border-red/20'
    }
    default: {
      return 'bg-fill text-text-secondary border-border'
    }
  }
}

function getStatusLabel(status: Batch['status']) {
  switch (status) {
    case 'completed': {
      return 'Completed'
    }
    case 'processing': {
      return 'Processing'
    }
    case 'failed': {
      return 'Failed'
    }
    default: {
      return 'Draft'
    }
  }
}

export function BatchCard({
  batch,
  onDelete,
  onSplit,
  onClick,
  className,
}: BatchCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={Spring.presets.smooth}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-background transition-all duration-200',
        'hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={() => onClick?.(batch)}
    >
      {/* Preview images mosaic */}
      {/* FemtoHell: ListBatches API không trả presigned URLs (performance optimization)
          Images chỉ có trong GetBatch endpoint. Grid view hiển thị placeholder với imageCount.
          Click vào batch để xem full images trong detail page. */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-accent/5 via-fill to-accent/10">
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-2xl bg-accent/10 p-4">
              <ImageIcon className="h-12 w-12 text-accent" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-text">{batch.imageCount}</p>
              <p className="text-xs text-text-tertiary">
                {batch.imageCount === 1 ? 'image' : 'images'}
              </p>
            </div>
          </div>
        </div>

        {/* Hover overlay gradient */}
        <m.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-text">
              {batch.name}
            </h3>
            {batch.description && (
              <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                {batch.description}
              </p>
            )}
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 shrink-0 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onSplit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onSplit(batch)
                  }}
                >
                  <Scissors className="mr-2 h-4 w-4" />
                  Split into Tasks
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(batch.id)
                  }}
                  className="text-red focus:text-red"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete batch
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta info */}
        <div className="mt-3 flex items-center justify-between">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
              getStatusColor(batch.status),
            )}
          >
            {getStatusLabel(batch.status)}
          </span>

          <div
            className="flex items-center gap-1 text-xs text-text-tertiary"
            title={formatDate(batch.createdAt)}
          >
            <Calendar className="h-3.5 w-3.5" />
            {relativeTime(batch.createdAt)}
          </div>
        </div>
      </div>
    </m.div>
  )
}
