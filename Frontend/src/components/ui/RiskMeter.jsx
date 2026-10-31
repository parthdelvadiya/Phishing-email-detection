import { cx } from '../../utils/cx'
import { formatPercent } from '../../utils/formatters'

export function RiskMeter({ value, threshold, tone = 'primary', showMeta = true }) {
  const numericValue = Number(value)
  const safeValue = Number.isFinite(numericValue)
    ? Math.min(100, Math.max(0, numericValue * 100))
    : 0

  const numericThreshold = Number(threshold)
  const thresholdPercent = Number.isFinite(numericThreshold)
    ? Math.min(100, Math.max(0, numericThreshold * 100))
    : null

  const fillTone = ['danger', 'warning', 'success'].includes(tone) ? tone : ''

  return (
    <div className="risk-meter">
      <div
        className="risk-meter__track"
        role="img"
        aria-label={`Phishing threat probability ${formatPercent(value)}`}
      >
        <div
          className={cx('risk-meter__fill', fillTone && `risk-meter__fill--${fillTone}`)}
          style={{ width: `${safeValue}%` }}
        />
        {thresholdPercent !== null ? (
          <span
            className="risk-meter__threshold"
            style={{ left: `${thresholdPercent}%` }}
            title={`Threat alert trigger point: ${formatPercent(threshold)}`}
          />
        ) : null}
      </div>
      {showMeta ? (
        <div className="risk-meter__meta">
          <span>Safe (0%)</span>
          <span>
            {thresholdPercent !== null
              ? `Threat Cutoff (${formatPercent(threshold)})`
              : 'Dangerous (100%)'}
          </span>
        </div>
      ) : null}
    </div>
  )
}
