import { CheckCircle2 } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'

import { useMobile } from '~/hooks/common/useMobile'
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'

interface LabelingStatusIndicatorProps {
  isVisible: boolean
  labelCount: number
}

export function LabelingStatusIndicator({
  isVisible,
  labelCount,
}: LabelingStatusIndicatorProps) {
  const isMobile = useMobile()

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={Spring.presets.smooth}
          className={cn(
            'fixed left-1/2 -translate-x-1/2 rounded-lg border border-accent/20 bg-accent/10 px-4 py-2 shadow-lg backdrop-blur-sm',
            isMobile
              ? 'top-20' // Above the label panel on mobile
              : 'bottom-6', // Bottom center on desktop
          )}
        >
          <div className="flex items-center gap-2 text-sm text-text">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            <span>
              {labelCount} label{labelCount === 1 ? '' : 's'} assigned
            </span>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
