export const VERDICT_META = {
  phishing: {
    label: 'Phishing Threat',
    tone: 'danger',
    title: 'Phishing Attack Detected',
  },
  legitimate: {
    label: 'Safe Email',
    tone: 'success',
    title: 'This Email Looks Safe',
  },
  model_disagreement: {
    label: 'Suspicious Email',
    tone: 'warning',
    title: 'Suspicious Email (Proceed with Caution)',
  },
}

const FALLBACK_META = {
  label: 'Unknown',
  tone: 'neutral',
  title: 'Check Complete',
}

export function getVerdictMeta(verdict) {
  return VERDICT_META[verdict] ?? FALLBACK_META
}

export function getVerdictDescription(result) {
  const { verdict, model_agreement: agreement } = result

  if (verdict === 'phishing') {
    return agreement
      ? 'Warning: High Threat! Both AI security engines detected strong signs of email fraud or phishing. Do not click links, open attachments, or reply.'
      : 'Warning: Potential Threat! Our primary AI security engine flagged this message as a phishing scam. Treat it with caution.'
  }

  if (verdict === 'legitimate') {
    return agreement
      ? 'All clear! Both AI models checked this email and found standard, safe communication. No phishing indicators or suspicious links were detected.'
      : 'This email appears safe and normal. No dangerous phishing indicators were detected.'
  }

  return 'Exercise caution! Our two AI engines returned mixed signals on this message. Carefully verify the sender before opening links or replying.'
}

export const VERDICT_FILTER_OPTIONS = [
  { value: '', label: 'All Checks' },
  { value: 'phishing', label: 'Phishing Threats' },
  { value: 'legitimate', label: 'Safe Emails' },
  { value: 'model_disagreement', label: 'Suspicious Emails' },
]
