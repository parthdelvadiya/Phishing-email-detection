import {
  Clock3,
  FileText,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  ShieldX,
  TriangleAlert,
} from 'lucide-react'
import { Badge, VerdictBadge } from '../ui/Badge'
import { RiskMeter } from '../ui/RiskMeter'
import { getVerdictDescription, getVerdictMeta } from '../../utils/verdicts'
import { formatDateTime, formatPercent } from '../../utils/formatters'
import { LIGHTGBM_FALLBACK_THRESHOLD } from '../../config'

const VERDICT_ICONS = {
  phishing: ShieldAlert,
  legitimate: ShieldCheck,
  model_disagreement: ShieldQuestion,
}

export function VerdictSummary({
  result,
  context = 'live',
  recordId,
  createdAt,
  actions,
}) {
  const meta = getVerdictMeta(result.verdict)
  const Icon = VERDICT_ICONS[result.verdict] ?? ShieldX
  const probability =
    result.lightgbm?.probability ?? result.confidence_score ?? null
  const threshold =
    result.lightgbm?.optimal_threshold ?? LIGHTGBM_FALLBACK_THRESHOLD
  const aboveThreshold = Number(probability) >= Number(threshold)

  return (
    <section
      className={`verdict-panel verdict-panel--${meta.tone}`}
      aria-label="Detection verdict"
    >
      <div className="verdict-panel__top">
        <div className="verdict-panel__identity">
          <div className="verdict-panel__icon">
            <Icon size={24} aria-hidden="true" />
          </div>
          <div className="verdict-panel__content">
            <div className="verdict-panel__status">
              <VerdictBadge verdict={result.verdict} />
              <Badge tone="outline" size="sm">
                Dual AI Verified
              </Badge>
            </div>
            <h2 className="verdict-panel__title">{meta.title}</h2>
            <p className="verdict-panel__description">{getVerdictDescription(result)}</p>
          </div>
        </div>

        <div className="risk-block">
          <div className="risk-block__label">
            <span>Threat Level</span>
            <Badge tone={meta.tone} size="sm">
              {aboveThreshold ? 'Threat Detected' : 'Safe / Low'}
            </Badge>
          </div>
          <p className="risk-block__value">{formatPercent(probability)}</p>
          <p className="risk-block__caption">Threat Risk Score</p>
          <RiskMeter value={probability} threshold={threshold} tone={meta.tone} />
        </div>
      </div>

      {result.recommended_action ? (
        <div className="verdict-panel__recommendation">
          {result.verdict === 'legitimate' ? (
            <ShieldCheck size={18} aria-hidden="true" />
          ) : result.verdict === 'phishing' ? (
            <ShieldAlert size={18} aria-hidden="true" />
          ) : (
            <TriangleAlert size={18} aria-hidden="true" />
          )}
          <div>
            <p className="verdict-panel__recommendation-label">Recommended action for you</p>
            <p>{result.recommended_action}</p>
          </div>
        </div>
      ) : null}

      <div className="verdict-panel__footer">
        <div className="verdict-panel__meta">
          {context === 'record' && createdAt ? (
            <span className="verdict-panel__meta-item">
              <Clock3 size={13} aria-hidden="true" />
              Checked on {formatDateTime(createdAt)}
            </span>
          ) : null}
          {recordId ? (
            <span className="verdict-panel__meta-item">
              <FileText size={13} aria-hidden="true" />
              Saved as record #{recordId}
            </span>
          ) : null}
        </div>
        {actions ? <div className="verdict-panel__actions">{actions}</div> : null}
      </div>
    </section>
  )
}
