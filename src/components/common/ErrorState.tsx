import { Button } from '~/components/ui/button/Button'

import { StateContainer } from './StateContainer'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

function ErrorIcon() {
  return (
    <svg
      className="h-6 w-6 text-red"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  )
}

export function ErrorState({
  title = 'Failed to load',
  message,
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <StateContainer
      icon={<ErrorIcon />}
      iconBackground="bg-red/10"
      title={title}
      message={message}
      action={
        onRetry ? (
          <Button variant="secondary" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : undefined
      }
      className={className}
    />
  )
}
