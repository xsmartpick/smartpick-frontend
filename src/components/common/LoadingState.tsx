import { LoadingCircle } from '~/components/ui/loading'

import { StateContainer } from './StateContainer'

export interface LoadingStateProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function LoadingState({
  message,
  size = 'large',
  className,
}: LoadingStateProps) {
  return (
    <StateContainer className={className}>
      <LoadingCircle size={size} />
      {message && (
        <div className="mt-4 text-sm text-text-secondary">{message}</div>
      )}
    </StateContainer>
  )
}
