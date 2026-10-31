import { SectionCard } from '../ui/SectionCard'

function MetadataItem({ label, value, full = false }) {
  const hasValue = Boolean(value)

  return (
    <div className={`metadata-item${full ? ' metadata-item--full' : ''}`}>
      <p className="metadata-item__label">{label}</p>
      <p className={`metadata-item__value${hasValue ? '' : ' metadata-item__value--muted'}`}>
        {hasValue ? value : 'Not provided'}
      </p>
    </div>
  )
}

export function EmailMetadata({ result }) {
  const metadata = result.metadata ?? {}

  return (
    <SectionCard
      title="Email Sender & Recipient Details"
      description="Header addresses provided for this check. Empty fields were not provided."
    >
      <div className="metadata-grid">
        <MetadataItem label="Subject" value={metadata.subject} full />
        <MetadataItem label="Sender Address" value={metadata.sender} />
        <MetadataItem label="Recipient Address" value={metadata.recipient} />
        <MetadataItem label="Sender Domain" value={metadata.sender_domain} />
        <MetadataItem label="Reply-To Address" value={metadata.reply_to} />
        <MetadataItem label="Reply-To Domain" value={metadata.reply_to_domain} />
      </div>
    </SectionCard>
  )
}
