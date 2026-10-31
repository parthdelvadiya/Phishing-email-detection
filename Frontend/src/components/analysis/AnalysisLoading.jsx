import { BrainCircuit, Link2, ShieldCheck, Sparkles } from 'lucide-react'

export function AnalysisLoading() {
  return (
    <div className="analysis-loading" role="status" aria-live="polite">
      <div className="analysis-loading__glow" aria-hidden="true" />
      <div className="analysis-loading__icon-box">
        <ShieldCheck size={28} className="analysis-loading__shield" />
        <span className="analysis-loading__radar-ring" />
        <span className="analysis-loading__radar-ring analysis-loading__radar-ring--delay" />
      </div>

      <div className="analysis-loading__content">
        <div className="analysis-loading__head">
          <p className="analysis-loading__title">
            Scanning Email for Threats
            <span className="analysis-loading__badge">
              <Sparkles size={12} />
              AI Active
            </span>
          </p>
          <p className="analysis-loading__description">
            Our dual AI security models are analyzing the message wording, inspecting links, and verifying sender authenticity.
          </p>
        </div>

        <div className="analysis-loading__progress-bar" aria-hidden="true">
          <div className="analysis-loading__progress-fill" />
        </div>

        <div className="analysis-loading__steps" aria-hidden="true">
          <span className="analysis-loading__step">
            <span className="analysis-loading__step-dot" />
            <BrainCircuit size={12} />
            Scanning language & panic tactics
          </span>
          <span className="analysis-loading__step">
            <span className="analysis-loading__step-dot" />
            <Link2 size={12} />
            Checking links & sender identity
          </span>
          <span className="analysis-loading__step">
            <span className="analysis-loading__step-dot" />
            <ShieldCheck size={12} />
            Dual AI risk calculation
          </span>
        </div>
      </div>
    </div>
  )
}
