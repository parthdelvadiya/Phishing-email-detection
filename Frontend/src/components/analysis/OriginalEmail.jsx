import { SectionCard } from '../ui/SectionCard'
import { CopyButton } from '../ui/CopyButton'

export function OriginalEmail({ text }) {
  return (
    <SectionCard
      title="Submitted Email Content"
      description="The exact email text that was scanned."
      actions={
        <CopyButton
          text={text ?? ''}
          label="Copy text"
          copiedLabel="Copied"
          variant="secondary"
        />
      }
    >
      <div className="email-body email-body--clamped">{text || 'No email body was stored.'}</div>
    </SectionCard>
  )
}
