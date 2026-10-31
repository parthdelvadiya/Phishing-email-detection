import { RefreshCw, Search, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Select } from '../ui/FormField'
import { VERDICT_FILTER_OPTIONS } from '../../utils/verdicts'

const LIMIT_OPTIONS = [10, 25, 50, 100, 200]

export function HistoryFilters({
  search,
  verdict,
  limit,
  refreshing,
  onSearchChange,
  onVerdictChange,
  onLimitChange,
  onRefresh,
}) {
  return (
    <div className="history-toolbar">
      <div className="search-field">
        <Search size={15} className="search-field__icon" aria-hidden="true" />
        <input
          className="input"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by email subject or sender..."
          aria-label="Search scan history by subject or sender"
        />
        {search ? (
          <button
            type="button"
            className="search-field__clear"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <X size={14} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="filter-field">
        <label className="filter-field__label" htmlFor="history-verdict">
          Filter by Result
        </label>
        <Select
          id="history-verdict"
          className="select--compact"
          value={verdict}
          onChange={(event) => onVerdictChange(event.target.value)}
        >
          {VERDICT_FILTER_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="filter-field">
        <label className="filter-field__label" htmlFor="history-limit">
          Show Up To
        </label>
        <Select
          id="history-limit"
          className="select--compact"
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
        >
          {LIMIT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option} records
            </option>
          ))}
        </Select>
      </div>

      <Button
        variant="secondary"
        icon={RefreshCw}
        onClick={onRefresh}
        loading={refreshing}
      >
        {refreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
    </div>
  )
}
