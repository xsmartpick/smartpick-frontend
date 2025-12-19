import { m } from 'motion/react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Spring } from '~/lib/spring'

type Dataset = {
  id: string
  name: string
  description: string
  media: string
  createdAt: string
  createdBy: string
  updatedAt: string
}

const mockDatasets: Dataset[] = [
  {
    id: '5a5c40b9-4b33-42eb-b2d0-e4921360bf36',
    name: 'cashew-images-v1',
    description: 'Cashew image dataset (v1)',
    media: 'image',
    createdAt: '2025-12-18T16:58:25.572391Z',
    createdBy: 'aabfa0d6-b3be-4bf5-9d28-cc4956643625',
    updatedAt: '2025-12-18T16:58:25.572391Z',
  },
  {
    id: 'ad946ffb-7280-408b-b7e4-8f94e65fb015',
    name: 'Cashew Dataset #1',
    description: 'Cashew Dataset #1',
    media: 'image',
    createdAt: '2025-12-18T18:34:58.765709Z',
    createdBy: 'aabfa0d6-b3be-4bf5-9d28-cc4956643625',
    updatedAt: '2025-12-18T18:34:58.765709Z',
  },
]

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

function relativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 10) return 'just now'
  if (diffSec < 60) return `${diffSec}s ago`
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  return formatDate(dateString)
}

export const Component = () => {
  // TODO: replace with actual datasets
  const datasets = mockDatasets

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={Spring.presets.smooth}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text mb-2">Datasets</h1>
            <p className="text-text-secondary">
              Manage your datasets here. View and organize your data
              collections.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <Table variant="hover">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Media Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datasets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-text-tertiary py-8"
                    >
                      No datasets found
                    </TableCell>
                  </TableRow>
                ) : (
                  datasets.map((dataset) => (
                    <TableRow key={dataset.id} variant="clickable">
                      <TableCell className="font-medium text-text">
                        {dataset.name}
                      </TableCell>
                      <TableCell className="text-text-secondary">
                        {dataset.description || '—'}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full border border-border bg-fill px-2 py-0.5 text-xs font-medium text-text">
                          {dataset.media}
                        </span>
                      </TableCell>
                      <TableCell
                        className="text-text-secondary"
                        title={formatDate(dataset.createdAt)}
                      >
                        {relativeTime(dataset.createdAt)}
                      </TableCell>
                      <TableCell
                        className="text-text-secondary"
                        title={formatDate(dataset.updatedAt)}
                      >
                        {relativeTime(dataset.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </m.div>
      </div>
    </div>
  )
}
