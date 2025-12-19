import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: ReactNode
  title?: string
  message?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title = 'No items found',
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 text-center ${className || ''}`}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-fill">
          {icon}
        </div>
      )}
      <div className="text-lg font-semibold text-text mb-2">{title}</div>
      {message && (
        <div className="text-sm text-text-secondary mb-4 max-w-md">
          {message}
        </div>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
