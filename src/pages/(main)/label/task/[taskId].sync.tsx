import { useParams } from 'react-router'

import { TaskLabelingPage } from '~/modules/labeling/components/TaskLabelingPage'

/**
 * Labeling page for a specific task
 * Route: /label/task/:taskId
 */
export const Component = () => {
  const { taskId } = useParams<{ taskId: string }>()

  if (!taskId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-text-secondary">Invalid task ID</p>
      </div>
    )
  }

  return <TaskLabelingPage taskId={taskId} />
}
