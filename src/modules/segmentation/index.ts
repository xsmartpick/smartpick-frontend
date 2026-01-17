// Types
export type {
  BatchItemSegmentationStatus,
  BatchItemWithSegments,
  BatchSegmentationStatus,
  BoundingBox,
  ImageSegment,
  SegmentationConfig,
  SegmentationJob,
  SegmentationJobStatus,
  SegmentationPreset,
  SegmentationSummary,
  SegmentCounts,
  SegmentStatus,
} from './types'

// API
export type {
  BulkReviewSegmentsRequest,
  CreateManualSegmentRequest,
  ListSegmentsParams,
  ReviewSegmentRequest,
  StartSegmentationRequest,
  StartSegmentationResponse,
  UpdateSegmentBboxRequest,
} from './api'
export {
  bulkReviewSegments,
  createManualSegment,
  deleteSegment,
  getBatchSegmentationStatus,
  getBatchSegmentationSummary,
  getSegmentationJobStatus,
  listBatchItemSegments,
  listBatchSegments,
  listSegmentationPresets,
  reviewSegment,
  startSegmentation,
  updateSegmentBbox,
} from './api'

// Hooks
export {
  segmentationKeys,
  useBatchItemSegments,
  useBatchSegmentationStatus,
  useBatchSegmentationSummary,
  useBatchSegments,
  useBulkReviewSegments,
  useCreateManualSegment,
  useDeleteSegment,
  useReviewSegment,
  useSegmentationJob,
  useSegmentationPresets,
  useStartSegmentation,
} from './hooks'

// Components
export { ImageWithSegments } from './components/ImageWithSegments'
export { SegmentationPanel } from './components/SegmentationPanel'
export { SegmentReviewCard } from './components/SegmentReviewCard'
