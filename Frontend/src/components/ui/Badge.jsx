import { getVerdictMeta } from '../../utils/verdicts'
import { cx } from '../../utils/cx'

export function Badge({ tone = 'neutral', size, dot = false, children, className }) {
  return (
    <span className={cx('badge', `badge--${tone}`, size === 'sm' && 'badge--sm', className)}>
      {dot ? <span className="badge__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  )
}

export function VerdictBadge({ verdict, size }) {
  const meta = getVerdictMeta(verdict)

  return (
    <Badge tone={meta.tone} size={size} dot>
      {meta.label}
    </Badge>
  )
}
