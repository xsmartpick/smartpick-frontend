/**
 * Upload Configuration
 *
 * Centralized configuration for file upload constraints across the application.
 * Modify these values to adjust upload limits globally.
 *
 * @example Changing max file size
 * ```ts
 * // In src/lib/upload-config.ts, update:
 * MAX_FILE_SIZE_MB: 200, // Change from default to desired value
 * ```
 */

export const UPLOAD_CONFIG = {
  /**
   * Maximum file size in megabytes
   * @default 200 MB
   *
   * Consider these factors when adjusting:
   * - Server upload limits (nginx, cloudflare, etc.)
   * - Network bandwidth and upload time
   * - Memory usage (large images decompress to more raw pixels)
   * - Storage costs
   */
  MAX_FILE_SIZE_MB: 200,

  /**
   * Maximum number of files per batch upload
   * @default 50
   */
  MAX_FILES_PER_BATCH: 50,

  /**
   * Accepted image MIME types
   */
  ACCEPTED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ] as const,

  /**
   * Accepted image file extensions (for display purposes)
   */
  ACCEPTED_IMAGE_EXTENSIONS: [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
  ] as const,
} as const

/**
 * Computed values derived from configuration
 */
export const UPLOAD_LIMITS = {
  /** Max file size in bytes */
  maxFileSizeBytes: UPLOAD_CONFIG.MAX_FILE_SIZE_MB * 1024 * 1024,

  /** Accepted types as comma-separated string for input accept attribute */
  acceptedTypesString: UPLOAD_CONFIG.ACCEPTED_IMAGE_TYPES.join(','),
} as const

/**
 * Type definitions for upload configuration
 */
export type AcceptedImageType =
  (typeof UPLOAD_CONFIG.ACCEPTED_IMAGE_TYPES)[number]
export type AcceptedImageExtension =
  (typeof UPLOAD_CONFIG.ACCEPTED_IMAGE_EXTENSIONS)[number]
