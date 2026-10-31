import { forwardRef } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cx } from '../../utils/cx'

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    icon: Icon,
    iconRight: IconRight,
    iconOnly = false,
    className,
    children,
    disabled,
    type = 'button',
    ...props
  },
  ref
) {
  const iconSize = size === 'sm' ? 14 : 16

  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'btn',
        `btn--${variant}`,
        size === 'sm' && 'btn--sm',
        size === 'lg' && 'btn--lg',
        iconOnly && 'btn--icon',
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <LoaderCircle size={iconSize} className="spin" aria-hidden="true" />
      ) : Icon ? (
        <Icon size={iconSize} aria-hidden="true" />
      ) : null}
      {children ? iconOnly ? <span className="sr-only">{children}</span> : <span>{children}</span> : null}
      {IconRight && !loading ? <IconRight size={iconSize} aria-hidden="true" /> : null}
    </button>
  )
})
