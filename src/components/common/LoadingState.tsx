import { LoadingCircle } from '~/components/ui/loading'

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
    <div
      className={`flex flex-col items-center justify-center py-12 ${className || ''}`}
    >
      <LoadingCircle size={size} />
      {message && (
        <div className="mt-4 text-sm text-text-secondary">{message}</div>
      )}
    </div>
  )
}
