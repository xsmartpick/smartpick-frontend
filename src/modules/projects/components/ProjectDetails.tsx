import {
  Archive,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Edit3,
  FolderKanban,
  ImageIcon,
  Layers,
  ListTodo,
  MoreHorizontal,
  Trash2,
  User,
  Users,
} from 'lucide-react'
import { m } from 'motion/react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { getStableRouterNavigate } from '~/atoms/route'
import { Button } from '~/components/ui/button'
import { Divider } from '~/components/ui/divider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu/DropdownMenu'
import { ScrollArea } from '~/components/ui/scroll-areas/ScrollArea'
import { useMobile } from '~/hooks/common'
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'

import { useDeleteProject, useUpdateProject } from '../hooks'
import type { Project, ProjectEvent, ProjectStatus } from '../types'
import { EditProjectModal } from './EditProjectModal'

interface ProjectDetailsProps {
  project: Project
  onUpdated?: (project: Project) => void
}

function getStatusColor(status: ProjectStatus) {
  switch (status) {
    case 'completed': {
      return 'bg-green/10 text-green border-green/20'
    }
    case 'archived': {
      return 'bg-text-tertiary/10 text-text-tertiary border-border'
    }
    default: {
      return 'bg-accent/10 text-accent border-accent/20'
    }
  }
}

function getStatusLabel(status: ProjectStatus) {
  switch (status) {
    case 'completed': {
      return 'Completed'
    }
    case 'archived': {
      return 'Archived'
    }
    default: {
      return 'Active'
    }
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '—'
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  return `${(seconds / 3600).toFixed(1)}h`
}

function getEventIcon(type: ProjectEvent['type']) {
  switch (type) {
    case 'created':
      return <FolderKanban className="h-3.5 w-3.5" />
    case 'updated':
      return <Edit3 className="h-3.5 w-3.5" />
    case 'status_changed':
      return <CheckCircle className="h-3.5 w-3.5" />
    case 'batch_added':
    case 'batch_removed':
      return <Layers className="h-3.5 w-3.5" />
    case 'task_completed':
      return <ListTodo className="h-3.5 w-3.5" />
    case 'member_added':
    case 'member_removed':
      return <Users className="h-3.5 w-3.5" />
    default:
      return <Clock className="h-3.5 w-3.5" />
  }
}

export function ProjectDetails({ project, onUpdated }: ProjectDetailsProps) {
  const navigate = getStableRouterNavigate()
  const isMobile = useMobile()
  const deleteProjectMutation = useDeleteProject()
  const updateProjectMutation = useUpdateProject()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { stats } = project
  const progressPercent =
    stats.totalImages > 0
      ? Math.round((stats.labeledImages / stats.totalImages) * 100)
      : 0

  const taskProgressPercent =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0

  const handleBack = useCallback(() => {
    if (navigate) navigate('/projects', { replace: false })
  }, [navigate])

  const handleDelete = useCallback(async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this project? This action cannot be undone.',
    )
    if (!confirmed) return

    try {
      await deleteProjectMutation.mutateAsync(project.id)
      toast.success('Project deleted successfully')
      if (navigate) navigate('/projects', { replace: true })
    } catch (error) {
      console.error('Failed to delete project:', error)
      toast.error('Failed to delete project', {
        description:
          error instanceof Error
            ? error.message
            : 'An error occurred while deleting the project.',
      })
    }
  }, [project.id, deleteProjectMutation, navigate])

  const handleStatusChange = useCallback(
    async (status: ProjectStatus) => {
      try {
        const updated = await updateProjectMutation.mutateAsync({
          id: project.id,
          data: { status },
        })
        toast.success(
          `Project ${status === 'archived' ? 'archived' : status === 'completed' ? 'completed' : 'activated'} successfully`,
        )
        onUpdated?.(updated)
      } catch (error) {
        console.error('Failed to update project:', error)
        toast.error('Failed to update project status')
      }
    },
    [project.id, updateProjectMutation, onUpdated],
  )

  const handleEditSubmit = useCallback(
    async (data: { name: string; description?: string }) => {
      try {
        const updated = await updateProjectMutation.mutateAsync({
          id: project.id,
          data,
        })
        setIsEditModalOpen(false)
        toast.success('Project updated successfully')
        onUpdated?.(updated)
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
    [project.id, updateProjectMutation, onUpdated],
  )

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div
          className={cn(
            'mx-auto max-w-6xl',
            isMobile ? 'px-3 py-2.5' : 'px-6 py-4',
          )}
        >
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-9 w-9 shrink-0 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-violet-500 text-white">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h1
                    className={cn(
                      'truncate font-semibold text-text',
                      isMobile ? 'text-base' : 'text-xl',
                    )}
                  >
                    {project.name}
                  </h1>
                  {!isMobile && project.description && (
                    <p className="mt-0.5 truncate text-sm text-text-secondary">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {!isMobile && (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
                    getStatusColor(project.status),
                  )}
                >
                  {getStatusLabel(project.status)}
                </span>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
                className="hidden sm:inline-flex"
              >
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 shrink-0 p-0"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setIsEditModalOpen(true)}
                    className="sm:hidden"
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Project
                  </DropdownMenuItem>
                  {project.status !== 'completed' && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('completed')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Completed
                    </DropdownMenuItem>
                  )}
                  {project.status !== 'archived' && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('archived')}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive Project
                    </DropdownMenuItem>
                  )}
                  {project.status !== 'active' && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange('active')}
                    >
                      <FolderKanban className="mr-2 h-4 w-4" />
                      Set as Active
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red focus:text-red"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={Spring.presets.smooth}
        >
          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={<Layers className="h-5 w-5" />}
              iconClassName="bg-accent/10 text-accent"
              value={stats.totalBatches}
              label="Batches"
              delay={0.05}
            />
            <StatCard
              icon={<ImageIcon className="h-5 w-5" />}
              iconClassName="bg-violet-500/10 text-violet-500"
              value={stats.totalImages}
              label="Images"
              delay={0.1}
            />
            <StatCard
              icon={<ListTodo className="h-5 w-5" />}
              iconClassName="bg-fuchsia-500/10 text-fuchsia-500"
              value={`${stats.completedTasks}/${stats.totalTasks}`}
              label="Tasks"
              delay={0.15}
            />
            <StatCard
              icon={<Users className="h-5 w-5" />}
              iconClassName="bg-amber/10 text-amber"
              value={stats.labelerCount ?? 0}
              label="Labelers"
              delay={0.2}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Progress Section */}
              <section className="rounded-2xl border border-border bg-background p-6">
                <h2 className="mb-4 text-base font-semibold text-text">
                  Progress
                </h2>
                <div className="space-y-5">
                  {/* Image labeling progress */}
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-text-secondary">
                        Image Labeling
                      </span>
                      <span className="font-medium text-text">
                        {stats.labeledImages}/{stats.totalImages} (
                        {progressPercent}%)
                      </span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-fill">
                      <m.div
                        className={cn(
                          'h-full rounded-full',
                          progressPercent === 100 ? 'bg-green' : 'bg-accent',
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={Spring.presets.smooth}
                      />
                    </div>
                  </div>

                  {/* Task completion progress */}
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-text-secondary">
                        Task Completion
                      </span>
                      <span className="font-medium text-text">
                        {stats.completedTasks}/{stats.totalTasks} (
                        {taskProgressPercent}%)
                      </span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-fill">
                      <m.div
                        className={cn(
                          'h-full rounded-full',
                          taskProgressPercent === 100
                            ? 'bg-green'
                            : 'bg-violet-500',
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${taskProgressPercent}%` }}
                        transition={{ ...Spring.presets.smooth, delay: 0.1 }}
                      />
                    </div>
                  </div>

                  {/* Average time */}
                  {stats.averageLabelingTime && (
                    <div className="flex items-center justify-between rounded-xl bg-fill/50 px-4 py-3">
                      <span className="text-sm text-text-secondary">
                        Avg. Labeling Time
                      </span>
                      <span className="font-mono text-sm font-medium text-text">
                        {formatDuration(stats.averageLabelingTime)}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {/* Description */}
              {project.description && (
                <section className="rounded-2xl border border-border bg-background p-6">
                  <h2 className="mb-3 text-base font-semibold text-text">
                    Description
                  </h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                    {project.description}
                  </p>
                </section>
              )}

              {/* Activity Timeline */}
              {project.events && project.events.length > 0 && (
                <section className="rounded-2xl border border-border bg-background">
                  <div className="border-b border-border p-6">
                    <h2 className="text-base font-semibold text-text">
                      Recent Activity
                    </h2>
                  </div>
                  <ScrollArea rootClassName="max-h-80">
                    <div className="p-6">
                      <div className="relative space-y-4">
                        {/* Timeline line */}
                        <div className="absolute bottom-0 left-[11px] top-0 w-px bg-border" />

                        {project.events.slice(0, 10).map((event, index) => (
                          <m.div
                            key={event.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              ...Spring.presets.smooth,
                              delay: index * 0.05,
                            }}
                            className="relative flex gap-3 pl-1"
                          >
                            <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fill text-text-secondary ring-4 ring-background">
                              {getEventIcon(event.type)}
                            </div>
                            <div className="flex-1 pt-0.5">
                              <p className="text-sm text-text">
                                {event.description}
                              </p>
                              <p className="mt-0.5 text-xs text-text-tertiary">
                                {event.userName && (
                                  <span className="font-medium">
                                    {event.userName} •{' '}
                                  </span>
                                )}
                                {formatDate(event.createdAt)}
                              </p>
                            </div>
                          </m.div>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info */}
              <section className="rounded-2xl border border-border bg-background p-6">
                <h2 className="mb-4 text-base font-semibold text-text">
                  Details
                </h2>
                <div className="space-y-4">
                  <InfoRow
                    icon={<FolderKanban className="h-4 w-4" />}
                    label="Status"
                    value={
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                          getStatusColor(project.status),
                        )}
                      >
                        {getStatusLabel(project.status)}
                      </span>
                    }
                  />

                  <Divider />

                  <InfoRow
                    icon={<Calendar className="h-4 w-4" />}
                    label="Created"
                    value={formatDate(project.createdAt)}
                  />

                  <Divider />

                  <InfoRow
                    icon={<Clock className="h-4 w-4" />}
                    label="Last Updated"
                    value={formatDate(project.updatedAt)}
                  />

                  <Divider />

                  <InfoRow
                    icon={<User className="h-4 w-4" />}
                    label="Created By"
                    value={project.createdByName || project.createdBy || '—'}
                  />

                  {project.updatedBy && (
                    <>
                      <Divider />
                      <InfoRow
                        icon={<User className="h-4 w-4" />}
                        label="Updated By"
                        value={project.updatedByName || project.updatedBy}
                      />
                    </>
                  )}
                </div>
              </section>

              {/* Technical Info */}
              <section className="rounded-2xl border border-border bg-background p-6">
                <h2 className="mb-4 text-base font-semibold text-text">
                  Technical
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-tertiary">
                      Project ID
                    </label>
                    <p className="break-all font-mono text-xs text-text-secondary">
                      {project.id}
                    </p>
                  </div>
                  <Divider />
                  <div>
                    <label className="mb-1 block text-xs font-medium text-text-tertiary">
                      Organization ID
                    </label>
                    <p className="break-all font-mono text-xs text-text-secondary">
                      {project.orgId}
                    </p>
                  </div>
                </div>
              </section>

              {/* Quick Actions */}
              <section className="rounded-2xl border border-border bg-background p-6">
                <h2 className="mb-4 text-base font-semibold text-text">
                  Actions
                </h2>
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    onClick={() =>
                      navigate && navigate(`/batches?project=${project.id}`)
                    }
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    View Batches
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    onClick={() =>
                      navigate && navigate(`/tasks?project=${project.id}`)
                    }
                  >
                    <ListTodo className="mr-2 h-4 w-4" />
                    View Tasks
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </m.div>
      </div>

      {/* Edit Modal */}
      <EditProjectModal
        open={isEditModalOpen}
        project={project}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        isLoading={updateProjectMutation.isPending}
      />
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  iconClassName: string
  value: string | number
  label: string
  delay?: number
}

function StatCard({
  icon,
  iconClassName,
  value,
  label,
  delay = 0,
}: StatCardProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...Spring.presets.smooth, delay }}
      className="rounded-2xl border border-border bg-gradient-to-br from-fill/50 to-transparent p-5"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            iconClassName,
          )}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-text">{value}</p>
          <p className="text-xs text-text-secondary">{label}</p>
        </div>
      </div>
    </m.div>
  )
}

interface InfoRowProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-text-tertiary">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-text-tertiary">{label}</p>
        <div className="mt-0.5 text-sm text-text">{value}</div>
      </div>
    </div>
  )
}
