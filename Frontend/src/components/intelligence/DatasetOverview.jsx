import { Database, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { SectionCard } from '../ui/SectionCard'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { StatCard } from '../ui/StatCard'
import { SkeletonStack } from '../ui/Loading'
import { useApiResource } from '../../hooks/useApiResource'
import { getDatasetSummary } from '../../api/endpoints'
import { formatNumber, formatPercentValue } from '../../utils/formatters'

export function DatasetOverview() {
  const { data, loading, error, refetch } = useApiResource(
    ({ signal }) => getDatasetSummary({ signal }),
    'intel:dataset'
  )

  const classDistribution = data?.class_distribution ?? {}
  const splits = data?.split_configuration ?? {}
  const total = Number(data?.total_emails) || 0
  const phishing = Number(classDistribution.phishing) || 0
  const legitimate = Number(classDistribution.legitimate) || 0
  const phishingPercent = total ? (phishing / total) * 100 : 0

  const splitItems = [
    {
      label: 'Training Set',
      description: 'Used to teach the AI models',
      count: splits.train_count,
      share: splits.train_percent,
      primary: true,
    },
    {
      label: 'Validation Set',
      description: 'Used to tune detection sensitivity',
      count: splits.validation_count,
      share: splits.validation_percent,
      primary: false,
    },
    {
      label: 'Test Benchmark Set',
      description: 'Used for final accuracy testing',
      count: splits.test_count,
      share: splits.test_percent,
      primary: false,
    },
  ]

  return (
    <SectionCard
      title="AI Training & Knowledge Base"
      description="The balanced collection of 86,456 real emails used to train, tune, and test our security AI models."
      actions={
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={() => refetch()}>
          Refresh
        </Button>
      }
    >
      {loading ? (
        <SkeletonStack lines={5} />
      ) : error ? (
        <Alert
          tone="danger"
          title="Dataset information unavailable"
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
              label="Total verified emails"
              value={formatNumber(total)}
              hint="Cleaned and verified email records"
              icon={Database}
              tone="primary"
            />
            <StatCard
              label="Phishing scam emails"
              value={formatNumber(phishing)}
              hint={`${formatPercentValue(phishingPercent)} of total knowledge base`}
              icon={ShieldAlert}
              tone="danger"
            />
            <StatCard
              label="Safe legitimate emails"
              value={formatNumber(legitimate)}
              hint={`${formatPercentValue(100 - phishingPercent)} of total knowledge base`}
              icon={ShieldCheck}
              tone="success"
            />
          </div>

          <div className="class-bar" aria-hidden="true">
            <div className="class-bar__legit" style={{ width: `${100 - phishingPercent}%` }} />
            <div className="class-bar__phish" style={{ width: `${phishingPercent}%` }} />
          </div>
          <div className="class-legend">
            <span className="class-legend__item">
              <span className="class-legend__dot class-legend__dot--legit" />
              Safe emails
              <span className="class-legend__value">{formatNumber(legitimate)}</span>
            </span>
            <span className="class-legend__item">
              <span className="class-legend__dot class-legend__dot--phish" />
              Phishing emails
              <span className="class-legend__value">{formatNumber(phishing)}</span>
            </span>
          </div>

          <div className="split-grid">
            {splitItems.map((split) => {
              const sharePercent = total && split.count ? (Number(split.count) / total) * 100 : 0

              return (
                <div
                  className={`split-item${split.primary ? ' split-item--primary' : ''}`}
                  key={split.label}
                >
                  <div className="split-item__head">
                    <span className="split-item__label">{split.label}</span>
                    <span className="split-item__share">{split.share}</span>
                  </div>
                  <p className="split-item__value">{formatNumber(split.count)}</p>
                  <div className="split-item__bar" aria-hidden="true">
                    <span style={{ width: `${sharePercent}%` }} />
                  </div>
                </div>
              )
            })}
          </div>

          {Array.isArray(data.columns) && data.columns.length > 0 ? (
            <div className="dataset-fields">
              <span className="dataset-fields__label">Email data inspected:</span>
              {data.columns.map((column) => (
                <span className="dataset-field" key={column}>
                  {column}
                </span>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </SectionCard>
  )
}
