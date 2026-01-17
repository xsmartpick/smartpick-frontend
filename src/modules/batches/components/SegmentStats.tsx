import { CheckCircle2, Circle, Hand, Loader2, XCircle } from 'lucide-react'

import { cn } from '~/lib/cn'
import type { SegmentationSummary } from '~/modules/segmentation/types'

interface SegmentStatsProps {
  summary: SegmentationSummary | undefined
  isLoading?: boolean
  variant?: 'compact' | 'default' | 'detailed'
  className?: string
}

/**
 * Displays segment statistics in a compact, default, or detailed format.
 * Used in BatchCard, BatchDetails, and LabelingPage.
 */
export function SegmentStats({
  summary,
  isLoading,
  variant = 'default',
  className,
}: SegmentStatsProps) {
  if (isLoading) {
    return (
      <div
        className={cn('flex items-center gap-2 text-text-tertiary', className)}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span className="text-xs">Loading...</span>
      </div>
    )
  }

  if (!summary || summary.totalSegments === 0) {
    return (
      <div className={cn('text-xs text-text-tertiary', className)}>
        No segments
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 text-xs', className)}>
        <span className="font-medium text-text">{summary.totalSegments}</span>
        <span className="text-text-tertiary">segments</span>
        {summary.approvedSegments > 0 && (
          <span className="flex items-center gap-1 text-green">
            <CheckCircle2 className="h-3 w-3" />
            {summary.approvedSegments}
          </span>
        )}
        {summary.pendingSegments > 0 && (
          <span className="flex items-center gap-1 text-amber">
            <Circle className="h-3 w-3" />
            {summary.pendingSegments}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">Total Segments</span>
          <span className="text-lg font-semibold text-text">
            {summary.totalSegments}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatItem
            icon={<Circle className="h-3.5 w-3.5" />}
            label="Pending"
            value={summary.pendingSegments}
            colorClass="text-amber bg-amber/10"
          />
          <StatItem
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            label="Approved"
            value={summary.approvedSegments}
            colorClass="text-green bg-green/10"
          />
          <StatItem
            icon={<XCircle className="h-3.5 w-3.5" />}
            label="Rejected"
            value={summary.rejectedSegments}
            colorClass="text-red bg-red/10"
          />
          <StatItem
            icon={<Hand className="h-3.5 w-3.5" />}
            label="Manual"
            value={0} // Manual count not in summary, use 0 for now
            colorClass="text-blue bg-blue/10"
          />
        </div>
        {summary.avgConfidence > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Avg Confidence</span>
            <span className="font-medium text-text">
              {(summary.avgConfidence * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('flex flex-wrap items-center gap-3 text-xs', className)}>
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-text">{summary.totalSegments}</span>
        <span className="text-text-tertiary">segments</span>
      </div>
      <div className="flex items-center gap-2">
        {summary.approvedSegments > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-green/10 px-2 py-0.5 text-green">
            <CheckCircle2 className="h-3 w-3" />
            {summary.approvedSegments}
          </span>
        )}
        {summary.pendingSegments > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-amber/10 px-2 py-0.5 text-amber">
            <Circle className="h-3 w-3" />
            {summary.pendingSegments}
          </span>
        )}
        {summary.rejectedSegments > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-red/10 px-2 py-0.5 text-red">
            <XCircle className="h-3 w-3" />
            {summary.rejectedSegments}
          </span>
        )}
      </div>
    </div>
  )
}

function StatItem({
  icon,
  label,
  value,
  colorClass,
}: {
  icon: React.ReactNode
  label: string
  value: number
  colorClass: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
      <div
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg',
          colorClass,
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-text">{value}</span>
        <span className="text-[10px] text-text-tertiary">{label}</span>
      </div>
    </div>
  )
}
