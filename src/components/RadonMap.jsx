import { useEffect, useRef, useState } from 'react'
import { geoOrthographic, geoPath, geoCentroid, geoDistance, geoInterpolate } from 'd3-geo'
import { select, pointer } from 'd3-selection'
import 'd3-transition'
import { easeCubicInOut } from 'd3-ease'
import { interpolate, interpolateLab } from 'd3-interpolate'
import { scaleLinear } from 'd3-scale'
import { drag } from 'd3-drag'
import { feature } from 'topojson-client'
import worldTopo from '../geo/world.json'
import israel from '../geo/israel.json'
import { radon, services } from '../data.js'
import Statement from './Statement.jsx'

// Globe first, then a fly-in to Israel's districts. Country averages are real (WHO 2009, Table 4);
// district values are placeholders until RAD-LABs' own test averages replace them in data.js.
const IL = [35.0, 31.45]
const OVER = { yaw: 14, tilt: 18 }
const world = feature(worldTopo, worldTopo.objects.countries)
// Example district values never reach the live site: only previews and dev show them until districtsReady.
const SHOW_DISTRICTS = radon.districtsReady || import.meta.env.MODE !== 'production'

export default function RadonMap() {
  const box = useRef(null), tipRef = useRef(null), api = useRef({})
  const [focus, setFocus] = useState(false)

  useEffect(() => {
    const el = box.current, tip = tipRef.current
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const tokens = () => { const st = getComputedStyle(document.documentElement); return ['--rx-s0', '--rx-s1', '--rx-s2', '--rx-s3', '--rx-danger'].map(n => st.getPropertyValue(n).trim()) }
    const color = v => scaleLinear([0, 50, 100, 150, 200], tokens()).interpolate(interpolateLab).clamp(true)(v)
    const { countries: C } = radon, D = SHOW_DISTRICTS ? radon.districts : {}

    const svg = select(el).insert('svg', ':first-child').attr('role', 'group').attr('aria-label', 'כדור הארץ עם ממוצעי ראדון לפי מדינה; בהתקרבות לישראל מוצגים המחוזות')
    svg.append('defs').append('pattern').attr('id', 'rx-dots').attr('width', 9).attr('height', 9).attr('patternUnits', 'userSpaceOnUse')
      .append('circle').attr('cx', 4.5).attr('cy', 4.5).attr('r', 1.1).attr('class', 'rx-dot')
    const g = svg.append('g')
    const proj = geoOrthographic().clipAngle(90).precision(0.3), path = geoPath(proj)
    const sphere = g.append('path').datum({ type: 'Sphere' }).attr('class', 'rx-sphere')
    const dots = g.append('path').datum({ type: 'Sphere' }).attr('class', 'rx-dots')
    const landG = g.append('g'), distG = g.append('g'), labelG = g.append('g'), pinG = g.append('g')
    let W = 0, H = 0, R = 0, focused = false, yawP = 0, yawTarget = 0
    let state = { lon: IL[0] - OVER.yaw, lat: IL[1] - OVER.tilt, k: 1 }

    const draw = () => {
      proj.translate([W / 2, H / 2 + (focused ? 0 : H * 0.04)]).scale(R * state.k).rotate([-(state.lon + yawP), -state.lat, 0])
      sphere.attr('d', path); dots.attr('d', path)
      landG.selectAll('path').attr('d', path); distG.selectAll('path').attr('d', path)
      labelG.selectAll('text').attr('transform', d => { const p = proj(geoCentroid(d)); return p ? `translate(${p})` : 'translate(-999,-999)' })
      pinG.selectAll('g').attr('transform', d => `translate(${proj(d) || [-999, -999]})`)
        .attr('opacity', d => geoDistance(d, [-proj.rotate()[0], -proj.rotate()[1]]) < Math.PI / 2 ? 1 : 0)
    }
    const size = () => { const r = el.getBoundingClientRect(); W = r.width; H = r.height; R = Math.min(W, H) * 0.44; svg.attr('viewBox', `0 0 ${W} ${H}`); draw() }
    const place = (e, d) => {
      const r = el.getBoundingClientRect(); let cx, cy
      if (e.type === 'focus') { const p = proj(geoCentroid(d)); cx = p[0] * r.width / W; cy = p[1] * r.height / H } else { cx = e.clientX - r.left; cy = e.clientY - r.top }
      tip.style.left = Math.min(Math.max(cx, 90), r.width - 90) + 'px'; tip.style.top = Math.max(cy, 80) + 'px'; tip.hidden = false
    }
    // Built from text nodes, never parsed as HTML, so tooltip text can't run as markup.
    const showTip = (e, [title, line, note], d) => { tip.replaceChildren(...[['strong', title], ['span', line], ['em', note]].map(([t, x]) => { const n = document.createElement(t); n.textContent = x; return n })); place(e, d) }
    const hide = () => { tip.hidden = true }

    landG.selectAll('path').data(world.features).join('path')
      .attr('class', d => 'rx-land' + (d.id === '376' ? ' rx-land--il' : '') + (C[d.id] ? ' rx-land--data' : ''))
      .style('--c', d => C[d.id] ? color(C[d.id][1]) : null)
      .attr('tabindex', d => C[d.id] ? 0 : null).attr('role', d => C[d.id] ? 'img' : null)
      .attr('aria-label', d => C[d.id] ? `${C[d.id][0]}: ממוצע ${C[d.id][1]} Bq/m³` : null)
      .on('pointermove focus', (e, d) => { const x = C[d.id]; if (!x || focused) return; showTip(e, [`${x[0]}`, `ממוצע ארצי: ${x[1]} Bq/m³`, `${d.id === '376' ? 'המשרד להגנת הסביבה. לחצו להתקרבות' : 'WHO, 2009'}`], d) })
      .on('pointerleave blur', () => { if (!focused) hide() })
      .on('keydown', (e, d) => { if (d.id === '376' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); zoom(true) } })
    distG.selectAll('path').data(israel.features).join('path')
      .attr('class', d => D[d.properties.id] ? 'rx-district' : 'rx-district rx-district--none')
      .attr('fill', d => D[d.properties.id] ? color(D[d.properties.id][1]) : null)
      .attr('tabindex', d => D[d.properties.id] ? -1 : null).attr('role', d => D[d.properties.id] ? 'img' : null)
      .attr('aria-label', d => { const x = D[d.properties.id]; return x ? `${x[0]}: ${x[1]} Bq/m³, ערך לדוגמה` : null })
      .on('pointermove focus', (e, d) => { const x = D[d.properties.id]; if (!x || !focused) return; showTip(e, [`${x[0]}`, `ממוצע: ${x[1]} Bq/m³`, `ערך לדוגמה, לא נתון מדידה`], d) })
      .on('pointerleave blur', hide)
    labelG.selectAll('text').data(israel.features.filter(f => radon.districts[f.properties.id])).join('text')
      .attr('class', 'rx-dlabel').attr('dy', '0.35em').text(d => radon.districts[d.properties.id][0].replace('מחוז ', ''))
    const pin = pinG.selectAll('g').data([[34.95, 32.28]]).join('g').attr('class', 'rx-pin')
    pin.append('circle').attr('class', 'rx-glow').attr('r', 6).attr('cy', -14)
    pin.append('circle').attr('class', 'rx-pulse').attr('r', 6)
    pin.append('path').attr('d', 'M0 0 C -2 -6 -7 -9 -7 -14 A 7 7 0 1 1 7 -14 C 7 -9 2 -6 0 0 Z')

    function zoom(on) {
      if (on === focused) return
      focused = on; setFocus(on); el.classList.toggle('is-focus', on); hide()
      distG.selectAll('path').attr('tabindex', d => D[d.properties.id] ? (on ? 0 : -1) : null)
      const from = { ...state }, to = on ? { lon: IL[0], lat: IL[1], k: (H * 0.82) / (4.6 * Math.PI / 180 * R) } : { lon: IL[0] - OVER.yaw, lat: IL[1] - OVER.tilt, k: 1 }
      if (on) yawTarget = 0
      if (reduced) { state = to; yawP = 0; draw(); return }
      const ik = interpolate(Math.log(from.k), Math.log(to.k)), il = geoInterpolate([from.lon, from.lat], [to.lon, to.lat])
      svg.transition().duration(1500).ease(easeCubicInOut).tween('fly', () => t => {
        const tr = on ? Math.min(1, t * 1.6) : Math.max(0, t * 1.6 - .6)
        const tk = on ? Math.max(0, t * 1.4 - .4) : Math.min(1, t * 1.4)
        const [lon, lat] = il(tr); state = { lon, lat, k: Math.exp(ik(tk)) }; yawP *= .9; draw()
      })
    }
    api.current.zoom = zoom

    // Israel is tiny on the globe, and the pin sits on it: a click within ~3° of it flies in.
    svg.on('click', e => {
      if (focused || e.defaultPrevented) return
      const ll = proj.invert(pointer(e, svg.node()))
      if (ll && geoDistance(ll, IL) < 3 * Math.PI / 180) zoom(true)
    })
    svg.call(drag().filter(e => !focused && !e.button).on('drag', e => {
      const k = 75 / (R * state.k)
      state = { ...state, lon: state.lon - e.dx * k, lat: Math.max(-60, Math.min(70, state.lat + e.dy * k)) }; hide(); draw()
    }))

    let raf = 0
    const fine = !reduced && matchMedia('(hover: hover) and (pointer: fine)').matches
    const onMove = e => { if (focused) return; const r = el.getBoundingClientRect(); yawTarget = ((e.clientX - r.left) / r.width - .5) * -30 }
    const onLeave = () => { yawTarget = 0 }
    if (fine) {
      el.addEventListener('pointermove', onMove); el.addEventListener('pointerleave', onLeave)
      const loop = () => { if (!focused && Math.abs(yawTarget - yawP) > .05) { yawP += (yawTarget - yawP) * .08; draw() } raf = requestAnimationFrame(loop) }
      raf = requestAnimationFrame(loop)
    }
    const ro = new ResizeObserver(size); ro.observe(el)
    return () => { ro.disconnect(); cancelAnimationFrame(raf); el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave); svg.interrupt(); svg.remove() }
  }, [])

  return (
    <section id="map" aria-labelledby="map-title" className="section">
      <div className="container">
        <div className="statement map-intro">
          <h2 className="visually-hidden" id="map-title">מה זה ראדון, וכמה ממנו יש בבתים</h2>
          <Statement text={services['radon-home'].intro} />
          <p className="map-intro__lead">ממוצע הראדון בבתים בכל מדינה. גררו לסיבוב, עברו על מדינה כדי לראות את הממוצע, ולחצו על ישראל כדי להתקרב למחוזות.</p>
        </div>
        <div className="rx-panel glass">
          <div className="rx-map" ref={box}>
            <div className="rx-ctrl">
              {focus
                ? <button className="btn rx-ctrl__btn" type="button" onClick={() => api.current.zoom(false)}>חזרה לעולם</button>
                : <button className="btn btn--primary" type="button" onClick={() => api.current.zoom(true)}>התקרבו לישראל</button>}
            </div>
            <div className="rx-tip glass" ref={tipRef} hidden />
          </div>
          <div className="rx-legend">
            <div aria-hidden="true">
              <div className="rx-scale"><i style={{ background: 'var(--rx-s0)' }} /><i style={{ background: 'var(--rx-s1)' }} /><i style={{ background: 'var(--rx-s2)' }} /><i style={{ background: 'var(--rx-s3)' }} /><i style={{ background: 'var(--rx-danger)' }} /></div>
              <div className="rx-scale__labels fig"><span>0</span><span>50</span><span>100</span><span>150</span><span>200+</span></div>
            </div>
            <p>ממוצע ארצי או מחוזי, Bq/m³. מדינות באפור: אין נתון.</p>
          </div>
          <p className="rx-note">ממוצעי המדינות: WHO Handbook on Indoor Radon (2009), טבלה 4. הממוצע העולמי: 39 Bq/m³. ישראל: 64 Bq/m³ בחדר צמוד קרקע (סקר 2006, המשרד להגנת הסביבה).</p>
          <p className="rx-note">{SHOW_DISTRICTS && !radon.districtsReady ? <strong>ערכי המחוזות לדוגמה בלבד, לא נתוני מדידה. </strong> : !radon.districtsReady ? 'ממוצעים לפי מחוז, מנתוני הבדיקות שלנו, יתווספו בקרוב. ' : ''}נתוני גבולות: amCharts ו-Natural Earth.</p>
        </div>
      </div>
    </section>
  )
}
