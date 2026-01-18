import { Check, Pencil, Sparkles, Trash2, User, X } from 'lucide-react'
import { m } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { Button } from '~/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'

import type { ImageSegment } from '../types'

interface SegmentReviewCardProps {
  segment: ImageSegment
  imageUrl?: string
  isSelected?: boolean
  onApprove?: (segment: ImageSegment) => void
  onReject?: (segment: ImageSegment) => void
  onEdit?: (segment: ImageSegment) => void
  onDelete?: (segment: ImageSegment) => void
  onClick?: (segment: ImageSegment) => void
  className?: string
}

function getStatusBadge(
  status: ImageSegment['status'],
  t: (key: string) => string,
) {
  switch (status) {
    case 'approved': {
      return {
        label: t('segmentation.status.approved'),
        className: 'bg-green/10 text-green border-green/20',
        icon: Check,
      }
    }
    case 'rejected': {
      return {
        label: t('segmentation.status.rejected'),
        className: 'bg-red/10 text-red border-red/20',
        icon: X,
      }
    }
    case 'manual': {
      return {
        label: t('segmentation.status.manual'),
        className: 'bg-blue/10 text-blue border-blue/20',
        icon: Pencil,
      }
    }
    default: {
      return {
        label: t('segmentation.status.pendingReview'),
        className: 'bg-amber/10 text-amber border-amber/20',
        icon: null,
      }
    }
  }
}

function getConfidenceColor(confidence: number) {
  if (confidence >= 0.9) return 'text-green'
  if (confidence >= 0.7) return 'text-amber'
  return 'text-red'
}

export function SegmentReviewCard({
  segment,
  imageUrl,
  isSelected,
  onApprove,
  onReject,
  onEdit,
  onDelete,
  onClick,
  className,
}: SegmentReviewCardProps) {
  const { t } = useTranslation()
  const statusBadge = getStatusBadge(segment.status, t)
  const StatusIcon = statusBadge.icon
  const isPending = segment.status === 'pending_review'

  return (
    <m.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={Spring.presets.smooth}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-background transition-all duration-200',
        isSelected
          ? 'border-accent ring-2 ring-accent/20'
          : 'border-border hover:border-accent/30',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={() => onClick?.(segment)}
    >
      {/* Crop preview */}
      <div className="relative aspect-square overflow-hidden bg-fill">
        {segment.cropUrl || imageUrl ? (
          <img
            src={segment.cropUrl || imageUrl}
            alt="Segment crop"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            style={
              !segment.cropUrl && imageUrl
                ? {
                    // If no crop URL, show the portion of the original image
                    objectFit: 'none',
                    objectPosition: `${-segment.bboxX * 100}% ${-segment.bboxY * 100}%`,
                  }
                : undefined
            }
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-tertiary">
            <span className="text-xs">No preview</span>
          </div>
        )}

        {/* Confidence badge */}
        <div
          className={cn(
            'absolute right-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium backdrop-blur-sm',
            getConfidenceColor(segment.confidence),
          )}
        >
          {Math.round(segment.confidence * 100)}%
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Status badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                statusBadge.className,
              )}
            >
              {StatusIcon && <StatusIcon className="h-3 w-3" />}
              {statusBadge.label}
            </span>

            {/* Approval source indicator */}
            {segment.status === 'approved' && segment.approvalSource && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-1.5 py-0.5',
                      segment.approvalSource === 'auto'
                        ? 'bg-purple/10 text-purple'
                        : 'bg-blue/10 text-blue',
                    )}
                  >
                    {segment.approvalSource === 'auto' ? (
                      <Sparkles className="h-3 w-3" />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {segment.approvalSource === 'auto' ? (
                    <div className="space-y-1">
                      <p className="font-medium">
                        {t('segmentation.approval.auto')}
                      </p>
                      {segment.approvalThreshold && (
                        <p className="text-xs text-text-secondary">
                          {t('segmentation.approval.thresholdInfo', {
                            threshold: Math.round(
                              segment.approvalThreshold * 100,
                            ),
                          })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="font-medium">
                      {t('segmentation.approval.manual')}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Dimensions */}
          <span className="text-xs text-text-tertiary">
            {segment.pixelWidth && segment.pixelHeight
              ? `${segment.pixelWidth}×${segment.pixelHeight}`
              : `${Math.round(segment.bboxWidth * 100)}%×${Math.round(segment.bboxHeight * 100)}%`}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          {isPending ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 border-green/30 text-green hover:bg-green/10 hover:border-green/50"
                onClick={(e) => {
                  e.stopPropagation()
                  onApprove?.(segment)
                }}
              >
                <Check className="mr-1.5 h-3.5 w-3.5" />
                {t('segmentation.actions.approve')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1 border-red/30 text-red hover:bg-red/10 hover:border-red/50"
                onClick={(e) => {
                  e.stopPropagation()
                  onReject?.(segment)
                }}
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                {t('segmentation.actions.reject')}
              </Button>
            </>
          ) : (
            <div className="flex flex-1 items-center gap-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(segment)
                  }}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  {t('segmentation.actions.edit')}
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red hover:bg-red/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(segment)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </m.div>
  )
}
