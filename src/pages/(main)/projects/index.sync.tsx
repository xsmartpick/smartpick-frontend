import {
  CheckCircle,
  FolderKanban,
  ImageIcon,
  Layers,
  Plus,
  Search,
} from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { getStableRouterNavigate } from '~/atoms/route'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  StatsCard,
} from '~/components/common'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useKeyboardShortcut } from '~/hooks/common'
import { Spring } from '~/lib/spring'
import type { CreateProjectFormData, ProjectStatus } from '~/modules/projects'
import {
  CreateProjectModal,
  ProjectCard,
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from '~/modules/projects'

export const Component = () => {
  const { data: projects = [], isLoading, error, refetch } = useProjects()
  const createProjectMutation = useCreateProject()
  const deleteProjectMutation = useDeleteProject()
  const updateProjectMutation = useUpdateProject()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Keyboard shortcut: N to create new project
  useKeyboardShortcut({
    key: 'n',
    handler: () => setIsCreateModalOpen(true),
  })

  // Filter projects by search query
  const filteredProjects = !searchQuery.trim()
    ? projects
    : projects.filter((project) => {
        const query = searchQuery.toLowerCase()
        return (
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query)
        )
      })

  // Handle create project
  const handleCreateProject = useCallback(
    async (data: CreateProjectFormData) => {
      try {
        await createProjectMutation.mutateAsync({
          name: data.name,
          description: data.description || undefined,
        })

        setIsCreateModalOpen(false)
        toast.success('Project created successfully!', {
          description: `${data.name} has been created.`,
        })
      } catch (error) {
        console.error('Failed to create project:', error)
        toast.error('Failed to create project', {
          description:
            error instanceof Error
              ? error.message
              : 'An error occurred while creating the project.',
        })
      }
    },
    [createProjectMutation],
  )

  // Handle delete project
  const handleDeleteProject = useCallback(
    async (id: string) => {
      try {
        await deleteProjectMutation.mutateAsync(id)
        toast.success('Project deleted successfully')
      } catch (error) {
        console.error('Failed to delete project:', error)
        toast.error('Failed to delete project', {
          description:
            error instanceof Error
              ? error.message
              : 'An error occurred while deleting the project.',
        })
      }
    },
    [deleteProjectMutation],
  )

  // Handle status change
  const handleStatusChange = useCallback(
    async (id: string, status: ProjectStatus) => {
      try {
        await updateProjectMutation.mutateAsync({ id, data: { status } })
        toast.success(`Project ${status === 'archived' ? 'archived' : 'updated'} successfully`)
      } catch (error) {
        console.error('Failed to update project:', error)
        toast.error('Failed to update project', {
          description:
            error instanceof Error
              ? error.message
              : 'An error occurred while updating the project.',
        })
      }
    },
    [updateProjectMutation],
  )

  // Stats
  const stats = useMemo(() => {
    const totalBatches = projects.reduce(
      (sum, p) => sum + p.stats.totalBatches,
      0,
    )
    const totalImages = projects.reduce(
      (sum, p) => sum + p.stats.totalImages,
      0,
    )
    const completedProjects = projects.filter(
      (p) => p.status === 'completed',
    ).length
    const activeProjects = projects.filter((p) => p.status === 'active').length

    return { totalBatches, totalImages, completedProjects, activeProjects }
  }, [projects])

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Page Header */}
      <div className="border-b border-border bg-background/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-6">
          <div className="flex items-center gap-4">
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={Spring.presets.bouncy}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-violet-500 text-white shadow-lg shadow-accent/20"
            >
              <FolderKanban className="h-6 w-6" />
            </m.div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Projects</h1>
              <p className="text-sm text-text-secondary">
                Organize and manage your labeling projects
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-fill/50 px-3 py-2 text-xs text-text-tertiary md:flex">
              <span className="font-medium text-text">Shortcuts</span>
              <span className="rounded-md bg-fill px-1.5 py-0.5">N</span>
              <span>new</span>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              New project
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {isLoading ? (
          <LoadingState message="Loading projects..." />
        ) : error ? (
          <ErrorState
            title="Failed to load projects"
            message={error.message}
            onRetry={() => refetch()}
          />
        ) : (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={Spring.presets.smooth}
          >
            {/* Stats cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                icon={<FolderKanban className="h-5 w-5" />}
                iconClassName="bg-accent/10 text-accent"
                value={projects.length}
                label="Total Projects"
                delay={0.05}
              />
              <StatsCard
                icon={<Layers className="h-5 w-5" />}
                iconClassName="bg-violet-500/10 text-violet-500"
                value={stats.totalBatches}
                label="Total Batches"
                delay={0.1}
              />
              <StatsCard
                icon={<ImageIcon className="h-5 w-5" />}
                iconClassName="bg-fuchsia-500/10 text-fuchsia-500"
                value={stats.totalImages}
                label="Total Images"
                delay={0.15}
              />
              <StatsCard
                icon={<CheckCircle className="h-5 w-5" />}
                iconClassName="bg-green/10 text-green"
                value={stats.completedProjects}
                label="Completed"
                delay={0.2}
              />
            </div>

            {/* Search and filter bar */}
            <div className="mb-6 flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  type="search"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              </div>
            </div>

            {/* Projects grid or empty state */}
            {filteredProjects.length === 0 ? (
              <m.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={Spring.presets.smooth}
                className="rounded-2xl border border-border bg-background p-12"
              >
                {projects.length === 0 ? (
                  <EmptyState
                    icon={
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-violet-500/20 text-accent">
                        <FolderKanban className="h-8 w-8" />
                      </div>
                    }
                    title="No projects yet"
                    message="Create your first project to start organizing batches and managing labeling tasks."
                    action={
                      <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="primary"
                        className="mt-4"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create your first project
                      </Button>
                    }
                  />
                ) : (
                  <EmptyState
                    icon={
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-fill text-text-tertiary">
                        <Search className="h-8 w-8" />
                      </div>
                    }
                    title="No matching projects"
                    message={`No projects found matching "${searchQuery}"`}
                    action={
                      <Button
                        onClick={() => setSearchQuery('')}
                        variant="secondary"
                        className="mt-4"
                      >
                        Clear search
                      </Button>
                    }
                  />
                )}
              </m.div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onDelete={handleDeleteProject}
                      onStatusChange={handleStatusChange}
                      onClick={(p) => {
                        const navigate = getStableRouterNavigate()
                        if (navigate) navigate(`/projects/${p.id}`)
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </m.div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
        isLoading={createProjectMutation.isPending}
      />
    </div>
  )
}
