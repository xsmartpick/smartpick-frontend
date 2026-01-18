import { CheckCircle2, PartyPopper, Save } from 'lucide-react'
import { m } from 'motion/react'

import { Button } from '~/components/ui/button'
import { Spring } from '~/lib/spring'

interface LabelingCompleteProps {
  totalLabeled: number
  onSave: () => void
  onReview: () => void
}

/**
 * Celebration overlay shown when all images have been labeled
 */
export function LabelingComplete({
  totalLabeled,
  onSave,
  onReview,
}: LabelingCompleteProps) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={Spring.presets.smooth}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <m.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ ...Spring.presets.bouncy, delay: 0.1 }}
        className="mx-4 max-w-md rounded-2xl border border-green/20 bg-background p-8 shadow-2xl shadow-green/10"
      >
        {/* Celebration icon */}
        <m.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ ...Spring.presets.bouncy, delay: 0.2 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green/10"
        >
          <PartyPopper className="h-10 w-10 text-green" />
        </m.div>

        {/* Title */}
        <m.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...Spring.presets.smooth, delay: 0.3 }}
          className="mb-2 text-center text-2xl font-bold text-text"
        >
          All Done! 🎉
        </m.h2>

        {/* Description */}
        <m.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...Spring.presets.smooth, delay: 0.4 }}
          className="mb-6 text-center text-text-secondary"
        >
          You've successfully labeled all {totalLabeled} images.
        </m.p>

        {/* Stats */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...Spring.presets.smooth, delay: 0.5 }}
          className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-green/10 px-4 py-3"
        >
          <CheckCircle2 className="h-5 w-5 text-green" />
          <span className="font-medium text-green">
            {totalLabeled} image{totalLabeled === 1 ? '' : 's'} labeled
          </span>
        </m.div>

        {/* Actions */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...Spring.presets.smooth, delay: 0.6 }}
          className="flex flex-col gap-3"
        >
          <Button variant="primary" onClick={onSave} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save & Submit
          </Button>
          <Button variant="secondary" onClick={onReview} className="w-full">
            Review Labels
          </Button>
        </m.div>
      </m.div>
    </m.div>
  )
}
