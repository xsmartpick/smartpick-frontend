import { ArrowLeft } from 'lucide-react'
import { m } from 'motion/react'
import { Link } from 'react-router'

import { useReadonlyRouteSelector } from '~/atoms/route'
import { ErrorState, LoadingState } from '~/components/common'
import { Spring } from '~/lib/spring'
import { useBatch } from '~/modules/batches'
import { BatchDetails } from '~/modules/batches/components/BatchDetails'

export const Component = () => {
  const batchId = useReadonlyRouteSelector((r) => r.params.id)
  const { data: batch, isLoading, error, refetch } = useBatch(batchId)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState message="Loading batch..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <BackLink />
        <div className="mt-8">
          <ErrorState
            title="Failed to load batch"
            message={error.message}
            onRetry={() => refetch()}
          />
        </div>
      </div>
    )
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-background p-6">
        <BackLink />
        <div className="mt-8">
          <ErrorState
            title="Batch not found"
            message={`Batch with ID "${batchId}" could not be found.`}
          />
        </div>
      </div>
    )
  }

  // BatchDetails has its own sticky header with back button, so we don't need the outer wrapper
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={Spring.presets.smooth}
      className="min-h-screen bg-background"
    >
      <BatchDetails batch={batch} />
    </m.div>
  )
}

function BackLink() {
  return (
    <Link
      to="/batches"
      className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to batches
    </Link>
  )
}
