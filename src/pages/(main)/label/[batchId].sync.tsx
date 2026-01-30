import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { BatchLabelingPage } from '~/modules/labeling'

/**
 * Labeling page for a specific batch
 * Route: /label/:batchId
 */
export const Component = () => {
  const { t } = useTranslation()
  const { batchId } = useParams<{ batchId: string }>()

  if (!batchId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-text-secondary">
          {t('label.batchLabeling.invalid')}
        </p>
      </div>
    )
  }

  return <BatchLabelingPage batchId={batchId} />
}
