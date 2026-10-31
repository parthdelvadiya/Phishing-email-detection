const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const DOMAIN_PATTERN =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i

function extractAddress(value) {
  const trimmed = value.trim()
  const angleMatch = trimmed.match(/<([^>]+)>/)
  return angleMatch ? angleMatch[1].trim() : trimmed
}

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(extractAddress(value))
}

export function isValidEmailOrDomain(value) {
  const address = extractAddress(value)
  return EMAIL_PATTERN.test(address) || DOMAIN_PATTERN.test(address)
}

export function validateAnalysisForm(form) {
  const errors = {}

  if (!form.text.trim()) {
    errors.text = 'Please paste the email text or message content before scanning.'
  }

  if (form.sender.trim() && !isValidEmailOrDomain(form.sender)) {
    errors.sender = 'Please enter a valid sender email (e.g. alert@company.com or company.com).'
  }

  if (form.recipient.trim() && !isValidEmail(form.recipient)) {
    errors.recipient = 'Please enter a valid recipient email address (e.g. you@company.com).'
  }

  if (form.reply_to.trim() && !isValidEmailOrDomain(form.reply_to)) {
    errors.reply_to = 'Please enter a valid reply-to email address or domain.'
  }

  if (form.subject.length > 500) {
    errors.subject = 'The subject line must be 500 characters or fewer.'
  }

  return errors
}
