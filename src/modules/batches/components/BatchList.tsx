// BatchList Component - Compatible with main UI
// Author: FemtoHell for SMAR-40

import { Loader2, Package } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'

import { useBatches } from '../hooks'
import type { Batch } from '../types'
import { DeleteBatchDialog } from './DeleteBatchDialog'

/**
 * Format date string to readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Batch List Component
 * Displays all batch metadata with delete functionality
 */
export function BatchList() {
  const { data: batches, isLoading, error } = useBatches()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-red-500">
          Failed to load batches: {error.message}
        </p>
      </div>
    )
  }

  if (!batches || batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          No batches found. Create your first batch to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Images</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.map((batch: Batch) => (
            <TableRow key={batch.id}>
              <TableCell className="font-medium">{batch.name}</TableCell>
              <TableCell className="max-w-md truncate">
                {batch.description || '—'}
              </TableCell>
              <TableCell>
                {/* FemtoHell: datasetId chưa có trong Batch type hiện tại, comment để tránh lỗi */}
                {/* {batch.datasetId ? (
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {batch.datasetId.slice(0, 8)}...
                  </span>
                ) : (
                  <span className="text-gray-500">Not assigned</span>
                )} */}
                <span className="text-xs text-gray-500">
                  {batch.imageCount} images
                </span>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {formatDate(batch.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // TODO: Navigate to batch details page
                      // window.location.href = `/batches/${batch.id}`
                    }}
                  >
                    View
                  </Button>
                  <DeleteBatchDialog
                    batchId={batch.id}
                    batchName={batch.name}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
