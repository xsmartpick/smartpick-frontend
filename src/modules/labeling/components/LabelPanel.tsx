import { Check } from 'lucide-react'
import { m } from 'motion/react'

import { useMobile } from '~/hooks/common/useMobile'
import { cn } from '~/lib/cn'
import { Spring } from '~/lib/spring'
import type { Label } from '~/modules/label-sets/api'

interface LabelPanelProps {
  labels: Label[]
  selectedLabelIds: string[]
  onLabelSelect: (labelId: string) => void
  className?: string
}

export function LabelPanel({
  labels,
  selectedLabelIds,
  onLabelSelect,
  className,
}: LabelPanelProps) {
  const isMobile = useMobile()
  const labelsWithSelection = labels.map((label) => ({
    ...label,
    isSelected: selectedLabelIds.includes(label.id),
  }))

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background',
        className,
      )}
    >
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-text">Labels</h3>
        {!isMobile && (
          <p className="mt-1 text-xs text-text-secondary">
            Select one or more labels for this image
          </p>
        )}
      </div>

      {/* Mobile: Compact grid layout - no scrolling */}
      {isMobile ? (
        <div className="flex-1 overflow-visible p-3">
          <div className="grid grid-cols-2 gap-2 auto-rows-fr">
            {labelsWithSelection.map((label, index) => (
              <m.button
                key={label.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  ...Spring.presets.smooth,
                  delay: index * 0.02,
                }}
                onClick={() => onLabelSelect(label.id)}
                className={cn(
                  'group relative flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-all duration-200',
                  'active:scale-95',
                  label.isSelected
                    ? 'border-accent bg-accent/10 shadow-sm'
                    : 'border-border bg-fill/50',
                )}
              >
                {/* Color indicator */}
                {label.color && (
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: label.color }}
                  />
                )}

                {/* Label name - truncated if too long */}
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-text">
                  {label.name}
                </span>

                {/* Selection indicator */}
                {label.isSelected && (
                  <m.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={Spring.presets.bouncy}
                    className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-accent text-background"
                  >
                    <Check className="h-2 w-2" />
                  </m.div>
                )}
              </m.button>
            ))}
          </div>
        </div>
      ) : (
        /* Desktop: Vertical list */
        <>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {labelsWithSelection.map((label, index) => (
                <m.button
                  key={label.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    ...Spring.presets.smooth,
                    delay: index * 0.03,
                  }}
                  onClick={() => onLabelSelect(label.id)}
                  className={cn(
                    'group relative flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-200',
                    'hover:border-accent/50 hover:shadow-sm',
                    label.isSelected
                      ? 'border-accent bg-accent/10 shadow-sm'
                      : 'border-border bg-fill/50',
                  )}
                >
                  {/* Color indicator */}
                  {label.color && (
                    <div
                      className="h-4 w-4 shrink-0 rounded-full border border-border/50"
                      style={{ backgroundColor: label.color }}
                    />
                  )}

                  {/* Label info */}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-text">{label.name}</div>
                    {label.description && (
                      <div className="mt-0.5 text-xs text-text-secondary">
                        {label.description}
                      </div>
                    )}
                  </div>

                  {/* Selection indicator */}
                  {label.isSelected && (
                    <m.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={Spring.presets.bouncy}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-background"
                    >
                      <Check className="h-3 w-3" />
                    </m.div>
                  )}

                  {/* Keyboard shortcut hint */}
                  <div className="absolute right-2 top-2 text-xs text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100">
                    {index < 9 ? index + 1 : ''}
                  </div>
                </m.button>
              ))}
            </div>
          </div>

          {/* Help text - Desktop only */}
          <div className="border-t border-border px-4 py-3">
            <div className="text-xs text-text-tertiary">
              <div className="mb-1 font-medium text-text-secondary">
                Shortcuts:
              </div>
              <div>• Press 1-9 to select labels</div>
              <div>• Click to toggle selection</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
