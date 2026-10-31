import { cx } from '../../utils/cx'

export function StatCard({ label, value, hint, icon: Icon, tone = 'neutral', valueClassName }) {
  return (
    <div className={cx('stat-card', tone !== 'neutral' && `stat-card--${tone}`)}>
      <div className="stat-card__head">
        <span className="stat-card__label">{label}</span>
        {Icon ? (
          <span className="stat-card__icon">
            <Icon size={15} aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <p className={cx('stat-card__value', valueClassName)}>{value}</p>
      {hint ? <p className="stat-card__hint">{hint}</p> : null}
    </div>
  )
}
