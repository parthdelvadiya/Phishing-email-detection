import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from 'lucide-react'
import { cx } from '../../utils/cx'

const ICONS = {
  danger: CircleAlert,
  warning: TriangleAlert,
  success: CheckCircle2,
  info: Info,
  neutral: Info,
}

export function Alert({
  tone = 'info',
  title,
  children,
  actions,
  onDismiss,
  className,
  role,
}) {
  const Icon = ICONS[tone] ?? Info

  return (
    <div
      className={cx('alert', `alert--${tone}`, className)}
      role={role ?? (tone === 'danger' ? 'alert' : 'status')}
    >
      <Icon size={17} className="alert__icon" aria-hidden="true" />
      <div className="alert__content">
        {title ? <p className="alert__title">{title}</p> : null}
        {children ? <div className="alert__message">{children}</div> : null}
        {actions ? <div className="alert__actions">{actions}</div> : null}
      </div>
      {onDismiss ? (
        <button type="button" className="alert__close" onClick={onDismiss} aria-label="Dismiss message">
          <X size={15} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}
