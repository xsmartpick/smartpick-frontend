// Batches Management Page - Compatible with main UI
// Author: FemtoHell for SMAR-40

import { Package, Plus } from 'lucide-react'
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
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { BatchList } from '~/modules/batches/components/BatchList'
import { useCreateBatch } from '~/modules/batches/hooks'

export function Component() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const createBatch = useCreateBatch()

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Validation error', {
        description: 'Batch name is required',
      })
      return
    }

    try {
      await createBatch.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      })

      toast.success('Batch created successfully', {
        description: `"${name}" has been created.`,
      })

      // Reset form
      setName('')
      setDescription('')
      setOpen(false)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create batch'
      toast.error('Creation failed', {
        description: errorMessage,
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            Batch Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your image batches for processing
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              New Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Batch</DialogTitle>
              <DialogDescription>
                Add a new batch to organize your images
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter batch name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Enter batch description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" disabled={createBatch.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={createBatch.isPending}
              >
                {createBatch.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Batch List */}
      <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">All Batches</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          View and manage your batch collection
        </p>
        <BatchList />
      </div>
    </div>
  )
}
