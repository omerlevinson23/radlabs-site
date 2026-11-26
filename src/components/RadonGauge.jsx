import { useState } from 'react'
import { arc as d3arc } from 'd3-shape'
import { radon } from '../data.js'
import { Head } from './ui.jsx'

// A reading against Israel's action level for homes and schools (200 Bq/m³). The red zone starts at the limit.
const MAX = 400, LIMIT = radon.actionLevel
const W = 520, H = 330, CX = W / 2, CY = 270, R0 = 168, R1 = 200
const a = v => -Math.PI / 2 + (v / MAX) * Math.PI
const arc = d3arc().innerRadius(R0).outerRadius(R1).cornerRadius(3)
const polar = (v, r) => [r * Math.sin(a(v)), -r * Math.cos(a(v))]

function verdict(v) {
  const pct = Math.round(v / LIMIT * 100)
  if (v > LIMIT) return ['bad', 'מעל רמת הפעולה', `${v} Bq/m³ הוא ${pct}% מרמת הפעולה. מומלץ לטפל: אוורור, איטום או מערכת הפחתה, ואז מדידה חוזרת.`]
  if (v >= 150) return ['warn', 'קרוב לרמת הפעולה', `${v} Bq/m³ הוא ${pct}% מרמת הפעולה. כדאי לשפר את האוורור ולבדוק שוב.`]
  return ['ok', 'מתחת לרמת הפעולה', `${v} Bq/m³ הוא כ-${pct}% מרמת הפעולה. מתחת לרמת הפעולה של המשרד להגנת הסביבה. ארגון הבריאות העולמי ממליץ לשאוף לפחות מ-100 Bq/m³.`]
}

export default function RadonGauge() {
  const [v, setV] = useState(72)
  const [kind, chip, text] = verdict(v)
  return (
    <section id="result" aria-labelledby="result-title" className="section">
      <div className="container">
        <Head id="result-title" title="התוצאה שלכם מול רמת הפעולה" lead={`רמת הפעולה בישראל למגורים ולמוסדות חינוך היא ${LIMIT} Bq/m³. כך תיראה התוצאה בתעודה.`} />
        <div className="rx-panel glass rx-gauge-wrap">
          <svg className="rx-gauge" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`מד ראדון: ${v} Bq/m³, רמת הפעולה ${LIMIT}`}>
            <g transform={`translate(${CX},${CY})`}>
              <path className="rx-arc-bg" d={arc({ startAngle: a(0), endAngle: a(LIMIT) })} />
              <path className="rx-arc-on" opacity={v > LIMIT ? .35 : 1} d={arc({ startAngle: a(0), endAngle: a(Math.min(v, LIMIT)) })} />
              <path className="rx-arc-zone" d={arc({ startAngle: a(LIMIT), endAngle: a(MAX) })} />
              {Array.from({ length: 21 }, (_, i) => {
                const t = i * MAX / 20, major = i % 5 === 0, [x1, y1] = polar(t, R1 + 6), [x2, y2] = polar(t, R1 + (major ? 20 : 13))
                return <line key={i} className={major ? 'rx-tick rx-tick--major' : 'rx-tick'} x1={x1} y1={y1} x2={x2} y2={y2} />
              })}
              {[[0, '0', 'rx-tlabel', 14], [MAX, String(MAX), 'rx-tlabel', 14], [LIMIT, `רמת פעולה ${LIMIT}`, 'rx-limit', -6]].map(([t, s, c, dy]) => {
                const [x, y] = polar(t, R1 + 36)
                return <text key={s} className={c} x={x} y={y + dy} textAnchor="middle" dominantBaseline="middle">{s}</text>
              })}
              {/* a short line needle just inside the arc (length 0.22 of the radius), so the value in the centre stays clear */}
              <line className="rx-needle" x1="0" y1={-R0 * 0.74} x2="0" y2={-R0 * 0.96} style={{ transform: `rotate(${(v / MAX) * 180 - 90}deg)` }} />
              <text className="rx-cv fig" y="-40" textAnchor="middle">{v}</text>
              <text className="rx-cu" y="-6" textAnchor="middle">Bq/m³</text>
            </g>
          </svg>
          <div className="rx-verdict">
            <span className={`rx-chip rx-chip--${kind}`} role="status">{chip}</span>
            <p id="rx-verdict-text">{text}</p>
            <div className="rx-try">
              <label htmlFor="rx-reading">נסו תוצאה אחרת (לדוגמה)</label>
              <input id="rx-reading" type="range" min="0" max={MAX} step="1" value={v} onChange={e => setV(+e.target.value)} aria-describedby="rx-verdict-text" />
            </div>
            <p className="rx-note">רמת הפעולה: הנחיה 2, "בדיקת ריכוז ראדון במבנים", המשרד להגנת הסביבה (2016). במקומות עבודה: 500 Bq/m³. הערך 72 הוא דוגמה.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
