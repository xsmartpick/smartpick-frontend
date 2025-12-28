/**
 * Upload status for a file
 */
export type FileUploadStatus = 'pending' | 'uploading' | 'uploaded' | 'failed'

/**
 * Represents an uploaded image file (for local uploads before server response)
 */
export interface UploadedImage {
  id: string
  file: File
  previewUrl: string // Blob URL created with URL.createObjectURL() for local preview
  name: string
  size: number
  fileId?: string // Server-assigned file ID (UUID)
  uploadUrl?: string // Presigned upload URL (from bulk upload API)
  uploadStatus?: FileUploadStatus // Upload status
}

/**
 * Represents an image from the API (doesn't have File object)
 */
export interface BatchImage {
  id: string
  name: string
  size: number
  contentType: string
  uploadStatus: string
  downloadUrl: string
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
  images?: BatchImage[]
}

/**
 * Form data for creating a new batch
 */
export interface CreateBatchFormData {
  name: string
  description: string
  images: UploadedImage[]
}
