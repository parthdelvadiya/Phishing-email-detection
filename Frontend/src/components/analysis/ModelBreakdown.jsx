import { ShieldCheck, ShieldQuestion } from 'lucide-react'
import { SectionCard } from '../ui/SectionCard'
import { Badge } from '../ui/Badge'
import { formatPercent } from '../../utils/formatters'

function predictionLabel(prediction) {
  if (prediction === 'phishing' || prediction === 1 || prediction === '1') return 'Threat Detected'
  if (prediction === 'legitimate' || prediction === 0 || prediction === '0') return 'Clean & Safe'
  return prediction || 'Unknown'
}

function predictionTone(prediction) {
  return String(prediction).toLowerCase().includes('phishing') || prediction === 1
    ? 'danger'
    : 'success'
}

function ModelCard({ name, probability, prediction, meta }) {
  return (
    <div className="model-card">
      <div className="model-card__head">
        <span className="model-card__name">{name}</span>
        <Badge tone={predictionTone(prediction)} size="sm">
          {predictionLabel(prediction)}
        </Badge>
      </div>
      <p className="model-card__probability">
        {formatPercent(probability)}
        <span>threat risk score</span>
      </p>
      <div className="mini-meter" aria-hidden="true">
        <div
          className={`mini-meter__fill mini-meter__fill--${predictionTone(prediction)}`}
          style={{
            width: `${Math.min(100, Math.max(0, (Number(probability) || 0) * 100))}%`,
          }}
        />
      </div>
      <div className="model-card__meta">
        <span>{meta}</span>
      </div>
    </div>
  )
}

export function ModelBreakdown({ result }) {
  const lightgbm = result.lightgbm ?? {}
  const randomForest = result.random_forest ?? {}
  const isPhishing = result.is_phishing ?? result.verdict === 'phishing'

  return (
    <SectionCard
      title="Dual AI Safety Verification"
      description="Two independent AI detection engines scan every message to ensure reliable results without false alarms."
    >
      <div className="model-grid">
        <ModelCard
          name="Word & Threat Pattern Scanner"
          probability={lightgbm.probability ?? result.confidence_score}
          prediction={lightgbm.prediction}
          meta="Scans wording, deceptive language, panic tactics, and scam patterns"
        />
        <ModelCard
          name="Link & Identity Verifier"
          probability={randomForest.probability}
          prediction={randomForest.prediction}
          meta="Checks sender authenticity, link targets, hidden redirects, and layout"
        />
        <div className="model-card model-card--agreement">
          <div className="model-card__head">
            <span className="model-card__name">AI Consensus</span>
            <Badge tone={result.model_agreement ? 'success' : 'warning'} size="sm">
              {result.model_agreement ? 'Full Agreement' : 'Mixed Opinions'}
            </Badge>
          </div>
          <div className="agreement-status">
            <div
              className={`agreement-status__icon${
                result.model_agreement ? '' : ' agreement-status__icon--warning'
              }`}
            >
              {result.model_agreement ? (
                <ShieldCheck size={18} aria-hidden="true" />
              ) : (
                <ShieldQuestion size={18} aria-hidden="true" />
              )}
            </div>
            <div>
              <p className="agreement-status__title">
                {result.model_agreement
                  ? isPhishing
                    ? 'Both engines flagged danger'
                    : 'Both engines cleared this email'
                  : 'Engines gave mixed opinions'}
              </p>
              <p className="agreement-status__text">
                {result.model_agreement
                  ? isPhishing
                    ? 'Both independent security engines found unmistakable signs of email fraud or phishing.'
                    : 'Both independent security engines found standard, legitimate communication with zero threats.'
                  : 'One scanner detected potential threats while the other showed caution. We recommend extra vigilance.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
