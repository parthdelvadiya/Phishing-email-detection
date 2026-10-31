import { EVALUATION_TIMEOUT, PREDICTION_TIMEOUT } from '../config'
import { request } from './client'

export function analyzeEmail(payload, { signal } = {}) {
  return request('/predict/', {
    method: 'POST',
    body: payload,
    timeoutMs: PREDICTION_TIMEOUT,
    signal,
  })
}

export function getModelInfo({ signal } = {}) {
  return request('/model-info/', { signal })
}

export function getDatasetSummary({ signal } = {}) {
  return request('/dataset/', { signal })
}

export function getEvaluationReport({ signal } = {}) {
  return request('/evaluation/', { signal })
}

export function runEvaluation({ signal } = {}) {
  return request('/evaluation/run/', {
    method: 'POST',
    timeoutMs: EVALUATION_TIMEOUT,
    signal,
  })
}

export function getPredictionHistory({ verdict = '', search = '', limit = 50 } = {}, { signal } = {}) {
  const params = new URLSearchParams()

  if (verdict) params.set('verdict', verdict)
  if (search.trim()) params.set('search', search.trim())
  if (limit) params.set('limit', String(limit))

  const query = params.toString()
  return request(`/history/${query ? `?${query}` : ''}`, { signal })
}

export function getPredictionRecord(id, { signal } = {}) {
  return request(`/history/${encodeURIComponent(id)}/`, { signal })
}

export function deletePredictionRecord(id, { signal } = {}) {
  return request(`/history/${encodeURIComponent(id)}/`, {
    method: 'DELETE',
    signal,
  })
}
