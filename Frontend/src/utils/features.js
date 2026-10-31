export const STRUCTURAL_FEATURE_LABELS = {
  url_count: 'Total links found',
  has_ip_url: 'Link disguised with numeric IP address',
  has_suspicious_tld: 'Risky website extension (.tk, .click, etc.)',
  has_url_shortener: 'Hidden destination link (shortened URL)',
  max_url_length: 'Longest link length (characters)',
  mean_url_entropy: 'Scrambled or deceptive link characters',
  sender_reply_to_mismatch: 'Sender & Reply-To address mismatch',
  urgency_score: 'Panic or pressure words in subject',
  has_html: 'Rich HTML layout & formatting',
  body_length: 'Message character count',
  word_count: 'Total word count',
  exclamation_density: 'Heavy exclamation marks (!)',
  caps_ratio: 'Percentage of CAPITAL letters',
}

export function getFeatureLabel(name) {
  return (
    STRUCTURAL_FEATURE_LABELS[name] ??
    name.replaceAll('_', ' ').replace(/^\w/, (character) => character.toUpperCase())
  )
}
