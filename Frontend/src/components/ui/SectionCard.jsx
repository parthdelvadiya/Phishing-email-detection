import { cx } from '../../utils/cx'

export function SectionCard({
  title,
  description,
  actions,
  children,
  footer,
  className,
  bodyClassName,
  titleId,
}) {
  const hasHeader = Boolean(title || description || actions)

  return (
    <section className={cx('card', className)} aria-labelledby={title && titleId ? titleId : undefined}>
      {hasHeader ? (
        <div className="card__header">
          <div className="card__header-main">
            {title ? (
              <h2 className="card__title" id={titleId}>
                {title}
              </h2>
            ) : null}
            {description ? <p className="card__description">{description}</p> : null}
          </div>
          {actions ? <div className="card__actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className={cx('card__body', bodyClassName)}>{children}</div>
      {footer ? <div className="card__footer">{footer}</div> : null}
    </section>
  )
}
