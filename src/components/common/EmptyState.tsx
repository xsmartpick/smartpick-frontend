import type { ReactNode } from 'react'

import { StateContainer } from './StateContainer'

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
    <StateContainer
      icon={icon}
      iconBackground="bg-fill"
      title={title}
      message={message}
      action={action}
      className={className}
    />
  )
}
