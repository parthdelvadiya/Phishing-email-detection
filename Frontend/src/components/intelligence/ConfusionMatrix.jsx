import { formatNumber, formatPercent, formatRatioPercent } from '../../utils/formatters'

export function ConfusionMatrix({ matrix, threshold, recall }) {
  if (!Array.isArray(matrix) || matrix.length !== 2) return null

  const [[tn, fp], [fn, tp]] = matrix.map((row) => row.map(Number))
  const total = tn + fp + fn + tp
  const catchRate = recall !== undefined ? formatPercent(recall) : formatRatioPercent(tp, tp + fn)

  return (
    <div className="confusion-layout">
      <div className="matrix-wrap">
        <p className="matrix-label">Test Results Grid · Trigger Cutoff {formatPercent(threshold)}</p>
        <table className="matrix">
          <caption className="sr-only">
            LightGBM confusion matrix on the held-out test set
          </caption>
          <thead>
            <tr>
              <th scope="col" className="matrix__corner">
                Actual Email \ AI Decision
              </th>
              <th scope="col">Marked Safe</th>
              <th scope="col">Marked Phishing</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Real Safe Emails</th>
              <td>
                <div className="matrix__cell matrix__cell--tn">
                  <strong>{formatNumber(tn)}</strong>
                  <span>Correctly Cleared</span>
                </div>
              </td>
              <td>
                <div className="matrix__cell matrix__cell--fp">
                  <strong>{formatNumber(fp)}</strong>
                  <span>False Alarms</span>
                </div>
              </td>
            </tr>
            <tr>
              <th scope="row">Real Phishing Attacks</th>
              <td>
                <div className="matrix__cell matrix__cell--fn">
                  <strong>{formatNumber(fn)}</strong>
                  <span>Missed Threats</span>
                </div>
              </td>
              <td>
                <div className="matrix__cell matrix__cell--tp">
                  <strong>{formatNumber(tp)}</strong>
                  <span>Correctly Caught</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="matrix-summary">
        <p className="matrix-summary__title">Real-World Safety Impact</p>
        <div className="matrix-summary__row">
          <span className="matrix-summary__label">Phishing Catch Rate</span>
          <span className="matrix-summary__value">{catchRate}</span>
        </div>
        <div className="matrix-summary__row">
          <span className="matrix-summary__label">Missed Phishing Attacks</span>
          <span className="matrix-summary__value">{formatNumber(fn)}</span>
        </div>
        <div className="matrix-summary__row">
          <span className="matrix-summary__label">False Alarms</span>
          <span className="matrix-summary__value">{formatNumber(fp)}</span>
        </div>
        <div className="matrix-summary__row">
          <span className="matrix-summary__label">Total Test Emails</span>
          <span className="matrix-summary__value">{formatNumber(total)}</span>
        </div>
        <p className="detail-note detail-note--spaced-sm">
          Safety is our top priority. Out of {formatNumber(fn + tp)} dangerous phishing attacks in the test set,
          the system caught {formatNumber(tp)} and missed only {formatNumber(fn)} ({catchRate} catch rate).
        </p>
      </div>
    </div>
  )
}
