import { useEffect, useRef, useState } from 'react'
import { Activity, RefreshCw, ShieldCheck } from 'lucide-react'
import { SectionCard } from '../ui/SectionCard'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Alert } from '../ui/Alert'
import { SkeletonStack } from '../ui/Loading'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { ConfusionMatrix } from './ConfusionMatrix'
import { useApiResource } from '../../hooks/useApiResource'
import { getEvaluationReport, runEvaluation } from '../../api/endpoints'
import { formatMetric, formatNumber, formatPercent } from '../../utils/formatters'
import { LIGHTGBM_FALLBACK_THRESHOLD } from '../../config'

const METRIC_ROWS = [
  { key: 'recall', label: 'Phishing Threat Catch Rate' },
  { key: 'accuracy', label: 'Overall Decision Accuracy' },
  { key: 'precision', label: 'False Alarm Prevention' },
  { key: 'f1', label: 'Combined Reliability (F1)' },
  { key: 'auc_roc', label: 'Threat Separation (AUC)' },
]

export function EvaluationSection() {
  const { data: report, loading, error, refetch, setData } = useApiResource(
    ({ signal }) => getEvaluationReport({ signal }),
    'intel:evaluation'
  )
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [runError, setRunError] = useState(null)
  const [runNotice, setRunNotice] = useState(null)
  const abortRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      abortRef.current?.abort()
    }
  }, [])

  const lgbDefault = report?.lightgbm?.['default_threshold_0.50'] ?? {}
  const costTuned = report?.lightgbm?.cost_tuned ?? {}
  const tunedMetrics = costTuned.metrics ?? {}
  const tunedThreshold = costTuned.threshold ?? LIGHTGBM_FALLBACK_THRESHOLD
  const randomForest = report?.random_forest ?? {}
  const testCount = report?.split?.test

  async function handleRunEvaluation() {
    setConfirmOpen(false)
    setRunError(null)
    setRunNotice(null)
    setIsRunning(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const updatedReport = await runEvaluation({ signal: controller.signal })
      if (!mountedRef.current || controller.signal.aborted) return
      setData(updatedReport)
      setRunNotice('Live evaluation completed. The benchmark report has been updated.')
    } catch (failure) {
      if (failure.name === 'AbortError' || controller.signal.aborted) return
      if (!mountedRef.current) return
      setRunError(failure)
    } finally {
      if (mountedRef.current && !controller.signal.aborted) {
        setIsRunning(false)
      }
    }
  }

  const actions = (
    <Button
      variant="secondary"
      size="sm"
      icon={Activity}
      loading={isRunning}
      onClick={() => setConfirmOpen(true)}
      disabled={isRunning}
    >
      {isRunning ? 'Testing AI Accuracy...' : 'Test AI Accuracy'}
    </Button>
  )

  return (
    <>
      <SectionCard
        title="AI Benchmark Test Results"
        description="Verified accuracy metrics tested on 12,969 real-world emails that the models had never seen before."
        actions={actions}
      >
        {runNotice ? (
          <div className="evaluation-banner">
            <Alert tone="success" title="Benchmark tests completed" onDismiss={() => setRunNotice(null)}>
              {runNotice}
            </Alert>
          </div>
        ) : null}

        {runError ? (
          <div className="evaluation-banner">
            <Alert
              tone="danger"
              title="Test evaluation failed"
              onDismiss={() => setRunError(null)}
              actions={
                <Button
                  variant="secondary"
                  size="sm"
                  icon={RefreshCw}
                  onClick={() => setConfirmOpen(true)}
                >
                  Try again
                </Button>
              }
            >
              {runError.message}
            </Alert>
          </div>
        ) : null}

        {isRunning ? (
          <div className="evaluation-banner">
            <Alert tone="info" title="Running live evaluation test">
              The AI is testing all 12,969 benchmark emails in the background. This may take 1-2 minutes.
            </Alert>
          </div>
        ) : null}

        {loading ? (
          <SkeletonStack lines={7} />
        ) : error ? (
          <Alert
            tone={error.status === 404 ? 'info' : 'danger'}
            title={error.status === 404 ? 'No benchmark report found' : 'Evaluation report unavailable'}
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
            {error.status === 404
              ? 'The system has no stored benchmark report yet. Click "Test AI Accuracy" to generate one.'
              : error.message}
          </Alert>
        ) : report ? (
          <>
            <div className="subsection-head">
              <div>
                <h3 className="subsection-title">Primary AI Performance (Safety-Tuned)</h3>
                <p className="subsection-note">
                  Operating with enhanced sensitivity to eliminate missed phishing threats.
                </p>
              </div>
              <Badge tone="primary">Sensitivity Cutoff {formatPercent(tunedThreshold)}</Badge>
            </div>

            <div className="metric-grid">
              {METRIC_ROWS.map((metric) => (
                <div
                  className={`metric-card${metric.key === 'recall' ? ' metric-card--highlight' : ''}`}
                  key={metric.key}
                >
                  <p className="metric-card__label">{metric.label}</p>
                  <p className="metric-card__value">{formatMetric(tunedMetrics[metric.key])}</p>
                  {metric.key === 'recall' ? (
                    <p className="metric-card__hint">Phishing threat detection rate</p>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="table-wrap table-wrap--spaced">
              <table className="data-table comparison-table">
                <caption className="sr-only">
                  Model performance comparison on the held-out test split
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Safety Measurement</th>
                    <th scope="col">Standard AI (50% cutoff)</th>
                    <th scope="col" className="col-highlight">
                      Safety-Tuned AI (Main Active)
                    </th>
                    <th scope="col">Secondary Verifier</th>
                  </tr>
                </thead>
                <tbody>
                  {METRIC_ROWS.map((metric) => (
                    <tr key={metric.key}>
                      <th scope="row" className="metric-name">
                        {metric.label}
                      </th>
                      <td>{formatMetric(lgbDefault[metric.key])}</td>
                      <td className="col-highlight">{formatMetric(tunedMetrics[metric.key])}</td>
                      <td>{formatMetric(randomForest[metric.key])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="subsection-head subsection-head--spaced">
              <div>
                <h3 className="subsection-title">Test Results Breakdown</h3>
                <p className="subsection-note">
                  Exact email classification counts across all 12,969 benchmark emails.
                </p>
              </div>
              {testCount ? <Badge tone="neutral">{formatNumber(testCount)} test emails</Badge> : null}
            </div>

            <ConfusionMatrix
              matrix={tunedMetrics.confusion_matrix}
              threshold={tunedThreshold}
              recall={tunedMetrics.recall}
            />

            <p className="report-caption">
              Evaluated on {formatNumber(testCount)} test samples from a{' '}
              {formatNumber(report.dataset_size)}-email corpus, using{' '}
              {formatNumber(report.features?.total)} model safety checks.
            </p>
          </>
        ) : null}
      </SectionCard>

      <ConfirmDialog
        open={confirmOpen}
        title="Run Live Accuracy Test?"
        description="This will test both AI engines against 12,969 real-world emails to calculate and verify their live threat detection accuracy. This may take 1-2 minutes."
        confirmLabel="Start Accuracy Test"
        cancelLabel="Cancel"
        icon={ShieldCheck}
        tone="primary"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleRunEvaluation}
      />
    </>
  )
}
