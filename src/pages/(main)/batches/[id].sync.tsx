import { m } from 'motion/react'

import { useReadonlyRouteSelector } from '~/atoms/route'
import { ErrorState } from '~/components/common'
import { Spring } from '~/lib/spring'
import { BatchDetails } from '~/modules/batches/components/BatchDetails'
import type { Batch } from '~/modules/batches/types'

// Mock data for UI-only implementation
const mockBatch: Batch = {
  id: 'mock-batch-1',
  name: 'Sample Batch',
  description: 'This is a sample batch for UI development',
  status: 'completed',
  imageCount: 12,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  images: [
    {
      id: 'img-1',
      name: 'image-001.jpg',
      size: 245760,
      contentType: 'image/jpeg',
      uploadStatus: 'uploaded',
      downloadUrl: 'https://picsum.photos/400/400?random=1',
    },
    {
      id: 'img-2',
      name: 'image-002.jpg',
      size: 189440,
      contentType: 'image/jpeg',
      uploadStatus: 'uploaded',
      downloadUrl: 'https://picsum.photos/400/400?random=2',
    },
    {
      id: 'img-3',
      name: 'image-003.jpg',
      size: 312320,
      contentType: 'image/jpeg',
      uploadStatus: 'uploaded',
      downloadUrl: 'https://picsum.photos/400/400?random=3',
    },
    {
      id: 'img-4',
      name: 'image-004.jpg',
      size: 198656,
      contentType: 'image/jpeg',
      uploadStatus: 'processing',
      downloadUrl: 'https://picsum.photos/400/400?random=4',
    },
    {
      id: 'img-5',
      name: 'image-005.jpg',
      size: 223232,
      contentType: 'image/jpeg',
      uploadStatus: 'uploaded',
      downloadUrl: 'https://picsum.photos/400/400?random=5',
    },
    {
      id: 'img-6',
      name: 'image-006.jpg',
      size: 267264,
      contentType: 'image/jpeg',
      uploadStatus: 'uploaded',
      downloadUrl: 'https://picsum.photos/400/400?random=6',
    },
    {
      id: 'img-7',
      name: 'image-007.jpg',
      size: 201728,
      contentType: 'image/jpeg',
      uploadStatus: 'uploaded',
      downloadUrl: 'https://picsum.photos/400/400?random=7',
    },
    {
      id: 'img-8',
      name: 'image-008.jpg',
      size: 289792,
      contentType: 'image/jpeg',
      uploadStatus: 'failed',
      downloadUrl: 'https://picsum.photos/400/400?random=8',
    },
    {
      id: 'img-9',
      name: 'image-009.jpg',
      size: 234496,
      contentType: 'image/jpeg',
      uploadStatus: 'uploaded',
      downloadUrl: 'https://picsum.photos/400/400?random=9',
    },
    {
      id: 'img-10',
      name: 'image-010.jpg',
      size: 256000,
      contentType: 'image/jpeg',
      uploadStatus: 'uploaded',
      downloadUrl: 'https://picsum.photos/400/400?random=10',
    },
    {
      id: 'img-11',
      name: 'image-011.jpg',
      size: 221184,
      contentType: 'image/jpeg',
      uploadStatus: 'uploaded',
      downloadUrl: 'https://picsum.photos/400/400?random=11',
    },
    {
      id: 'img-12',
      name: 'image-012.jpg',
      size: 278528,
      contentType: 'image/jpeg',
      uploadStatus: 'uploaded',
      downloadUrl: 'https://picsum.photos/400/400?random=12',
    },
  ],
}

export const Component = () => {
  const batchId = useReadonlyRouteSelector((r) => r.params.id)

  // For UI-only implementation, use mock data
  // TODO: Replace with real API call when backend is ready
  const batch = mockBatch

  if (!batch) {
    return (
      <div className="min-h-screen bg-background">
        <ErrorState
          title="Batch not found"
          message={`Batch with ID "${batchId}" could not be found.`}
        />
      </div>
    )
  }

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={Spring.presets.smooth}
    >
      <BatchDetails batch={batch} />
    </m.div>
  )
}
