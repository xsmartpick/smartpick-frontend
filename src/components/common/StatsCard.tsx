import { m } from 'motion/react'

import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'

interface StatsCardProps {
  icon: React.ReactNode
  iconClassName?: string
  value: React.ReactNode
  label: string
  delay?: number
}

export function StatsCard({
  icon,
  iconClassName,
  value,
  label,
  delay = 0,
}: StatsCardProps) {
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
