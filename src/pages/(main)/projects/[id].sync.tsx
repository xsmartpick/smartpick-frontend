import { ArrowLeft } from 'lucide-react'
import { m } from 'motion/react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useReadonlyRouteSelector } from '~/atoms/route'
import { ErrorState, LoadingState } from '~/components/common'
import { Spring } from '~/lib/spring'
import type { Project } from '~/modules/projects'
import { useProject } from '~/modules/projects'
import { ProjectDetails } from '~/modules/projects/components/ProjectDetails'

export const Component = () => {
  const { t } = useTranslation()
  const projectId = useReadonlyRouteSelector((r) => r.params.id)
  const { data: project, isLoading, error, refetch } = useProject(projectId)
  const [localProject, setLocalProject] = useState<Project | null>(null)

  // Use local state if available (for optimistic updates), otherwise use query data
  const displayProject = localProject || project

  const handleUpdated = useCallback((updated: Project) => {
    setLocalProject(updated)
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState message={t('pages.loading.project')} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <BackLink />
        <div className="mt-8">
          <ErrorState
            title={t('pages.error.project')}
            message={error.message}
            onRetry={() => refetch()}
          />
        </div>
      </div>
    )
  }

  if (!displayProject) {
    return (
      <div className="min-h-screen bg-background p-6">
        <BackLink />
        <div className="mt-8">
          <ErrorState
            title={t('pages.error.notFound.project')}
            message={t('pages.error.notFound.projectMessage', {
              id: projectId ?? '',
            })}
          />
        </div>
      </div>
    )
  }

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={Spring.presets.smooth}
      className="min-h-screen bg-background"
    >
      <ProjectDetails project={displayProject} onUpdated={handleUpdated} />
    </m.div>
  )
}

function BackLink() {
  const { t } = useTranslation()
  return (
    <Link
      to="/projects"
      className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text"
    >
      <ArrowLeft className="h-4 w-4" />
      {t('pages.backLinks.projects')}
    </Link>
  )
}
