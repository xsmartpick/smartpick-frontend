import { Save } from 'lucide-react'
import { m } from 'motion/react'

import { Button } from '~/components/ui/button'
import { useMobile } from '~/hooks/common/useMobile'
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'

interface LabelingHeaderProps {
  progress: {
    current: number
    total: number
    labeled: number
    percentage: number
  }
  assignmentCount: number
  onSave: () => void
}

export function LabelingHeader({
  progress,
  assignmentCount,
  onSave,
}: LabelingHeaderProps) {
  const isMobile = useMobile()

  return (
    <div className="sticky top-0 z-50 border-b border-border bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div
        className={cn(
          'mx-auto flex max-w-[1800px] items-center justify-between gap-4',
          isMobile ? 'px-3 py-2' : 'px-6 py-3',
        )}
      >
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold text-text">Label Images</h1>
            <p className="text-xs text-text-secondary">
              Image {progress.current} of {progress.total}
            </p>
          </div>

          {/* Progress bar */}
          <div
            className={cn(
              'hidden',
              isMobile ? 'lg:block w-32' : 'md:block w-48',
            )}
          >
            <div className="mb-1 flex items-center justify-between text-xs text-text-secondary">
              <span>{progress.labeled} labeled</span>
              <span>{Math.round(progress.percentage)}%</span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-fill">
              <m.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={Spring.presets.smooth}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={onSave}
            className="hidden sm:flex"
          >
            <Save className="mr-2 h-4 w-4" />
            Save (⌘S)
          </Button>
          <div className="text-xs text-text-tertiary">
            {assignmentCount} assignment{assignmentCount === 1 ? '' : 's'}
          </div>
        </div>
      </div>
    </div>
  )
}
