import { PageHeader } from '../components/ui/PageHeader'
import { EngineOverview } from '../components/intelligence/EngineOverview'
import { DatasetOverview } from '../components/intelligence/DatasetOverview'
import { EvaluationSection } from '../components/intelligence/EvaluationSection'

export function IntelligencePage() {
  return (
    <>
      <PageHeader
        eyebrow="System Health & Accuracy"
        title="AI Accuracy & Protection Status"
        description="Check live AI protection status, training knowledge base stats, and verified test accuracy across 12,969 real-world emails."
      />

      <div className="stack stack--lg">
        <div className="intel-section">
          <EngineOverview />
        </div>
        <div className="intel-section">
          <DatasetOverview />
        </div>
        <div className="intel-section">
          <EvaluationSection />
        </div>
      </div>
    </>
  )
}
