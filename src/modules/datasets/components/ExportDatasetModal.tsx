import { CheckCircle2, Download, Loader2 } from 'lucide-react'
import { m } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'

import type { Dataset, ExportFormat } from '../api'
import { useExportDataset, useExportStatus } from '../hooks'

interface ExportDatasetModalProps {
  open: boolean
  dataset: Dataset
  onClose: () => void
}

const EXPORT_FORMATS: {
  id: ExportFormat
  name: string
  description: string
  icon: string
}[] = [
  {
    id: 'yolo',
    name: 'YOLO',
    description: 'YOLOv5/v8 format with images and labels',
    icon: '🎯',
  },
  {
    id: 'coco',
    name: 'COCO',
    description: 'COCO JSON format for object detection',
    icon: '📦',
  },
  {
    id: 'pascal_voc',
    name: 'Pascal VOC',
    description: 'XML annotations in Pascal VOC format',
    icon: '📄',
  },
  {
    id: 'csv',
    name: 'CSV',
    description: 'Simple CSV with image paths and labels',
    icon: '📊',
  },
  {
    id: 'json',
    name: 'JSON',
    description: 'Raw JSON export of all data',
    icon: '{ }',
  },
]

export function ExportDatasetModal({
  open,
  dataset,
  onClose,
}: ExportDatasetModalProps) {
  const { t } = useTranslation()
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('yolo')
  const [includeImages, setIncludeImages] = useState(true)
  const [trainRatio, setTrainRatio] = useState(70)
  const [valRatio, setValRatio] = useState(20)
  const [testRatio, setTestRatio] = useState(10)
  const [activeJobId, setActiveJobId] = useState<string | null>(null)

  const exportMutation = useExportDataset()
  const { data: exportStatus } = useExportStatus(
    activeJobId ? dataset.id : undefined,
    activeJobId ?? undefined,
    { polling: activeJobId !== null },
  )

  // Handle export completion - derive from exportStatus
  // Using a derived state pattern to avoid setState in effects
  const isExportComplete = exportStatus?.status === 'completed'
  const isExportFailed = exportStatus?.status === 'failed'

  // Track if we've shown the toast for this job
  const shownToastForJobRef = useRef<string | null>(null)

  // Show toast and clear job when status changes (using effect with deferred update)
  useEffect(() => {
    if (!activeJobId || shownToastForJobRef.current === activeJobId) return

    if (isExportComplete) {
      shownToastForJobRef.current = activeJobId
      toast.success(
        t('datasets.export.success', { defaultValue: 'Export completed!' }),
        {
          description: t('datasets.export.successDesc', {
            defaultValue: 'Your dataset is ready for download.',
          }),
        },
      )
      // Use queueMicrotask to defer state update
      queueMicrotask(() => setActiveJobId(null))
    } else if (isExportFailed) {
      shownToastForJobRef.current = activeJobId
      toast.error(
        t('datasets.export.failed', { defaultValue: 'Export failed' }),
        {
          description: exportStatus?.message,
        },
      )
      queueMicrotask(() => setActiveJobId(null))
    }
  }, [activeJobId, isExportComplete, isExportFailed, exportStatus?.message, t])

  const handleExport = useCallback(async () => {
    try {
      const result = await exportMutation.mutateAsync({
        datasetId: dataset.id,
        request: {
          format: selectedFormat,
          includeImages,
          splitRatio: {
            train: trainRatio / 100,
            val: valRatio / 100,
            test: testRatio / 100,
          },
        },
      })

      if (result.status === 'completed' && result.downloadUrl) {
        // Direct download
        window.open(result.downloadUrl, '_blank')
        toast.success(
          t('datasets.export.success', { defaultValue: 'Export completed!' }),
        )
        onClose()
      } else {
        // Start polling
        setActiveJobId(result.jobId)
        toast.info(
          t('datasets.export.started', { defaultValue: 'Export started' }),
          {
            description: t('datasets.export.startedDesc', {
              defaultValue: 'Processing your export request...',
            }),
          },
        )
      }
    } catch (error) {
      console.error('Failed to export dataset:', error)
      toast.error(
        t('datasets.export.error', { defaultValue: 'Failed to start export' }),
        {
          description: error instanceof Error ? error.message : undefined,
        },
      )
    }
  }, [
    dataset.id,
    selectedFormat,
    includeImages,
    trainRatio,
    valRatio,
    testRatio,
    exportMutation,
    onClose,
    t,
  ])

  const handleClose = useCallback(() => {
    if (!exportMutation.isPending && !activeJobId) {
      onClose()
    }
  }, [exportMutation.isPending, activeJobId, onClose])

  const isProcessing = exportMutation.isPending || activeJobId !== null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-accent" />
            {t('datasets.export.title', { defaultValue: 'Export Dataset' })}
          </DialogTitle>
          <DialogDescription>
            {t('datasets.export.description', {
              name: dataset.name,
              defaultValue: `Export "${dataset.name}" for model training`,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dataset Summary */}
          <m.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={Spring.presets.smooth}
            className="rounded-xl border border-border bg-gradient-to-br from-fill/50 to-transparent p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">{dataset.name}</p>
                <p className="mt-1 text-xs text-text-secondary">
                  {dataset.totalSegments} segments, {dataset.labeledSegments}{' '}
                  labeled
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-accent">
                  {Math.round(
                    (dataset.labeledSegments / dataset.totalSegments) * 100,
                  ) || 0}
                  %
                </p>
                <p className="text-xs text-text-secondary">labeled</p>
              </div>
            </div>
          </m.div>

          {/* Export Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-text">
              {t('datasets.export.format.label', {
                defaultValue: 'Export Format',
              })}
            </Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {EXPORT_FORMATS.map((format) => (
                <button
                  key={format.id}
                  type="button"
                  onClick={() => setSelectedFormat(format.id)}
                  className={cn(
                    'rounded-xl border-2 p-3 text-left transition-all',
                    selectedFormat === format.id
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-background hover:border-accent/30',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{format.icon}</span>
                    <span className="font-medium text-text">{format.name}</span>
                  </div>
                  <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                    {format.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Split Ratio */}
          {(selectedFormat === 'yolo' || selectedFormat === 'coco') && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-text">
                {t('datasets.export.split.label', {
                  defaultValue: 'Train/Val/Test Split',
                })}
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-text-secondary">Train</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={trainRatio}
                    onChange={(e) => setTrainRatio(Number(e.target.value))}
                    className="text-center"
                    enableStepper
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-text-secondary">
                    Validation
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={valRatio}
                    onChange={(e) => setValRatio(Number(e.target.value))}
                    className="text-center"
                    enableStepper
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-text-secondary">Test</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={testRatio}
                    onChange={(e) => setTestRatio(Number(e.target.value))}
                    className="text-center"
                    enableStepper
                  />
                </div>
              </div>
              {trainRatio + valRatio + testRatio !== 100 && (
                <p className="text-xs text-amber">
                  {t('datasets.export.split.warning', {
                    defaultValue: 'Split ratios should sum to 100%',
                  })}
                </p>
              )}
            </div>
          )}

          {/* Include Images Option */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-fill/30 p-3">
            <div>
              <p className="text-sm font-medium text-text">
                {t('datasets.export.includeImages.label', {
                  defaultValue: 'Include Images',
                })}
              </p>
              <p className="text-xs text-text-secondary">
                {t('datasets.export.includeImages.description', {
                  defaultValue: 'Download images along with annotations',
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIncludeImages(!includeImages)}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                includeImages ? 'bg-accent' : 'bg-fill',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                  includeImages ? 'left-[22px]' : 'left-0.5',
                )}
              />
            </button>
          </div>

          {/* Export Progress */}
          {activeJobId && exportStatus && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-xl border border-accent/30 bg-accent/5 p-4"
            >
              <div className="flex items-center gap-3">
                {exportStatus.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-green" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-accent" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-text">
                    {exportStatus.status === 'completed'
                      ? t('datasets.export.complete', {
                          defaultValue: 'Export Complete',
                        })
                      : t('datasets.export.processing', {
                          defaultValue: 'Processing Export...',
                        })}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {exportStatus.message}
                  </p>
                </div>
                {exportStatus.status === 'completed' &&
                  exportStatus.downloadUrl && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        window.open(exportStatus.downloadUrl, '_blank')
                      }
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
              </div>
            </m.div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={isProcessing}>
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={isProcessing || trainRatio + valRatio + testRatio !== 100}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('datasets.export.exporting', {
                  defaultValue: 'Exporting...',
                })}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {t('datasets.export.submit', {
                  defaultValue: 'Export Dataset',
                })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
