import { Link } from 'react-router-dom'
import { CheckCircle2, Eye, ShieldQuestion, Trash2 } from 'lucide-react'
import { VerdictBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatDateTime, formatPercent } from '../../utils/formatters'

function riskTone(verdict) {
  if (verdict === 'phishing') return 'danger'
  if (verdict === 'model_disagreement') return 'warning'
  return 'success'
}

export function HistoryTable({ records, onDeleteRequest }) {
  return (
    <div className="table-wrap">
      <table className="data-table history-table">
        <caption className="sr-only">Saved email analyses</caption>
        <thead>
          <tr>
            <th scope="col">Email Subject & Sender</th>
            <th scope="col" className="history-col-verdict">
              Safety Result
            </th>
            <th scope="col" className="history-col-risk">
              Threat Risk
            </th>
            <th scope="col" className="history-col-agreement">
              AI Consensus
            </th>
            <th scope="col" className="history-col-urls">
              Links
            </th>
            <th scope="col" className="history-col-date">
              Date Checked
            </th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const confidence = Number(record.confidence_score) || 0
            const tone = riskTone(record.verdict)

            return (
              <tr key={record.id}>
                <td>
                  <Link className="history-subject" to={`/history/${record.id}`}>
                    {record.subject || 'Untitled email'}
                  </Link>
                  <span className="history-sender">
                    {record.sender || 'Unknown sender'}
                    {record.sender_domain && record.sender !== record.sender_domain
                      ? ` · ${record.sender_domain}`
                      : ''}
                  </span>
                  <span className="history-mobile-meta">
                    <VerdictBadge verdict={record.verdict} size="sm" />
                    <span className="history-mobile-risk">
                      {formatPercent(record.confidence_score)} risk
                    </span>
                  </span>
                </td>
                <td className="history-col-verdict">
                  <span className="history-verdict">
                    <VerdictBadge verdict={record.verdict} size="sm" />
                  </span>
                </td>
                <td className="history-col-risk">
                  <div className="risk-cell">
                    <div className="risk-cell__value">
                      <span>{formatPercent(record.confidence_score)}</span>
                    </div>
                    <div className="mini-meter" aria-hidden="true">
                      <div
                        className={`mini-meter__fill mini-meter__fill--${tone}`}
                        style={{ width: `${Math.min(100, Math.max(0, confidence * 100))}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="history-col-agreement">
                  <span className={`agreement-mark${record.model_agreement ? '' : ' agreement-mark--split'}`}>
                    {record.model_agreement ? (
                      <CheckCircle2 size={13} aria-hidden="true" />
                    ) : (
                      <ShieldQuestion size={13} aria-hidden="true" />
                    )}
                    {record.model_agreement ? 'Both Agree' : 'Mixed'}
                  </span>
                </td>
                <td className="history-col-urls">
                  <span className="history-url-count">
                    {record.urls_detected_count} {record.urls_detected_count === 1 ? 'link' : 'links'}
                  </span>
                </td>
                <td className="history-col-date">
                  <span className="history-date">{formatDateTime(record.created_at)}</span>
                </td>
                <td>
                  <div className="data-table__actions">
                    <Link
                      to={`/history/${record.id}`}
                      className="btn btn--ghost btn--sm btn--icon"
                      aria-label={`View analysis record ${record.id}`}
                      title="View record"
                    >
                      <Eye size={15} aria-hidden="true" />
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      icon={Trash2}
                      onClick={() => onDeleteRequest(record)}
                      aria-label={`Delete analysis record ${record.id}`}
                      title="Delete record"
                    >
                      Delete record
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
