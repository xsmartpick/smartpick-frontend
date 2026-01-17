import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Play,
  RefreshCw,
  ScanSearch,
  Settings2,
} from 'lucide-react'
import { m } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'

import {
  useBatchSegmentationStatus,
  useBatchSegments,
  useBulkReviewSegments,
  useReviewSegment,
  useSegmentationJob,
  useSegmentationPresets,
  useStartSegmentation,
} from '../hooks'
import type { ImageSegment, SegmentStatus } from '../types'
import { SegmentReviewCard } from './SegmentReviewCard'

interface SegmentationPanelProps {
  batchId: string
  className?: string
}

type FilterStatus = 'all' | SegmentStatus

export function SegmentationPanel({
  batchId,
  className,
}: SegmentationPanelProps) {
  const { t } = useTranslation()
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [selectedPresetId, setSelectedPresetId] = useState<string>('')
  const [activeJobId, setActiveJobId] = useState<string | null>(null)

  // Queries
  const { data: segmentationStatus, refetch: refetchStatus } =
    useBatchSegmentationStatus(batchId)
  const { data: presetsData } = useSegmentationPresets()
  const { data: segmentsData, refetch: refetchSegments } = useBatchSegments(
    batchId,
    filterStatus !== 'all' ? { status: filterStatus } : undefined,
  )

  // Job polling
  const { data: jobData } = useSegmentationJob(activeJobId ?? undefined, {
    polling: activeJobId !== null,
  })

  // Mutations
  const startSegmentation = useStartSegmentation()
  const reviewSegment = useReviewSegment()
  const bulkReviewSegments = useBulkReviewSegments()

  // Track which jobs we've handled to avoid duplicate processing
  const handledJobsRef = useRef<Set<string>>(new Set())
  const initializedPresetRef = useRef(false)

  // Set active job from status when a new job starts
  useEffect(() => {
    const segmentationJobId = segmentationStatus?.job?.id
    const segmentationJobStatus = segmentationStatus?.job?.status

    if (
      segmentationStatus?.hasSegmentation &&
      segmentationJobId &&
      (segmentationJobStatus === 'pending' ||
        segmentationJobStatus === 'processing') &&
      !handledJobsRef.current.has(`start-${segmentationJobId}`)
    ) {
      handledJobsRef.current.add(`start-${segmentationJobId}`)
      queueMicrotask(() => setActiveJobId(segmentationJobId))
    }
  }, [segmentationStatus])

  // Handle job completion
  useEffect(() => {
    if (!jobData) return

    const jobId = jobData.id || activeJobId
    const currentStatus = jobData.status

    if (
      (currentStatus === 'completed' || currentStatus === 'failed') &&
      jobId &&
      !handledJobsRef.current.has(`complete-${jobId}`)
    ) {
      handledJobsRef.current.add(`complete-${jobId}`)

      // Show toast immediately
      if (currentStatus === 'completed') {
        toast.success(t('segmentation.jobCompleted'))
      } else {
        toast.error(t('segmentation.jobFailed'), {
          description: jobData.errorMessage,
        })
      }

      // Defer state updates
      queueMicrotask(() => {
        setActiveJobId(null)
        refetchStatus()
        refetchSegments()
      })
    }
  }, [jobData, activeJobId, refetchStatus, refetchSegments, t])

  // Set default preset on initial load
  useEffect(() => {
    if (
      presetsData?.presets &&
      !selectedPresetId &&
      !initializedPresetRef.current
    ) {
      const defaultPreset = presetsData.presets.find((p) => p.isDefault)
      if (defaultPreset) {
        initializedPresetRef.current = true
        queueMicrotask(() => setSelectedPresetId(defaultPreset.id))
      }
    }
  }, [presetsData, selectedPresetId])

  const handleStartSegmentation = async () => {
    try {
      const result = await startSegmentation.mutateAsync({
        batchId,
        presetId: selectedPresetId ?? undefined,
        forceRerun: segmentationStatus?.hasSegmentation ? true : undefined,
      })
      setActiveJobId(result.jobId)
      toast.success(t('segmentation.jobStarted'))
    } catch (error) {
      console.error('Failed to start segmentation:', error)
      toast.error(t('segmentation.startFailed'), {
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  const handleApprove = useCallback(
    async (segment: ImageSegment) => {
      try {
        await reviewSegment.mutateAsync({
          segmentId: segment.id,
          request: { status: 'approved' },
        })
        toast.success(t('segmentation.approved'))
      } catch {
        toast.error(t('segmentation.approveFailed'))
      }
    },
    [reviewSegment, t],
  )

  const handleReject = useCallback(
    async (segment: ImageSegment) => {
      try {
        await reviewSegment.mutateAsync({
          segmentId: segment.id,
          request: { status: 'rejected' },
        })
        toast.success(t('segmentation.rejected'))
      } catch {
        toast.error(t('segmentation.rejectFailed'))
      }
    },
    [reviewSegment, t],
  )

  const handleBulkApprove = useCallback(async () => {
    const pendingSegments =
      segmentsData?.segments.filter((s) => s.status === 'pending_review') ?? []
    if (pendingSegments.length === 0) return

    try {
      await bulkReviewSegments.mutateAsync({
        segmentIds: pendingSegments.map((s) => s.id),
        status: 'approved',
      })
      toast.success(
        t('segmentation.bulkApproved', { count: pendingSegments.length }),
      )
    } catch {
      toast.error(t('segmentation.bulkApproveFailed'))
    }
  }, [bulkReviewSegments, segmentsData, t])

  const isProcessing =
    startSegmentation.isPending ||
    jobData?.status === 'pending' ||
    jobData?.status === 'processing'

  const segments = segmentsData?.segments ?? []
  const pendingCount = segments.filter(
    (s) => s.status === 'pending_review',
  ).length

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={Spring.presets.smooth}
      className={cn(
        'rounded-2xl border border-border bg-background',
        className,
      )}
    >
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <ScanSearch className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text">
                {t('segmentation.title')}
              </h2>
              <p className="text-sm text-text-secondary">
                {t('segmentation.description')}
              </p>
            </div>
          </div>

          {/* Preset selector */}
          <div className="flex items-center gap-3">
            <Select
              value={selectedPresetId}
              onValueChange={setSelectedPresetId}
            >
              <SelectTrigger className="min-w-[220px]">
                <Settings2 className="mr-2 h-4 w-4 shrink-0" />
                <SelectValue placeholder={t('segmentation.selectPreset')} />
              </SelectTrigger>
              <SelectContent>
                {presetsData?.presets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.isDefault
                      ? `${preset.name} (${t('common.default')})`
                      : preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="primary"
              onClick={handleStartSegmentation}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('segmentation.processing')}
                </>
              ) : segmentationStatus?.hasSegmentation ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('segmentation.rerun')}
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  {t('segmentation.start')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="space-y-6 p-6">
        {/* Progress indicator */}
        {jobData &&
          (jobData.status === 'pending' || jobData.status === 'processing') && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-accent/30 bg-accent/5 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-accent" />
                  <div>
                    <p className="font-medium text-text">
                      {t('segmentation.processingBatch')}
                    </p>
                    <p className="text-sm text-text-secondary">
                      {t('segmentation.progressInfo', {
                        processed: jobData.processedItems,
                        total: jobData.totalItems,
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-accent">
                    {Math.round(jobData.progressPercent)}%
                  </span>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-accent/20">
                <m.div
                  className="h-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${jobData.progressPercent}%` }}
                  transition={Spring.presets.smooth}
                />
              </div>
            </m.div>
          )}

        {/* Status messages */}
        {segmentationStatus?.hasSegmentation && segmentationStatus.job && (
          <div className="flex items-center gap-2">
            {segmentationStatus.job.status === 'completed' && (
              <div className="flex items-center gap-2 text-sm text-green">
                <CheckCircle2 className="h-4 w-4" />
                {t('segmentation.completedInfo', {
                  processed: segmentationStatus.job.processedItems,
                  failed: segmentationStatus.job.failedItems,
                })}
              </div>
            )}
            {segmentationStatus.job.status === 'failed' && (
              <div className="flex items-center gap-2 text-sm text-red">
                <AlertCircle className="h-4 w-4" />
                {segmentationStatus.job.errorMessage || t('segmentation.error')}
              </div>
            )}
          </div>
        )}

        {/* Filter and bulk actions - show when batch has segmentation */}
        {segmentationStatus?.hasSegmentation && (
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">
                {t('common.filter')}:
              </span>
              <Select
                value={filterStatus}
                onValueChange={(v) => setFilterStatus(v as FilterStatus)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('segmentation.filter.all')}
                  </SelectItem>
                  <SelectItem value="pending_review">
                    {t('segmentation.filter.pendingReview')}
                  </SelectItem>
                  <SelectItem value="approved">
                    {t('segmentation.filter.approved')}
                  </SelectItem>
                  <SelectItem value="rejected">
                    {t('segmentation.filter.rejected')}
                  </SelectItem>
                  <SelectItem value="manual">
                    {t('segmentation.filter.manual')}
                  </SelectItem>
                </SelectContent>
              </Select>
              {filterStatus !== 'all' && segments.length === 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                  className="text-xs"
                >
                  {t('common.clearFilter')}
                </Button>
              )}
            </div>

            {pendingCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBulkApprove}
                disabled={bulkReviewSegments.isPending}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {t('segmentation.approveAll', { count: pendingCount })}
              </Button>
            )}
          </div>
        )}

        {/* Segments grid */}
        {segments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {segments.map((segment) => (
              <SegmentReviewCard
                key={segment.id}
                segment={segment}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        ) : segmentationStatus?.hasSegmentation ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-fill">
              <ScanSearch className="h-8 w-8 text-text-tertiary" />
            </div>
            <p className="mt-4 text-text-secondary">
              {filterStatus !== 'all'
                ? t('segmentation.noSegmentsWithFilter')
                : t('segmentation.noSegmentsFound')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-fill/50 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background">
              <ScanSearch className="h-8 w-8 text-text-tertiary" />
            </div>
            <h3 className="mt-4 font-medium text-text">
              {t('segmentation.notStarted')}
            </h3>
            <p className="mt-2 max-w-md text-sm text-text-secondary">
              {t('segmentation.notStartedDescription')}
            </p>
            <Button
              variant="primary"
              className="mt-6"
              onClick={handleStartSegmentation}
              disabled={isProcessing}
            >
              <Play className="mr-2 h-4 w-4" />
              {t('segmentation.startSegmentation')}
            </Button>
          </div>
        )}
      </div>
    </m.div>
  )
}
