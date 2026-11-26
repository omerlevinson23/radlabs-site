import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { contact, labs, needs, paths, proof, services, steps, testimonials } from '../data.js'
import { href, navigate, sectionHref } from '../router.js'
import { Head, WhatsAppButton } from './ui.jsx'
import Contact from './Contact.jsx'
import RadonMap from './RadonMap.jsx'
import RadonGauge from './RadonGauge.jsx'

// Hero, posture Index: a small head, one sentence, the action, then the service index as the lead.
// Visitors type "רדון" as often as "ראדון"; search both ways.
const norm = t => t.replace(/ראדון/g, 'רדון').replace(/״|"/g, '')

// Hero, posture Index: a small head, one sentence, the action, then the services grouped by who they are for.
function Index({ who, setWho }) {
  const [q, setQ] = useState('')
  const groups = useMemo(() => {
    const term = norm(q.trim())
    const seen = new Set()
    return paths.filter(p => who === 'all' || p.id === who).map(p => ({
      ...p,
      slugs: p.items.filter(slug => {
        if (seen.has(slug)) return false
        const s = services[slug]
        const hit = !term || [s.name, s.short, s.intro].some(x => norm(x).includes(term))
        if (hit) seen.add(slug)
        return hit
      }),
    })).filter(g => g.slugs.length)
  }, [who, q])
  const count = groups.reduce((n, g) => n + g.slugs.length, 0)

  return (
    <section id="services" aria-labelledby="services-title" className="section">
      <div className="container">
        <Head id="services-title" title="כל הבדיקות, לפי מי שצריך אותן" lead="בחרו למי הבדיקה, או חפשו לפי שם. כל שורה פותחת את פרטי הבדיקה." />
        <div className="index">
          <div className="index__tools glass">
            <div role="group" aria-label="למי הבדיקה?" className="toggle">
              <button type="button" aria-pressed={who === 'all'} onClick={() => setWho('all')}>הכול</button>
              {paths.map(p => (
                <button key={p.id} type="button" aria-pressed={who === p.id} onClick={() => setWho(p.id)}>{p.who.replace(/^ל/, '')}</button>
              ))}
            </div>
            <div className="search">
              <label htmlFor="svc-q" className="search__label">חיפוש שירות</label>
              <input id="svc-q" type="search" className="field" value={q} onChange={e => setQ(e.target.value)} placeholder="חיפוש, למשל: טופס 4" />
            </div>
          </div>
          <p className="visually-hidden" aria-live="polite">{count} שירותים מוצגים</p>
          {count ? (
            <div className="groups">
              {groups.map(g => (
                <section key={g.id} className="group" aria-labelledby={`g-${g.id}`}>
                  <h3 id={`g-${g.id}`} className="group__title">{g.who}</h3>
                  <ul className="rows">
                    {g.slugs.map(slug => (
                      <li key={slug} className="row">
                        <a href={href(slug)} onClick={e => navigate(e, slug)}>
                          <span className="row__name">{services[slug].name}</span>
                          {services[slug].price && <span className="row__who">{services[slug].price}</span>}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <div className="empty">
              <p>לא מצאנו ״{q}״</p>
              <p>אנחנו עושים גם בדיקות שלא מופיעות כאן. ספרו לנו מה צריך.</p>
              <div className="hero__actions">
                <button type="button" className="btn" onClick={() => { setQ(''); setWho('all') }}>כל השירותים</button>
                <WhatsAppButton text={`שלום, אני מחפש בדיקה: ${q}`} label="שאלה בוואטסאפ" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}


// The hero alone on the first screen: what is sold and to whom, the two actions, the permit number cast beside it.
function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="hero" data-enter data-sc-act="flow">
      <div className="container hero__top">
        <div className="hero__copy">
          <h1 id="hero-title">בדיקות ראדון וקרינה, ממעבדה מורשית</h1>
          <p className="lead">עשרות שנות ניסיון במדידת חומרים רדיואקטיביים, לבעלי דירות, קבלנים, יצרנים ותעשייה. {contact.promise}, {contact.turnaround} ו{contact.payment}.</p>
          <div className="hero__actions">
            <a className="btn btn--primary" href={href('order')} onClick={e => navigate(e, 'order')}>להצעת מחיר ללא עלות</a>
            <WhatsAppButton text="שלום, אשמח לשאול על בדיקת ראדון" label="שאלה בוואטסאפ" />
          </div>
        </div>
        <div className="plate cast glass" data-sc-parallax="-0.12">
          <span className="cast__label">היתר מס׳</span>
          <span className="cast__fig fig">{contact.permit}</span>
          <span className="cast__unit">מהמשרד להגנת הסביבה</span>
        </div>
      </div>
    </section>
  )
}

// One service opened as a case: the home radon test, its four stages and its price.
function Case() {
  const s = services['radon-home']
  return (
    <section id="process" aria-labelledby="process-title" className="section" data-sc-act="flow">
      <div className="container">
        <Head id="process-title" title="בדיקת ראדון לדירה, מקרוב" lead="ארבעה שלבים, מהפנייה הראשונה ועד התעודה." />
        <div className="split">
          <ol className="stages">
            {steps.map(st => (
              <li key={st.title}>
                <h3>{st.title}</h3>
                <p>{st.text}{st.time ? `, ${st.time}` : ''}</p>
              </li>
            ))}
          </ol>
          <div className="plate glass" data-sc-reveal="up" data-sc-reveal-at="0.12 0.42">
            {s.price
              ? <><p className="plate__label">מחיר לדירה</p><p className="plate__price">{s.price}</p></>
              : <p className="plate__price plate__price--s">{contact.promise}</p>}
            <p>התוצאה: ריכוז ראדון ממוצע ביחידות Bq/m³, על תעודה רשמית של המעבדה.</p>
            <ul className="ticks">{s.points.map(p => <li key={p}>{p}</li>)}</ul>
            <a className="link" href={href('radon-home')} onClick={e => navigate(e, 'radon-home')}>כל הפרטים על הבדיקה</a>
          </div>
        </div>
      </div>
    </section>
  )
}

// Why: the one real count cast as a plate, the permits and founders beside it.
function Why() {
  return (
    <section id="about" aria-labelledby="about-title" className="section">
      <div className="container split">
        <Head id="about-title" title="למה RAD-LABs" lead="עשרות שנות ניסיון במדידת חומרים רדיואקטיביים, לא רק ראדון." />
        <ul className="proof">
          {proof.map(p => (
            <li key={p.title}><h3>{p.title}</h3><p>{p.text}</p></li>
          ))}
        </ul>
      </div>
      <Where />
    </section>
  )
}

function Voices() {
  if (!testimonials.length) return null
  return (
    <section aria-labelledby="voices-title" className="section">
      <div className="container">
        <Head id="voices-title" title="מה אומרים לקוחות" />
        <div className="split">
          {testimonials.map(t => (
            <figure key={t.who} style={{ margin: 0 }}>
              <blockquote style={{ margin: 0 }} className="lead">״{t.quote}״</blockquote>
              <figcaption className="row__who">{t.who}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

function Luft() {
  const s = services.luft
  return (
    <section id="luft" aria-labelledby="luft-title" className="section band">
      <div className="container split">
        <div className="head" style={{ marginBottom: 0 }}>
          <h2 id="luft-title">{s.name}</h2>
          <p className="lead">{s.intro}</p>
          <ul className="ticks">{s.points.map(p => <li key={p}>{p}</li>)}</ul>
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-lg)', alignContent: 'end' }}>
          {s.price && <p className="band__price">{s.price}</p>}
          <div className="hero__actions">
            <WhatsAppButton text="שלום, אשמח לרכוש גלאי LUFT" label="לרכישה בוואטסאפ" />
            <a className="btn" href={href('luft')} onClick={e => navigate(e, 'luft')}>פרטים נוספים</a>
          </div>
        </div>
      </div>
    </section>
  )
}

// The three labs, as a table inside the about section.
function Where() {
  return (
    <div id="labs" className="container about__labs">
      <h3 id="labs-title">שלוש מעבדות בארץ</h3>
      <div className="table-scroll">
        <table className="labs" aria-labelledby="labs-title">
          <thead><tr><th scope="col">עיר</th><th scope="col">מה יש שם</th><th scope="col">כתובת</th><th scope="col">טלפון</th></tr></thead>
          <tbody>
            {labs.map(l => (
              <tr key={l.city}>
                <th scope="row">{l.city}</th>
                <td>{l.what}</td>
                <td>{l.address}</td>
                <td>{l.phone ? <a className="fig" href={`tel:+972${l.phone.replace(/^0|-/g, '')}`}>{l.phone}</a> : 'דרך המשרד הראשי'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const NEED_FOR = Object.fromEntries(paths.map((p, i) => [p.id, needs[i]]))

export default function Home({ section }) {
  const [who, setWho] = useState('all')
  useEffect(() => {
    const id = section || location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [section])
  return (<><Hero /><Index who={who} setWho={setWho} /><RadonMap /><Case /><Why /><Voices /><Luft /><RadonGauge /><Contact defaultNeed={NEED_FOR[who]} /></>)
}
