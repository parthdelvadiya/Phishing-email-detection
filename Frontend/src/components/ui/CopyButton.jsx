import { useEffect, useRef, useState } from 'react'
import { Check, Copy, TriangleAlert } from 'lucide-react'
import { Button } from './Button'
import { copyText } from '../../utils/clipboard'

export function CopyButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied',
  errorLabel = 'Copy failed',
  variant = 'ghost',
  size = 'sm',
  iconOnly = false,
  className,
}) {
  const [status, setStatus] = useState('idle')
  const timerRef = useRef(null)

  useEffect(() => {
    return () => window.clearTimeout(timerRef.current)
  }, [])

  async function handleCopy() {
    window.clearTimeout(timerRef.current)
    const success = await copyText(String(text ?? ''))
    setStatus(success ? 'copied' : 'error')
    timerRef.current = window.setTimeout(() => setStatus('idle'), 2200)
  }

  const Icon = status === 'copied' ? Check : status === 'error' ? TriangleAlert : Copy
  const visibleLabel = status === 'copied' ? copiedLabel : status === 'error' ? errorLabel : label

  return (
    <Button
      variant={variant}
      size={size}
      icon={Icon}
      iconOnly={iconOnly}
      className={className}
      onClick={handleCopy}
      title={iconOnly ? visibleLabel : undefined}
      aria-live="polite"
    >
      {visibleLabel}
    </Button>
  )
}
