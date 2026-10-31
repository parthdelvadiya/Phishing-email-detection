import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Clock3, Mail, Trash2 } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { LoadingState } from '../components/ui/Loading'
import { EmptyState } from '../components/ui/EmptyState'
import { QueryError } from '../components/ui/QueryError'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { AnalysisResult } from '../components/analysis/AnalysisResult'
import { useApiResource } from '../hooks/useApiResource'
import { deletePredictionRecord, getPredictionRecord } from '../api/endpoints'
import { buildAnalysisFromRecord } from '../utils/normalizeRecord'
import { formatDateTime } from '../utils/formatters'

export function HistoryDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const { data, loading, error, refetch } = useApiResource(
    ({ signal }) => getPredictionRecord(id, { signal }),
    `record:${id}`
  )

  const record = data && String(data.id) === String(id) ? data : null
  const isNotFound = error?.status === 404
  const analysis = record ? buildAnalysisFromRecord(record) : null

  const pageTitle = record
    ? record.subject || 'Untitled email check'
    : isNotFound
      ? 'Record not found'
      : 'Saved email check'

  const pageDescription = record
    ? `Full security scan details and original email content for record #${record.id}.`
    : 'View a saved security check from your history.'

  async function confirmDelete() {
    if (!record) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deletePredictionRecord(record.id)
      navigate('/history', {
        replace: true,
        state: { notice: `Saved record #${record.id} was deleted.` },
      })
    } catch (deleteFailure) {
      setDeleteError(deleteFailure)
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Link className="back-link" to="/history">
        <ArrowLeft size={14} aria-hidden="true" />
        Back to scan history
      </Link>

      {record ? (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/history">Scan History</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span>Record #{record.id}</span>
        </nav>
      ) : null}

      <PageHeader
        eyebrow={record ? `Saved Check #${record.id}` : 'Scan History'}
        title={pageTitle}
        description={pageDescription}
        actions={
          record ? (
            <Button variant="danger" icon={Trash2} onClick={() => setDeleteOpen(true)}>
              Delete record
            </Button>
          ) : null
        }
      />

      {record ? (
        <>
          <div className="record-meta-bar record-meta-bar--page">
            <span className="record-meta-bar__item">
              <Clock3 size={13} aria-hidden="true" />
              {formatDateTime(record.created_at)}
            </span>
            <span className="record-meta-bar__item">
              <Mail size={13} aria-hidden="true" />
              {record.sender || 'Unknown sender'}
            </span>
          </div>
          <AnalysisResult
            key={record.id}
            result={analysis}
            context="record"
            recordId={record.id}
            createdAt={record.created_at}
            emailBody={record.email_text}
          />
        </>
      ) : loading ? (
        <section className="card">
          <LoadingState
            label="Loading analysis record"
            hint="Retrieving the saved signal payload from the detection service."
          />
        </section>
      ) : isNotFound ? (
        <section className="card">
          <EmptyState
            title="Record not found"
            description={`No saved analysis exists for record #${id}. It may have been deleted already.`}
          >
            <Link className="btn btn--secondary" to="/history">
              Return to scan history
            </Link>
          </EmptyState>
        </section>
      ) : (
        <section className="card">
          <QueryError
            error={error}
            title="Unable to load this record"
            onRetry={() => refetch()}
          />
        </section>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete this analysis?"
        description={
          record
            ? `Record #${record.id}${record.subject ? ` — “${record.subject}”` : ''} and its full signal payload will be permanently removed. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete record"
        cancelLabel="Keep record"
        icon={Trash2}
        loading={isDeleting}
        error={deleteError}
        onCancel={() => {
          if (isDeleting) return
          setDeleteOpen(false)
          setDeleteError(null)
        }}
        onConfirm={confirmDelete}
      />
    </>
  )
}
