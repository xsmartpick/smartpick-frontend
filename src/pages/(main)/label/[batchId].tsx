import { useParams } from 'react-router'

import { BatchLabelingPage } from '~/modules/labeling'

/**
 * Labeling page for a specific batch
 * Route: /label/:batchId
 */
export const Component = () => {
  const { batchId } = useParams<{ batchId: string }>()

  if (!batchId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-text-secondary">Invalid batch ID</p>
      </div>
    )
  }

  return <BatchLabelingPage batchId={batchId} />
}
