import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { History, Plus, Search, Trash2 } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { ButtonLink } from '../components/ui/ButtonLink'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { EmptyState } from '../components/ui/EmptyState'
import { QueryError } from '../components/ui/QueryError'
import { SkeletonStack, Spinner } from '../components/ui/Loading'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { HistoryFilters } from '../components/history/HistoryFilters'
import { HistoryTable } from '../components/history/HistoryTable'
import { useApiResource } from '../hooks/useApiResource'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { deletePredictionRecord, getPredictionHistory } from '../api/endpoints'
import { formatNumber, pluralize } from '../utils/formatters'

export function HistoryPage() {
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [verdict, setVerdict] = useState('')
  const [limit, setLimit] = useState(50)
  const [notice, setNotice] = useState(location.state?.notice ?? null)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const debouncedSearch = useDebouncedValue(search, 350)
  const trimmedSearch = debouncedSearch.trim()
  const hasFilters = Boolean(trimmedSearch || verdict)

  const {
    data,
    loading,
    refreshing,
    error,
    refetch,
  } = useApiResource(
    ({ signal }) =>
      getPredictionHistory(
        { search: trimmedSearch, verdict, limit },
        { signal }
      ),
    `history:${trimmedSearch}:${verdict}:${limit}`
  )

  const records = data?.records ?? []
  const count = data?.count ?? records.length

  useEffect(() => {
    if (location.state?.notice) {
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  function clearFilters() {
    setSearch('')
    setVerdict('')
  }

  function requestDelete(record) {
    setSelectedRecord(record)
    setDeleteError(null)
  }

  function closeDeleteDialog() {
    if (isDeleting) return
    setSelectedRecord(null)
    setDeleteError(null)
  }

  async function confirmDelete() {
    if (!selectedRecord) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deletePredictionRecord(selectedRecord.id)
      setNotice(`Analysis record #${selectedRecord.id} was deleted.`)
      setSelectedRecord(null)
      await refetch({ silent: true })
    } catch (deleteFailure) {
      setDeleteError(deleteFailure)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Saved Checks"
        title="Scan History"
        description="Review previous emails scanned by PhishGuard AI. Click any email to view its full security report."
        actions={
          <ButtonLink to="/" icon={Plus}>
            Check New Email
          </ButtonLink>
        }
      />

      {notice ? (
        <div className="history-notice">
          <Alert tone="success" title="History updated" onDismiss={() => setNotice(null)}>
            {notice}
          </Alert>
        </div>
      ) : null}

      <section className="card card--flush" aria-label="Saved analyses">
        <HistoryFilters
          search={search}
          verdict={verdict}
          limit={limit}
          refreshing={refreshing}
          onSearchChange={setSearch}
          onVerdictChange={setVerdict}
          onLimitChange={setLimit}
          onRefresh={() => refetch()}
        />

        <div className="history-summary">
          <div className="history-summary__left">
            {loading ? (
              <span>Loading analyses…</span>
            ) : error ? (
              <span>Analysis history unavailable</span>
            ) : (
              <>
                <span>
                  Latest {formatNumber(count)} {pluralize(count, 'record')}
                </span>
                {hasFilters ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Filtered view</span>
                    <button type="button" className="filter-clear" onClick={clearFilters}>
                      Clear filters
                    </button>
                  </>
                ) : null}
              </>
            )}
          </div>
          <div className="history-summary__right">
            {refreshing ? (
              <span className="history-updating">
                <Spinner size={12} />
                Updating
              </span>
            ) : (
              <span>Limit {formatNumber(limit)}</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="history-loading">
            <SkeletonStack lines={6} />
          </div>
        ) : error ? (
          <QueryError
            error={error}
            title="Unable to load scan history"
            onRetry={() => refetch()}
          />
        ) : records.length === 0 ? (
          <div className="history-empty">
            {hasFilters ? (
              <EmptyState
                icon={Search}
                title="No matching checks"
                description="No saved scans match your current search or filter. Try a different search term or clear the filter."
              >
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              </EmptyState>
            ) : (
              <EmptyState
                icon={History}
                title="No saved checks yet"
                description="Scan an email with “Save to scan history” enabled, and its full security report will appear here."
              >
                <ButtonLink to="/" icon={Plus}>
                  Check an Email
                </ButtonLink>
              </EmptyState>
            )}
          </div>
        ) : (
          <HistoryTable records={records} onDeleteRequest={requestDelete} />
        )}
      </section>

      <ConfirmDialog
        open={Boolean(selectedRecord)}
        title="Delete this scan record?"
        description={
          selectedRecord
            ? `Record #${selectedRecord.id}${selectedRecord.subject ? ` — “${selectedRecord.subject}”` : ''
            } will be permanently removed from your scan history. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Record"
        cancelLabel="Cancel"
        icon={Trash2}
        loading={isDeleting}
        error={deleteError}
        onCancel={closeDeleteDialog}
        onConfirm={confirmDelete}
      />
    </>
  )
}
