import { Link } from 'react-router-dom'
import { cx } from '../../utils/cx'

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  className,
  children,
  ...props
}) {
  const iconSize = size === 'sm' ? 14 : 16

  return (
    <Link
      to={to}
      className={cx(
        'btn',
        `btn--${variant}`,
        size === 'sm' && 'btn--sm',
        size === 'lg' && 'btn--lg',
        className
      )}
      {...props}
    >
      {Icon ? <Icon size={iconSize} aria-hidden="true" /> : null}
      <span>{children}</span>
      {IconRight ? <IconRight size={iconSize} aria-hidden="true" /> : null}
    </Link>
  )
}
