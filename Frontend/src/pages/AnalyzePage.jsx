import { useEffect, useRef, useState } from 'react'
import { History, LockKeyhole, PencilLine, ShieldCheck, Sparkles } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { ButtonLink } from '../components/ui/ButtonLink'
import { AnalyzeForm } from '../components/analysis/AnalyzeForm'
import { AnalysisLoading } from '../components/analysis/AnalysisLoading'
import { AnalysisResult } from '../components/analysis/AnalysisResult'
import { analyzeEmail } from '../api/endpoints'

export function AnalyzePage() {
  const [result, setResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [submittedText, setSubmittedText] = useState('')
  const resultRef = useRef(null)
  const abortRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      abortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (!isAnalyzing && !result) return

    const frame = requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    return () => cancelAnimationFrame(frame)
  }, [isAnalyzing, result])

  async function handleAnalyze(payload) {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsAnalyzing(true)
    setApiError(null)
    setResult(null)
    setSubmittedText(payload.text || '')

    try {
      const data = await analyzeEmail(payload, { signal: controller.signal })
      if (!mountedRef.current || controller.signal.aborted) return
      setResult(data)
    } catch (error) {
      if (error.name === 'AbortError' || controller.signal.aborted) return
      if (!mountedRef.current) return
      setApiError(error)
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    } finally {
      if (mountedRef.current && !controller.signal.aborted) {
        setIsAnalyzing(false)
      }
    }
  }

  function handleEditAndRescan() {
    setResult(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.setTimeout(() => document.getElementById('text')?.focus({ preventScroll: true }), 350)
  }

  function handleClearResult() {
    setResult(null)
    setApiError(null)
  }

  return (
    <>
      <PageHeader
        eyebrow="AI Security Shield"
        title="Check an Email for Phishing"
        description="Paste any suspicious message below to quickly check if it is safe or a dangerous scam."
        actions={
          <ButtonLink to="/history" variant="secondary" icon={History}>
            Scan History
          </ButtonLink>
        }
      />

      <div className="hero-trust-row" aria-label="Security features">
        <div className="trust-pill">
          <span className="trust-pill__dot trust-pill__dot--live" />
          <span className="trust-pill__text">Dual AI Protection Active</span>
        </div>
        <div className="trust-pill">
          <Sparkles size={13} className="trust-pill__icon" />
          <span className="trust-pill__text">15,000+ Scam Patterns Checked</span>
        </div>
        <div className="trust-pill">
          <LockKeyhole size={13} className="trust-pill__icon" />
          <span className="trust-pill__text">Private & Secure Scanning</span>
        </div>
      </div>

      <div className="analyze-workspace">
        <AnalyzeForm
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          apiError={apiError}
          onDismissError={() => setApiError(null)}
          onClearResult={handleClearResult}
        />
        <div className="analysis-note">
          <ShieldCheck size={16} aria-hidden="true" />
          PhishGuard AI analyzes language patterns, hidden links, and sender domains to protect you from email fraud.
        </div>
      </div>

      <div className="result-region" ref={resultRef}>
        {isAnalyzing ? <AnalysisLoading /> : null}

        {!isAnalyzing && result ? (
          <AnalysisResult
            result={result}
            context="live"
            recordId={result.record_id}
            emailBody={submittedText || result?.preprocessing?.plain_text}
            heroActions={
              <>
                {result.record_id ? (
                  <ButtonLink
                    to={`/history/${result.record_id}`}
                    variant="secondary"
                    size="sm"
                  >
                    View saved check
                  </ButtonLink>
                ) : null}
                <Button variant="ghost" size="sm" icon={PencilLine} onClick={handleEditAndRescan}>
                  Edit and scan again
                </Button>
              </>
            }
          />
        ) : null}
      </div>
    </>
  )
}
