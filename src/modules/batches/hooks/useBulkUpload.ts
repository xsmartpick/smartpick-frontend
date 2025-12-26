import { useCallback, useState } from 'react'

import type {BulkCompleteUploadRequest, BulkUploadRequest} from '../api';
import {
  completeBulkUpload,
  startBulkUpload
} from '../api'
import type { UploadedImage } from '../types'

export interface BulkUploadProgress {
  total: number
  completed: number
  failed: number
  uploading: number
}

export interface UseBulkUploadOptions {
  onProgress?: (progress: BulkUploadProgress) => void
  onComplete?: (
    results: Array<{
      fileId: string
      status: 'uploaded' | 'failed'
      error?: string
    }>,
  ) => void
  onError?: (error: Error) => void
}

/**
 * Hook to handle bulk file upload using presigned URLs
 */
export function useBulkUpload(options?: UseBulkUploadOptions) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<BulkUploadProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    uploading: 0,
  })

  /**
   * Upload a single file to a presigned URL
   */
  const uploadFileToPresignedUrl = async (
    file: File,
    uploadUrl: string,
  ): Promise<boolean> => {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error('File upload error:', error)
      return false
    }
  }

  /**
   * Upload multiple files using bulk upload API
   */
  const uploadFiles = useCallback(
    async (
      images: UploadedImage[],
    ): Promise<
      Array<{
        fileId: string
        status: 'uploaded' | 'failed'
        error?: string
      }>
    > => {
      if (images.length === 0) {
        throw new Error('No files to upload')
      }

      if (images.length > 100) {
        throw new Error('Maximum 100 files per bulk upload')
      }

      setIsUploading(true)
      setProgress({
        total: images.length,
        completed: 0,
        failed: 0,
        uploading: 0,
      })

      try {
        // Step 1: Start bulk upload - get presigned URLs
        const uploadRequest: BulkUploadRequest = {
          requests: images.map((img) => ({
            fileId: img.fileId || img.id, // Use existing fileId or fallback to id
            fileName: img.name,
            contentType: img.file.type,
            sizeBytes: img.size,
          })),
        }

        const uploadResponse = await startBulkUpload(uploadRequest)

        // Step 2: Upload files to presigned URLs
        let completedCount = 0
        let failedCount = 0
        let uploadingCount = 0

        // Upload files in parallel
        const uploadPromises = uploadResponse.responses.map(
          async (response) => {
            const image = images.find(
              (img) => (img.fileId || img.id) === response.fileId,
            )

            if (!image) {
              console.error(`Image not found for fileId: ${response.fileId}`)
              failedCount++
              setProgress((prev) => ({
                ...prev,
                failed: prev.failed + 1,
              }))
              options?.onProgress?.({
                total: images.length,
                completed: completedCount,
                failed: failedCount,
                uploading: uploadingCount,
              })
              return {
                fileId: response.fileId,
                status: 'failed' as const,
                error: 'Image not found',
              }
            }

            // Mark as uploading
            uploadingCount++
            setProgress((prev) => ({
              ...prev,
              uploading: prev.uploading + 1,
            }))
            options?.onProgress?.({
              total: images.length,
              completed: completedCount,
              failed: failedCount,
              uploading: uploadingCount,
            })

            const success = await uploadFileToPresignedUrl(
              image.file,
              response.uploadUrl,
            )

            // Update counts
            uploadingCount--
            const status: 'uploaded' | 'failed' = success
              ? 'uploaded'
              : 'failed'
            if (success) {
              completedCount++
            } else {
              failedCount++
            }

            // Update progress
            setProgress((prev) => ({
              ...prev,
              uploading: prev.uploading - 1,
              completed: success ? prev.completed + 1 : prev.completed,
              failed: success ? prev.failed : prev.failed + 1,
            }))

            options?.onProgress?.({
              total: images.length,
              completed: completedCount,
              failed: failedCount,
              uploading: uploadingCount,
            })

            return {
              fileId: response.fileId,
              status,
              ...(success ? {} : { error: 'Upload to presigned URL failed' }),
            }
          },
        )

        // Wait for all uploads to complete
        const uploadResults = await Promise.all(uploadPromises)

        // Step 3: Complete bulk upload - update status
        const completeRequest: BulkCompleteUploadRequest = {
          requests: uploadResults.map((r) => ({
            fileId: r.fileId,
            status: r.status,
          })),
        }

        const completeResponse = await completeBulkUpload(completeRequest)

        // Use the response from the server, which may include errors
        const finalResults = completeResponse.responses.map((response) => ({
          fileId: response.fileId,
          status: response.status,
          ...(response.error ? { error: response.error } : {}),
        }))

        // Update final progress based on server response
        const finalProgress: BulkUploadProgress = {
          total: images.length,
          completed: finalResults.filter((r) => r.status === 'uploaded').length,
          failed: finalResults.filter((r) => r.status === 'failed').length,
          uploading: 0,
        }

        setProgress(finalProgress)
        options?.onProgress?.(finalProgress)
        options?.onComplete?.(finalResults)

        return finalResults
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        console.error('Bulk upload error:', err)
        options?.onError?.(err)
        throw err
      } finally {
        setIsUploading(false)
      }
    },
    [options],
  )

  return {
    uploadFiles,
    isUploading,
    progress,
  }
}
