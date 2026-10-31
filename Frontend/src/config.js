const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim()

export const API_BASE_URL = (configuredBase || '/api').replace(/\/+$/, '')

export const DEFAULT_REQUEST_TIMEOUT = 60_000
export const PREDICTION_TIMEOUT = 180_000
export const EVALUATION_TIMEOUT = 15 * 60_000

export const LIGHTGBM_FALLBACK_THRESHOLD = 0.36
