import { m } from 'motion/react'

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
      <div className="min-h-screen bg-background">
        <ErrorState
          title="Failed to load batch"
          message={error.message}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

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
