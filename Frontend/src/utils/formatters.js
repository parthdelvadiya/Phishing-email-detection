const numberFormatter = new Intl.NumberFormat()

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return numberFormatter.format(Number(value))
}

export function formatPercent(probability, digits = 2) {
  if (probability === null || probability === undefined) return '—'

  const value = Number(probability)
  if (Number.isNaN(value)) return '—'

  return `${(value * 100).toFixed(digits)}%`
}

export function formatPercentValue(percentage, digits = 2) {
  if (percentage === null || percentage === undefined) return '—'

  const value = Number(percentage)
  if (Number.isNaN(value)) return '—'

  return `${value.toFixed(digits)}%`
}

export function formatRatioPercent(numerator, denominator, digits = 1) {
  if (!denominator) return '—'
  return `${((Number(numerator) / Number(denominator)) * 100).toFixed(digits)}%`
}

export function formatDateTime(value) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return dateTimeFormatter.format(date)
}

export function formatMetric(value, digits = 2) {
  if (value === null || value === undefined) return '—'
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return '—'
  return `${(numeric * 100).toFixed(digits)}%`
}

export function formatFeatureValue(value) {
  if (value === null || value === undefined) return '—'
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return String(value)
  if (Number.isInteger(numeric)) return new Intl.NumberFormat().format(numeric)
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 4 }).format(numeric)
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return Number(count) === 1 ? singular : plural
}
