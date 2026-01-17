/**
 * Segmentation job status
 */
export type SegmentationJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'skipped'

/**
 * Segment review status
 */
export type SegmentStatus =
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'manual'

/**
 * Approval source - how the segment was approved
 */
export type ApprovalSource = 'auto' | 'manual'

/**
 * Batch item segmentation status
 */
export type BatchItemSegmentationStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped'

/**
 * Bounding box coordinates (normalized 0-1)
 */
export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
  // Original pixel coordinates (optional)
  pixelX?: number
  pixelY?: number
  pixelWidth?: number
  pixelHeight?: number
}

/**
 * Segmentation job response
 */
export interface SegmentationJob {
  id: string
  batchId: string
  status: SegmentationJobStatus
  totalItems: number
  processedItems: number
  failedItems: number
  progressPercent: number
  errorMessage?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
  createdBy: string
}

/**
 * Image segment
 */
export interface ImageSegment {
  id: string
  batchItemId: string
  bboxX: number
  bboxY: number
  bboxWidth: number
  bboxHeight: number
  pixelX?: number
  pixelY?: number
  pixelWidth?: number
  pixelHeight?: number
  cropUrl?: string
  maskUrl?: string
  confidence: number
  status: SegmentStatus
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  // Approval audit info
  approvalSource?: ApprovalSource
  approvalThreshold?: number
}

/**
 * Segment counts by status
 */
export interface SegmentCounts {
  total: number
  pendingReview: number
  approved: number
  rejected: number
  manual: number
  avgConfidence: number
}

/**
 * Batch item with segments
 */
export interface BatchItemWithSegments {
  id: string
  batchId: string
  objectKey: string
  imageUrl?: string
  segmentationStatus: BatchItemSegmentationStatus
  segmentationError?: string
  segmentedAt?: string
  segments: ImageSegment[]
  segmentCounts: SegmentCounts
  createdAt: string
}

/**
 * Segmentation preset
 */
export interface SegmentationPreset {
  id: string
  name: string
  description?: string
  config: SegmentationConfig
  isDefault: boolean
  createdAt: string
}

/**
 * Segmentation configuration
 */
export interface SegmentationConfig {
  model: 'opencv' | 'sam2' | 'watershed'
  minConfidence: number
  minAreaRatio: number
  maxAreaRatio: number
  autoApproveThreshold: number
  preprocessing?: {
    contrastEnhancement?: boolean
    denoise?: boolean
  }
}

/**
 * Segmentation summary for a batch
 */
export interface SegmentationSummary {
  batchId: string
  totalImages: number
  segmentedImages: number
  pendingImages: number
  failedImages: number
  totalSegments: number
  pendingSegments: number
  approvedSegments: number
  rejectedSegments: number
  avgSegmentsPerImage: number
  avgConfidence: number
}

/**
 * Batch segmentation status response
 */
export interface BatchSegmentationStatus {
  hasSegmentation: boolean
  job?: SegmentationJob
  message?: string
}
