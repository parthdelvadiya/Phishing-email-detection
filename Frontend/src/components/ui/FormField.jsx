import { forwardRef } from 'react'
import { CircleAlert } from 'lucide-react'
import { cx } from '../../utils/cx'

export function FormField({
  label,
  htmlFor,
  required = false,
  optional = false,
  hint,
  error,
  children,
  className,
}) {
  return (
    <div className={cx('field', className)}>
      <label className="field__label" htmlFor={htmlFor}>
        {label}
        {required ? (
          <>
            <span className="field__required" aria-hidden="true">
              *
            </span>
            <span className="sr-only">(required)</span>
          </>
        ) : null}
        {optional ? <span className="field__optional">Optional</span> : null}
      </label>
      {children}
      {error ? (
        <p className="field__error" id={`${htmlFor}-error`}>
          <CircleAlert size={13} aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p className="field__hint" id={`${htmlFor}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export const TextInput = forwardRef(function TextInput(
  { className, invalid = false, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cx('input', className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
})

export const TextArea = forwardRef(function TextArea(
  { className, invalid = false, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={cx('textarea', className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
})

export const Select = forwardRef(function Select(
  { className, invalid = false, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={cx('select', className)}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {children}
    </select>
  )
})
