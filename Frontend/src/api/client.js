import { API_BASE_URL, DEFAULT_REQUEST_TIMEOUT } from '../config'

export class ApiError extends Error {
  constructor(message, status = 0, payload = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

function parseBody(text) {
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function fallbackMessage(status) {
  if (status === 400) return 'The request was rejected. Check the submitted values and try again.'
  if (status === 404) return 'The requested resource could not be found.'
  if (status >= 500) return 'The detection service encountered an internal error.'
  return `The request failed with status ${status}.`
}

/**
 * Calls the DRF API and unwraps its `{ error, data, message, statuscode }`
 * response envelope. Every failure is surfaced as an ApiError.
 */
export async function request(path, options = {}) {
  const {
    method = 'GET',
    body,
    timeoutMs = DEFAULT_REQUEST_TIMEOUT,
    signal,
    headers = {},
  } = options

  const controller = new AbortController()
  let timedOut = false

  const timeoutId = window.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  const abortFromCaller = () => controller.abort()

  if (signal) {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener('abort', abortFromCaller, { once: true })
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    const text = await response.text()
    const payload = parseBody(text)

    if (!response.ok || payload?.error) {
      const message =
        payload?.message ||
        fallbackMessage(response.status) ||
        'The request could not be completed.'

      throw new ApiError(message, response.status, payload)
    }

    if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) {
      return payload.data
    }

    if (payload !== null) {
      return payload
    }

    throw new ApiError('The detection service returned an unreadable response.', response.status)
  } catch (error) {
    if (error instanceof ApiError) throw error

    if (error.name === 'AbortError') {
      if (timedOut) {
        throw new ApiError(
          'The request timed out. The detection engine may still be starting up — please try again.',
          408
        )
      }

      throw error
    }

    throw new ApiError(
      'Unable to reach the detection service. Make sure the Django backend is running and the API proxy is configured.',
      0
    )
  } finally {
    window.clearTimeout(timeoutId)

    if (signal) {
      signal.removeEventListener('abort', abortFromCaller)
    }
  }
}
