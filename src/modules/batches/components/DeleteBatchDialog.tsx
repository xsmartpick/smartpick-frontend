// Delete Batch Confirmation Dialog
// Author: FemtoHell for SMAR-40

import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog/Dialog'

import { useDeleteBatch } from '../hooks'

interface DeleteBatchDialogProps {
  batchId: string
  batchName: string
}

/**
 * Delete Batch Dialog Component
 * Shows confirmation dialog before deleting a batch
 * Implements soft delete via backend API
 */
export function DeleteBatchDialog({
  batchId,
  batchName,
}: DeleteBatchDialogProps) {
  const [open, setOpen] = useState(false)
  const deleteBatch = useDeleteBatch()

  const handleDelete = async () => {
    try {
      await deleteBatch.mutateAsync(batchId)
      toast.success('Batch deleted successfully', {
        description: `"${batchName}" has been removed.`,
      })
      setOpen(false)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete batch'
      toast.error('Delete failed', {
        description: errorMessage,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          title="Delete batch"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Batch</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this batch?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm">
            Batch: <span className="font-semibold">{batchName}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This action will soft delete the batch. It can be recovered by
            administrators if needed.
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={deleteBatch.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteBatch.isPending}
          >
            {deleteBatch.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
