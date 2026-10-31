import {
  CheckCircle2,
  Cpu,
  Database,
  RefreshCw,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  XCircle,
} from 'lucide-react'
import { SectionCard } from '../ui/SectionCard'
import { Button } from '../ui/Button'
import { SkeletonStack } from '../ui/Loading'
import { Alert } from '../ui/Alert'
import { StatCard } from '../ui/StatCard'
import { useApiResource } from '../../hooks/useApiResource'
import { getModelInfo } from '../../api/endpoints'
import { formatNumber, formatPercent } from '../../utils/formatters'

function ModelRow({ label, loaded }) {
  return (
    <div className="engine-model">
      <span className="engine-model__name">
        {loaded ? (
          <CheckCircle2 size={15} aria-hidden="true" />
        ) : (
          <XCircle size={15} aria-hidden="true" className="engine-model__icon--danger" />
        )}
        {label}
      </span>
      <span className="engine-model__value">{loaded ? 'Ready & Loaded' : 'Unavailable'}</span>
    </div>
  )
}

export function EngineOverview() {
  const { data, loading, error, refetch } = useApiResource(
    ({ signal }) => getModelInfo({ signal }),
    'intel:model-info'
  )

  const features = data?.features ?? {}
  const thresholds = data?.thresholds ?? {}
  const models = data?.models_loaded ?? {}
  const allLoaded = Object.values(models).every(Boolean)

  return (
    <SectionCard
      title="AI Protection Health & Status"
      description="Real-time operational status of the security engines protecting your emails."
      actions={
        <Button
          variant="ghost"
          size="sm"
          icon={RefreshCw}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      }
    >
      {loading ? (
        <SkeletonStack lines={5} />
      ) : error ? (
        <Alert
          tone="danger"
          title="AI status unavailable"
          actions={
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => refetch()}>
              Try again
            </Button>
          }
        >
          {error.message}
        </Alert>
      ) : data ? (
        <>
          <div className="stat-grid">
            <StatCard
              label="Protection status"
              value={data.status === 'healthy' ? 'Active & Online' : data.status}
              hint={allLoaded ? 'All security engines ready in memory' : 'Engine files missing'}
              icon={ShieldCheck}
              tone={data.status === 'healthy' ? 'success' : 'danger'}
            />
            <StatCard
              label="Total safety checks"
              value={formatNumber(features.total_features)}
              hint="Language & structural checks per email"
              icon={Cpu}
              tone="primary"
            />
            <StatCard
              label="Scam vocabulary"
              value={formatNumber(features.tfidf_features)}
              hint="Known scam keywords and phrases"
              icon={Database}
            />
            <StatCard
              label="Security rules"
              value={formatNumber(features.structural_features)}
              hint="Domain, link & header security rules"
              icon={SlidersHorizontal}
            />
          </div>

          <div className="intel-two-col intel-two-col--spaced">
            <div>
              <div className="subsection-head">
                <div>
                  <h3 className="subsection-title">Active Security Scanners</h3>
                  <p className="subsection-note">AI modules actively running in system memory.</p>
                </div>
              </div>
              <div className="engine-models">
                <ModelRow label="Word & Threat Pattern Scanner (LightGBM)" loaded={Boolean(models.lightgbm)} />
                <ModelRow label="Link & Identity Verifier (Random Forest)" loaded={Boolean(models.random_forest)} />
                <ModelRow label="Scam Word Vocabulary (15,000 phrases)" loaded={Boolean(models.tfidf_vectorizer)} />
              </div>
            </div>

            <div>
              <div className="subsection-head">
                <div>
                  <h3 className="subsection-title">Detection Sensitivity Levels</h3>
                  <p className="subsection-note">Thresholds tuned to catch scams without missing threats.</p>
                </div>
              </div>
              <div className="threshold-grid">
                <div className="threshold-card">
                  <p className="threshold-card__label">Primary threat trigger level</p>
                  <p className="threshold-card__value">
                    {formatPercent(thresholds.lightgbm_optimal_threshold)}
                  </p>
                  <p className="threshold-card__hint">Tuned sensitive to ensure zero missed scams</p>
                </div>
                <div className="threshold-card">
                  <p className="threshold-card__label">Secondary check trigger</p>
                  <p className="threshold-card__value">
                    {formatPercent(thresholds.random_forest_default_threshold)}
                  </p>
                  <p className="threshold-card__hint">Balanced secondary verification</p>
                </div>
              </div>
            </div>
          </div>

          {data.models_directory ? (
            <details className="detail detail--spaced">
              <summary className="detail__summary">
                <Server size={15} aria-hidden="true" />
                Server & Model Storage Info
                <span className="detail__summary-meta">System</span>
              </summary>
              <div className="detail__body">
                <div className="info-list">
                  <div className="info-row">
                    <span className="info-row__label">Model files directory</span>
                    <span className="info-row__value break-word">{data.models_directory}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-row__label">System status</span>
                    <span className="info-row__value">{data.status}</span>
                  </div>
                </div>
              </div>
            </details>
          ) : null}
        </>
      ) : null}
    </SectionCard>
  )
}
