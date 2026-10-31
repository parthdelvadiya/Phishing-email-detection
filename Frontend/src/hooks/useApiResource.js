import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Small data-fetching hook tailored to the DRF API.
 * `key` identifies the request; changing it automatically refetches.
 * The fetcher receives an AbortSignal so in-flight requests are cancelled.
 */
export function useApiResource(fetcher, key, { immediate = true, initialData = null } = {}) {
  const fetcherRef = useRef(fetcher)
  const requestIdRef = useRef(0)
  const abortRef = useRef(null)

  const [state, setState] = useState({
    data: initialData,
    error: null,
    loading: immediate,
    refreshing: false,
  })

  fetcherRef.current = fetcher

  const load = useCallback(async ({ silent = false } = {}) => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState((current) => ({
      ...current,
      error: null,
      loading: !silent && current.data == null,
      refreshing: current.data != null || silent,
    }))

    try {
      const data = await fetcherRef.current({ signal: controller.signal })

      if (requestId !== requestIdRef.current) return undefined

      setState({
        data,
        error: null,
        loading: false,
        refreshing: false,
      })

      return data
    } catch (error) {
      if (
        error.name === 'AbortError' ||
        requestId !== requestIdRef.current ||
        controller.signal.aborted
      ) {
        return undefined
      }

      setState((current) => ({
        ...current,
        error,
        loading: false,
        refreshing: false,
      }))

      return undefined
    }
  }, [])

  useEffect(() => {
    if (!immediate) return undefined

    load()

    return () => {
      requestIdRef.current += 1
      abortRef.current?.abort()
    }
    // `key` intentionally represents the complete request identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, immediate, load])

  const setData = useCallback((updater) => {
    setState((current) => ({
      ...current,
      data: typeof updater === 'function' ? updater(current.data) : updater,
      error: null,
      loading: false,
      refreshing: false,
    }))
  }, [])

  return {
    ...state,
    refetch: load,
    setData,
  }
}
