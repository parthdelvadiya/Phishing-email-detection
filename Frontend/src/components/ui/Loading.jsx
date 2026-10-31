import { LoaderCircle } from 'lucide-react'
import { cx } from '../../utils/cx'

export function Spinner({ size = 20, className }) {
  return <LoaderCircle size={size} className={cx('spinner', className)} aria-hidden="true" />
}

export function LoadingState({ label = 'Loading…', hint, className }) {
  return (
    <div className={cx('loading-state', className)} role="status" aria-live="polite">
      <Spinner size={24} />
      <p className="loading-state__label">{label}</p>
      {hint ? <p className="loading-state__hint">{hint}</p> : null}
    </div>
  )
}

export function Skeleton({ width, height, className }) {
  return (
    <span
      className={cx('skeleton', className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export function SkeletonStack({ lines = 3, className }) {
  return (
    <div className={cx('skeleton-stack', className)} aria-hidden="true">
      <span className="skeleton skeleton--title" />
      {Array.from({ length: lines }).map((_, index) => (
        <span
          key={index}
          className={cx('skeleton skeleton--line', index === lines - 1 && 'skeleton--short')}
        />
      ))}
    </div>
  )
}
