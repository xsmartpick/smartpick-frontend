import {
  Archive,
  Calendar,
  CheckCircle,
  FolderKanban,
  ImageIcon,
  Layers,
  MoreHorizontal,
  Trash2,
} from 'lucide-react'
import { m } from 'motion/react'
import { useState } from 'react'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu/DropdownMenu'
import { cn } from '~/lib/cn'
import { formatDate, relativeTime } from '~/lib/date-utils'
import { Spring } from '~/lib/spring'

import type { Project, ProjectStatus } from '../types'

interface ProjectCardProps {
  project: Project
  onDelete?: (id: string) => void
  onStatusChange?: (id: string, status: ProjectStatus) => void
  onClick?: (project: Project) => void
  className?: string
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

function getGradientColors(status: ProjectStatus) {
  switch (status) {
    case 'completed': {
      return 'from-green/20 to-emerald-500/20'
    }
    case 'archived': {
      return 'from-text-tertiary/10 to-text-tertiary/5'
    }
    default: {
      return 'from-accent/20 to-violet-500/20'
    }
  }
}

export function ProjectCard({
  project,
  onDelete,
  onStatusChange,
  onClick,
  className,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const { stats } = project
  const progressPercent =
    stats.totalImages > 0
      ? Math.round((stats.labeledImages / stats.totalImages) * 100)
      : 0

  return (
    <m.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={Spring.presets.smooth}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-background transition-all duration-200',
        'hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5',
        onClick && 'cursor-pointer',
        project.status === 'archived' && 'opacity-75',
        className,
      )}
      onClick={() => onClick?.(project)}
    >
      {/* Header with gradient */}
      <div
        className={cn(
          'relative h-24 bg-gradient-to-br',
          getGradientColors(project.status),
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <m.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={Spring.presets.smooth}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/80 backdrop-blur-sm"
          >
            <FolderKanban className="h-6 w-6 text-text" />
          </m.div>
        </div>

        {/* Status badge */}
        <div className="absolute right-3 top-3">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
              getStatusColor(project.status),
            )}
          >
            {getStatusLabel(project.status)}
          </span>
        </div>

        {/* Hover overlay */}
        <m.div
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-text">
              {project.name}
            </h3>
            {project.description && (
              <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                {project.description}
              </p>
            )}
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 shrink-0 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onStatusChange && project.status !== 'completed' && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusChange(project.id, 'completed')
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Completed
                </DropdownMenuItem>
              )}
              {onStatusChange && project.status !== 'archived' && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusChange(project.id, 'archived')
                  }}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Project
                </DropdownMenuItem>
              )}
              {onStatusChange && project.status !== 'active' && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onStatusChange(project.id, 'active')
                  }}
                >
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Set as Active
                </DropdownMenuItem>
              )}
              {(onStatusChange || onDelete) && <DropdownMenuSeparator />}
              {onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(project.id)
                  }}
                  className="text-red focus:text-red"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Project
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex items-center gap-4 text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-text-tertiary" />
            <span>{stats.totalBatches} batches</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-text-tertiary" />
            <span>{stats.totalImages} images</span>
          </div>
        </div>

        {/* Progress bar */}
        {stats.totalImages > 0 && (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-text-secondary">Labeling Progress</span>
              <span className="font-medium text-text">{progressPercent}%</span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-fill">
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
        )}

        {/* Date info */}
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <div
            className="flex items-center gap-1 text-xs text-text-tertiary"
            title={formatDate(project.createdAt)}
          >
            <Calendar className="h-3.5 w-3.5" />
            {relativeTime(project.createdAt)}
          </div>
          {stats.pendingTasks > 0 && (
            <span className="text-xs text-amber">
              {stats.pendingTasks} pending tasks
            </span>
          )}
        </div>
      </div>
    </m.div>
  )
}
