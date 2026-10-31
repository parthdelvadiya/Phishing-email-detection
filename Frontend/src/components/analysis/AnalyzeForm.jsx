import { useRef, useState } from 'react'
import { FlaskConical, RotateCcw, ScanSearch, ShieldAlert, ShieldCheck } from 'lucide-react'
import { SectionCard } from '../ui/SectionCard'
import { FormField, TextArea, TextInput } from '../ui/FormField'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { validateAnalysisForm } from '../../utils/validation'
import { LEGITIMATE_SAMPLE, PHISHING_SAMPLE } from '../../utils/samples'
import { formatNumber } from '../../utils/formatters'

const EMPTY_FORM = {
  text: '',
  sender: '',
  recipient: '',
  reply_to: '',
  subject: '',
  save_record: true,
}

function countWords(text) {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

export function AnalyzeForm({ onAnalyze, isAnalyzing, apiError, onDismissError, onClearResult }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const formRef = useRef(null)
  const textareaRef = useRef(null)

  const isDirty =
    Boolean(form.text || form.sender || form.recipient || form.reply_to || form.subject) ||
    form.save_record !== true

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
    if (apiError) onDismissError?.()
  }

  function loadSample(sample) {
    setForm({ ...sample })
    setErrors({})
    onDismissError?.()
    onClearResult?.()
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  function handleReset() {
    setForm(EMPTY_FORM)
    setErrors({})
    onDismissError?.()
    onClearResult?.()
    requestAnimationFrame(() => formRef.current?.querySelector('[name="text"]')?.focus())
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = validateAnalysisForm(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const firstInvalid = Object.keys(nextErrors)[0]
      formRef.current?.querySelector(`[name="${firstInvalid}"]`)?.focus()
      return
    }

    setErrors({})
    onAnalyze({
      text: form.text.trim(),
      sender: form.sender.trim(),
      recipient: form.recipient.trim(),
      reply_to: form.reply_to.trim(),
      subject: form.subject.trim(),
      save_record: form.save_record,
    })
  }

  const wordCount = countWords(form.text)
  const charCount = form.text.length

  return (
    <SectionCard
      title="Check an Email for Safety"
      description="Paste any suspicious message below to quickly check if it is safe or a dangerous scam."
    >
      <form className="form" ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="sample-row">
          <span className="sample-row__label">Try an example:</span>
          <button
            type="button"
            className="sample-button sample-button--phishing"
            onClick={() => loadSample(PHISHING_SAMPLE)}
          >
            <ShieldAlert size={14} aria-hidden="true" />
            Try Scam Example
          </button>
          <button
            type="button"
            className="sample-button sample-button--safe"
            onClick={() => loadSample(LEGITIMATE_SAMPLE)}
          >
            <ShieldCheck size={14} aria-hidden="true" />
            Try Safe Example
          </button>
        </div>

        {apiError ? (
          <Alert tone="danger" title="Check could not be completed" onDismiss={onDismissError}>
            {apiError.message}
          </Alert>
        ) : null}

        <div className="form__grid">
          <FormField
            label="Sender email address"
            htmlFor="sender"
            error={errors.sender}
            hint="Who sent the email (From address)."
          >
            <TextInput
              id="sender"
              name="sender"
              type="text"
              inputMode="email"
              autoComplete="off"
              value={form.sender}
              onChange={(event) => updateField('sender', event.target.value)}
              maxLength={255}
              placeholder="e.g. security-alert@bank.com"
              invalid={Boolean(errors.sender)}
              aria-describedby={errors.sender ? 'sender-error' : 'sender-hint'}
            />
          </FormField>

          <FormField
            label="Reply-To address (optional)"
            htmlFor="reply_to"
            error={errors.reply_to}
            hint="Where replies actually go (scammers often disguise this)."
          >
            <TextInput
              id="reply_to"
              name="reply_to"
              type="text"
              inputMode="email"
              autoComplete="off"
              value={form.reply_to}
              onChange={(event) => updateField('reply_to', event.target.value)}
              maxLength={255}
              placeholder="e.g. hidden-hacker@evil-domain.com"
              invalid={Boolean(errors.reply_to)}
              aria-describedby={errors.reply_to ? 'reply_to-error' : 'reply_to-hint'}
            />
          </FormField>

          <FormField
            label="Your email address (optional)"
            htmlFor="recipient"
            error={errors.recipient}
            hint="The recipient address (To)."
          >
            <TextInput
              id="recipient"
              name="recipient"
              type="email"
              autoComplete="off"
              value={form.recipient}
              onChange={(event) => updateField('recipient', event.target.value)}
              maxLength={255}
              placeholder="you@company.com"
              invalid={Boolean(errors.recipient)}
              aria-describedby={errors.recipient ? 'recipient-error' : 'recipient-hint'}
            />
          </FormField>
        </div>

        <FormField
          label="Email subject line (optional)"
          htmlFor="subject"
          error={errors.subject}
          hint="Helps detect urgency tricks like 'Urgent: Your account is suspended!'"
        >
          <TextInput
            id="subject"
            name="subject"
            value={form.subject}
            onChange={(event) => updateField('subject', event.target.value)}
            maxLength={500}
            placeholder="e.g. Urgent: Account suspended, please verify your details"
            invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? 'subject-error' : 'subject-hint'}
          />
        </FormField>

        <FormField
          label="Email message content"
          htmlFor="text"
          required
          error={errors.text}
          className="field--body"
        >
          <TextArea
            ref={textareaRef}
            id="text"
            name="text"
            value={form.text}
            onChange={(event) => updateField('text', event.target.value)}
            placeholder="Paste the email message text or content here..."
            spellCheck="false"
            invalid={Boolean(errors.text)}
            aria-describedby={errors.text ? 'text-error' : undefined}
          />
          <div className="field__meta">
            <span>You can paste normal email text or raw message content.</span>
            <span>
              {formatNumber(wordCount)} {wordCount === 1 ? 'word' : 'words'} ·{' '}
              {formatNumber(charCount)} {charCount === 1 ? 'character' : 'characters'}
            </span>
          </div>
        </FormField>

        <div className="form__footer">
          <label className="switch">
            <input
              className="switch__input"
              type="checkbox"
              name="save_record"
              checked={form.save_record}
              onChange={(event) => updateField('save_record', event.target.checked)}
            />
            <span className="switch__track" aria-hidden="true">
              <span className="switch__thumb" />
            </span>
            <span className="switch__text">
              <span className="switch__title">Save to scan history</span>
              <span className="switch__description">
                Keep this check in your history so you can review or share it later.
              </span>
            </span>
          </label>

          <div className="form__actions">
            <Button
              variant="ghost"
              icon={RotateCcw}
              onClick={handleReset}
              disabled={!isDirty || isAnalyzing}
            >
              Clear Form
            </Button>
            <Button type="submit" icon={ScanSearch} loading={isAnalyzing} size="lg">
              {isAnalyzing ? 'Scanning email...' : 'Scan Email Now'}
            </Button>
          </div>
        </div>
      </form>
    </SectionCard>
  )
}
