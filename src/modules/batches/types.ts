/**
 * Upload status for a file
 */
export type FileUploadStatus = 'pending' | 'uploading' | 'uploaded' | 'failed'

/**
 * Represents an uploaded image file with preview URL
 */
export interface UploadedImage {
  id: string
  file: File
  previewUrl: string
  name: string
  size: number
  fileId?: string // Server-assigned file ID
  uploadUrl?: string // Presigned upload URL
  uploadStatus?: FileUploadStatus // Upload status
}

/**
 * Status of a batch
 */
export type BatchStatus = 'draft' | 'processing' | 'completed' | 'failed'

/**
 * Represents a batch of images
 */
export interface Batch {
  id: string
  name: string
  description: string
  status: BatchStatus
  imageCount: number
  createdAt: string
  updatedAt: string
  images?: UploadedImage[]
}

/**
 * Form data for creating a new batch
 */
export interface CreateBatchFormData {
  name: string
  description: string
  images: UploadedImage[]
}
