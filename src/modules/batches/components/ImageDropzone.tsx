import { CloudUpload, FileImage, X } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useCallback, useState } from 'react'

import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'

import type { UploadedImage } from '../types'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

interface ImageDropzoneProps {
  images: UploadedImage[]
  onImagesChange: (images: UploadedImage[]) => void
  maxFiles?: number
  maxSizeMB?: number
  acceptedTypes?: string[]
  className?: string
  disabled?: boolean
}

export function ImageDropzone({
  images,
  onImagesChange,
  maxFiles = 50,
  maxSizeMB = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  className,
  disabled = false,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      setError(null)
      const fileArray = Array.from(files)

      // Check file limit
      if (images.length + fileArray.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`)
        return
      }

      const validFiles: UploadedImage[] = []
      const errors: string[] = []

      for (const file of fileArray) {
        // Check file type
        if (!acceptedTypes.includes(file.type)) {
          errors.push(`${file.name}: Invalid file type`)
          continue
        }

        // Check file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          errors.push(`${file.name}: File too large (max ${maxSizeMB}MB)`)
          continue
        }

        // Check for duplicates by name and size
        const isDuplicate = images.some(
          (img) => img.name === file.name && img.size === file.size,
        )
        if (isDuplicate) {
          errors.push(`${file.name}: File already added`)
          continue
        }

        validFiles.push({
          id: generateId(),
          file,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
        })
      }

      if (errors.length > 0) {
        setError(errors[0])
      }

      if (validFiles.length > 0) {
        onImagesChange([...images, ...validFiles])
      }
    },
    [images, onImagesChange, maxFiles, maxSizeMB, acceptedTypes],
  )

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set false if we're actually leaving the dropzone
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const { files } = e.dataTransfer
      if (files?.length) {
        processFiles(files)
      }
    },
    [processFiles],
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget
      const { files } = input
      if (files?.length) processFiles(files)
    },
    [processFiles],
  )

  const removeImage = useCallback(
    (id: string) => {
      const imageToRemove = images.find((img) => img.id === id)
      if (imageToRemove?.previewUrl) {
        URL.revokeObjectURL(imageToRemove.previewUrl)
      }
      onImagesChange(images.filter((img) => img.id !== id))
    },
    [images, onImagesChange],
  )

  const clearAll = useCallback(() => {
    for (const img of images) {
      if (img.previewUrl) {
        URL.revokeObjectURL(img.previewUrl)
      }
    }
    onImagesChange([])
  }, [images, onImagesChange])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Dropzone */}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={Spring.presets.smooth}
      >
        <label
          htmlFor="image-upload"
          onDragEnter={disabled ? undefined : handleDragEnter}
          onDragLeave={disabled ? undefined : handleDragLeave}
          onDragOver={disabled ? undefined : handleDragOver}
          onDrop={disabled ? undefined : handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center gap-4 p-8 transition-all duration-200',
            'border-2 border-dashed rounded-2xl',
            disabled
              ? 'cursor-not-allowed opacity-50 bg-fill/20 border-border'
              : 'cursor-pointer bg-fill/30 hover:bg-fill/50',
            !disabled &&
              (isDragging
                ? 'border-accent bg-accent/5'
                : 'border-border hover:border-accent/50'),
          )}
        >
          <input
            id="image-upload"
            type="file"
            className="sr-only"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            disabled={disabled}
          />

          <m.div
            animate={{
              scale: isDragging ? 1.1 : 1,
              y: isDragging ? -4 : 0,
            }}
            transition={Spring.presets.snappy}
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-2xl',
              isDragging ? 'bg-accent text-background' : 'bg-fill text-text',
            )}
          >
            <CloudUpload className="h-8 w-8" />
          </m.div>

          <div className="text-center">
            <p className="text-base font-medium text-text">
              {isDragging ? 'Drop images here' : 'Drag and drop images here'}
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              or{' '}
              <span className="text-accent font-medium hover:underline">
                click to browse
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-text-tertiary">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-fill px-2 py-1">
              <FileImage className="h-3.5 w-3.5" />
              JPEG, PNG, WebP, GIF
            </span>
            <span className="rounded-lg bg-fill px-2 py-1">
              Max {maxSizeMB}MB each
            </span>
            <span className="rounded-lg bg-fill px-2 py-1">
              Up to {maxFiles} files
            </span>
          </div>
        </label>
      </m.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={Spring.presets.smooth}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 rounded-lg bg-red/10 px-3 py-2 text-sm text-red">
              <i className="i-mingcute-warning-fill h-4 w-4" />
              {error}
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-auto rounded p-0.5 hover:bg-red/10"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Image previews */}
      <AnimatePresence mode="popLayout">
        {images.length > 0 && (
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={Spring.presets.smooth}
            className="space-y-3"
          >
            {/* Header with count and clear button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text">
                  {images.length} {images.length === 1 ? 'image' : 'images'}{' '}
                  selected
                </span>
                <span className="text-xs text-text-tertiary">
                  (
                  {formatFileSize(
                    images.reduce((sum, img) => sum + img.size, 0),
                  )}{' '}
                  total)
                </span>
              </div>
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-text-secondary hover:text-red transition-colors"
              >
                Clear all
              </button>
            </div>

            {/* Image grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              <AnimatePresence mode="popLayout">
                {images.map((image, index) => (
                  <m.div
                    key={image.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      ...Spring.presets.snappy,
                      delay: index * 0.02,
                    }}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-fill"
                  >
                    <img
                      src={image.previewUrl}
                      alt={image.name}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-red text-white transition-transform hover:scale-110"
                        aria-label={`Remove ${image.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* File info at bottom */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                      <p className="truncate text-xs font-medium text-white">
                        {image.name}
                      </p>
                      <p className="text-[10px] text-white/70">
                        {formatFileSize(image.size)}
                      </p>
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
