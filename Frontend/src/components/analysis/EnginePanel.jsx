import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  Gauge,
  LockKeyhole,
  RefreshCw,
  Server,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react'
import { SectionCard } from '../ui/SectionCard'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Loading'
import { Alert } from '../ui/Alert'
import { useApiResource } from '../../hooks/useApiResource'
import { getModelInfo } from '../../api/endpoints'
import { formatNumber, formatPercent } from '../../utils/formatters'

export function EnginePanel() {
  const { data, loading, error, refetch } = useApiResource(
    ({ signal }) => getModelInfo({ signal }),
    'model-info'
  )

  const allModelsLoaded =
    data?.models_loaded &&
    Object.values(data.models_loaded).every((loaded) => Boolean(loaded))

  return (
    <>
      <SectionCard
        title="AI Protection System"
        description="Status of the dual AI detection engines protecting your inbox."
        actions={
          error ? (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              icon={RefreshCw}
              onClick={() => refetch()}
            >
              Retry
            </Button>
          ) : null
        }
      >
        {loading ? (
          <div className="engine-state engine-state--loading" role="status">
            <Spinner size={17} className="engine-state__icon" />
            <div>
              <p className="engine-state__title">Checking AI engine status</p>
              <p className="engine-state__text">Connecting to security models…</p>
            </div>
          </div>
        ) : error ? (
          <Alert
            tone="danger"
            title="AI status temporarily unavailable"
            actions={
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={() => refetch()}
              >
                Try again
              </Button>
            }
          >
            {error.message}
          </Alert>
        ) : data ? (
          <>
            <div
              className={`engine-state${data.status === 'healthy' ? '' : ' engine-state--error'}`}
            >
              {data.status === 'healthy' ? (
                <CheckCircle2 size={17} className="engine-state__icon" aria-hidden="true" />
              ) : (
                <Server size={17} className="engine-state__icon" aria-hidden="true" />
              )}
              <div>
                <p className="engine-state__title">
                  {data.status === 'healthy' ? 'AI Protection Online & Ready' : 'AI Service Offline'}
                </p>
                <p className="engine-state__text">
                  {allModelsLoaded
                    ? 'All security AI models are loaded and actively scanning.'
                    : 'One or more security models are not loaded.'}
                </p>
              </div>
            </div>

            <div className="engine-feature-list">
              <div className="engine-feature">
                <span className="engine-feature__label">
                  <Cpu size={14} aria-hidden="true" />
                  Total safety checks
                </span>
                <span className="engine-feature__value">
                  {formatNumber(data.features?.total_features)} checks
                </span>
              </div>
              <div className="engine-feature">
                <span className="engine-feature__label">
                  <Database size={14} aria-hidden="true" />
                  Scam words recognized
                </span>
                <span className="engine-feature__value">
                  {formatNumber(data.features?.tfidf_features)} words
                </span>
              </div>
              <div className="engine-feature">
                <span className="engine-feature__label">
                  <SlidersHorizontal size={14} aria-hidden="true" />
                  Link & structure rules
                </span>
                <span className="engine-feature__value">
                  {formatNumber(data.features?.structural_features)} rules
                </span>
              </div>
              <div className="engine-feature">
                <span className="engine-feature__label">
                  <Gauge size={14} aria-hidden="true" />
                  Threat trigger level
                </span>
                <span className="engine-feature__value">
                  {formatPercent(data.thresholds?.lightgbm_optimal_threshold)} (high sensitivity)
                </span>
              </div>
            </div>

            <p className="engine-note">
              <ShieldCheck size={13} aria-hidden="true" className="engine-note__icon" />
              Real-time scans run securely inside your system.
            </p>

            <div className="engine-panel__link">
              <Link className="link-button" to="/intelligence">
                View AI accuracy & test benchmark
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>
          </>
        ) : null}
      </SectionCard>

      <div className="privacy-card">
        <div className="privacy-card__icon">
          <LockKeyhole size={16} aria-hidden="true" />
        </div>
        <div>
          <p className="privacy-card__title">Your Privacy is Protected</p>
          <p className="privacy-card__text">
            Emails are only saved if you choose “Save to scan history”. Turn it off anytime for 100% private, one-off checks.
          </p>
        </div>
      </div>
    </>
  )
}
