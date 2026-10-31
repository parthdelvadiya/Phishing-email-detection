import { CircleAlert, RefreshCw } from 'lucide-react'
import { Button } from './Button'

export function QueryError({
  error,
  title = 'Unable to load data',
  description,
  onRetry,
  retryLabel = 'Try again',
}) {
  return (
    <div className="empty-state empty-state--error" role="alert">
      <div className="empty-state__icon empty-state__icon--danger">
        <CircleAlert size={21} aria-hidden="true" />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">
        {error?.message || description || 'The request could not be completed.'}
      </p>
      {onRetry ? (
        <div className="empty-state__actions">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => onRetry()}>
            {retryLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
