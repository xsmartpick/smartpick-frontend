import type { ReactNode } from 'react'

import { cn } from '~/lib/cn'

export interface StateContainerProps {
  icon?: ReactNode
  iconBackground?: string
  title?: string
  message?: string
  action?: ReactNode
  className?: string
  children?: ReactNode
}

/**
 * Base container for feedback states (empty, error, loading, etc.)
 * Provides consistent layout and styling for centered state displays.
 */
export function StateContainer({
  icon,
  iconBackground = 'bg-fill',
  title,
  message,
  action,
  className,
  children,
}: StateContainerProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            'mb-4 flex h-12 w-12 items-center justify-center rounded-full',
            iconBackground,
          )}
        >
          {icon}
        </div>
      )}
      {title && (
        <div className="mb-2 text-lg font-semibold text-text">{title}</div>
      )}
      {message && (
        <div className="mb-4 max-w-md text-sm text-text-secondary">
          {message}
        </div>
      )}
      {children}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
