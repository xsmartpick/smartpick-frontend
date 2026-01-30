import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

import { TaskLabelingPage } from '~/modules/labeling/components/TaskLabelingPage'

/**
 * Labeling page for a specific task
 * Route: /label/task/:taskId
 */
export const Component = () => {
  const { t } = useTranslation()
  const { taskId } = useParams<{ taskId: string }>()

  if (!taskId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-text-secondary">{t('label.taskLabeling.invalid')}</p>
      </div>
    )
  }

  return <TaskLabelingPage taskId={taskId} />
}
