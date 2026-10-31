import { Link2, ShieldAlert } from 'lucide-react'
import { SectionCard } from '../ui/SectionCard'
import { CopyButton } from '../ui/CopyButton'
import { formatNumber, formatPercent, pluralize } from '../../utils/formatters'

function SignalTile({ label, value, tone = 'neutral', muted = false, hint }) {
  return (
    <div className={`signal-tile${tone !== 'neutral' ? ` signal-tile--${tone}` : ''}`}>
      <p className="signal-tile__label">{label}</p>
      <p className={`signal-tile__value${muted ? ' signal-tile__value--muted' : ''}`}>
        {tone !== 'neutral' ? <span className="signal-tile__dot" aria-hidden="true" /> : null}
        {value}
      </p>
      {hint ? <p className="signal-tile__hint">{hint}</p> : null}
    </div>
  )
}

export function SecuritySignals({ result }) {
  const signals = result.security_signals ?? {}
  const urls = signals.urls ?? result.preprocessing?.urls_extracted ?? []
  const urlCount = signals.urls_detected ?? urls.length
  const urgencyScore = Number(signals.urgency_score) || 0

  const contentStats = [
    signals.word_count !== undefined
      ? {
          label: 'Message length',
          value: `${formatNumber(signals.word_count)} words (${formatNumber(signals.body_length ?? 0)} chars)`,
        }
      : null,
    signals.caps_ratio !== undefined
      ? {
          label: 'Capital letters',
          value:
            signals.caps_ratio > 0.25
              ? `High (${formatPercent(signals.caps_ratio, 0)} uppercase)`
              : 'Normal casing',
        }
      : null,
    signals.exclamation_density !== undefined
      ? {
          label: 'Punctuation style',
          value:
            signals.exclamation_density > 0.05
              ? 'Heavy exclamation marks (!)'
              : 'Standard punctuation',
        }
      : null,
  ].filter(Boolean)

  return (
    <SectionCard
      title="Security Checklist & Red Flags"
      description="Specific threat indicators checked by our system to verify if this message is safe or fraudulent."
    >
      <div className="signal-grid">
        <SignalTile
          label="Sender Authenticity"
          value={signals.sender_reply_to_mismatch ? 'Hidden Mismatch Detected' : 'Verified Consistent'}
          tone={signals.sender_reply_to_mismatch ? 'danger' : 'neutral'}
          muted={!signals.sender_reply_to_mismatch}
          hint={
            signals.sender_reply_to_mismatch
              ? 'Warning: Replies secretly route to a different address than the sender.'
              : 'Sender and reply addresses match properly.'
          }
        />
        <SignalTile
          label="Web Address Links"
          value={urlCount > 0 ? `${formatNumber(urlCount)} ${pluralize(urlCount, 'link')} found` : 'No links'}
          muted={urlCount === 0}
          hint={urlCount > 0 ? 'All links scanned for deceptive destinations' : 'Email contains no web links'}
        />
        <SignalTile
          label="Hidden IP Address Link"
          value={signals.has_ip_url ? 'Numeric IP Link Found' : 'Clean'}
          tone={signals.has_ip_url ? 'danger' : 'neutral'}
          muted={!signals.has_ip_url}
          hint={
            signals.has_ip_url
              ? 'Warning: Link uses numbers (like 192.168.1.1) to disguise a fake website.'
              : 'All links use regular website domain names.'
          }
        />
        <SignalTile
          label="Risky Domain Extension"
          value={signals.has_suspicious_tld ? 'Risky Extension Found' : 'Clean'}
          tone={signals.has_suspicious_tld ? 'danger' : 'neutral'}
          muted={!signals.has_suspicious_tld}
          hint={
            signals.has_suspicious_tld
              ? 'Warning: Uses risky domain extensions (.tk, .click, etc.) popular with scammers.'
              : 'Uses standard, trusted domain extensions (.com, .org, etc.).'
          }
        />
        <SignalTile
          label="Disguised / Shortened Link"
          value={signals.has_url_shortener ? 'Shortened Link Found' : 'Clean'}
          tone={signals.has_url_shortener ? 'danger' : 'neutral'}
          muted={!signals.has_url_shortener}
          hint={
            signals.has_url_shortener
              ? 'Warning: Uses a URL shortener (like bit.ly) to hide where the link really leads.'
              : 'No hidden or disguised web addresses.'
          }
        />
        <SignalTile
          label="Urgency & Pressure Language"
          value={urgencyScore > 0 ? `${urgencyScore} urgent ${pluralize(urgencyScore, 'word')}` : 'Normal tone'}
          tone={urgencyScore > 0 ? 'warning' : 'neutral'}
          muted={urgencyScore === 0}
          hint={
            urgencyScore > 0
              ? "Uses artificial panic ('urgent', 'suspended') to force quick mistakes."
              : 'No panic or artificial urgency detected.'
          }
        />
        <SignalTile
          label="Email Layout Style"
          value={signals.has_html ? 'Rich HTML formatted' : 'Plain text'}
          muted={!signals.has_html}
          hint={
            signals.has_html
              ? 'Email contains stylized HTML layout, buttons, or graphics.'
              : 'Simple plain text message.'
          }
        />
      </div>

      {contentStats.length > 0 ? (
        <div className="content-stats">
          {contentStats.map((stat) => (
            <div className="content-stat" key={stat.label}>
              <p className="content-stat__label">{stat.label}</p>
              <p className="content-stat__value">{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {urls.length > 0 ? (
        <div className="url-block">
          <div className="url-block__head">
            <p className="url-block__title">
              <Link2 size={14} aria-hidden="true" />
              Links Found in Email
              <span className="url-block__count">({urls.length})</span>
            </p>
            <CopyButton
              text={urls.join('\n')}
              label="Copy all links"
              copiedLabel="Copied all"
              variant="secondary"
              size="sm"
            />
          </div>
          <ul className="url-list">
            {urls.map((url, index) => (
              <li className="url-item" key={`${url}-${index}`}>
                <span className="url-item__index">{index + 1}</span>
                <span className="url-item__value">{url}</span>
                <CopyButton
                  text={url}
                  label={`Copy link ${index + 1}`}
                  copiedLabel="Copied"
                  iconOnly
                  variant="ghost"
                  size="sm"
                />
              </li>
            ))}
          </ul>
          <p className="url-block__note">
            <ShieldAlert size={12} aria-hidden="true" />
            For your security, links are displayed as plain text and are not clickable.
          </p>
        </div>
      ) : (
        <div className="url-block">
          <p className="url-block__title">
            <Link2 size={14} aria-hidden="true" />
            Links in Email
          </p>
          <p className="url-empty">No website links were found in the email body.</p>
        </div>
      )}
    </SectionCard>
  )
}
