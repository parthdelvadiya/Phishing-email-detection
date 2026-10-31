import { VerdictSummary } from './VerdictSummary'
import { ModelBreakdown } from './ModelBreakdown'
import { SecuritySignals } from './SecuritySignals'
import { EmailMetadata } from './EmailMetadata'
import { OriginalEmail } from './OriginalEmail'

export function AnalysisResult({
  result,
  context = 'live',
  recordId,
  createdAt,
  heroActions,
  emailBody,
}) {
  return (
    <div className="result-stack">
      <VerdictSummary
        result={result}
        context={context}
        recordId={recordId}
        createdAt={createdAt}
        actions={heroActions}
      />
      <ModelBreakdown result={result} />
      <SecuritySignals result={result} />
      <EmailMetadata result={result} />
      {emailBody ? <OriginalEmail text={emailBody} /> : null}
    </div>
  )
}
