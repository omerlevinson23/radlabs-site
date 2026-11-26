import { useEffect } from 'react'
import { contact, needs, orderables, paths, services } from '../data.js'
import { href, jumpTo, navigate, sectionHref } from '../router.js'
import { WhatsAppButton } from './ui.jsx'
import Contact from './Contact.jsx'

export default function ServicePage({ slug }) {
  const s = services[slug]
  useEffect(() => { document.title = `${s.name} | RAD-LABs`; document.getElementById('svc-title')?.focus() }, [s])
  const path = paths.find(p => p.items.includes(slug))
  const related = path?.items.filter(x => x !== slug) ?? []
  const orderable = orderables.some(o => o.slug === slug)
  const orderHref = href(`order?test=${slug}`)
  const needIdx = path ? paths.indexOf(path) : -1
  const defaultNeed = slug === 'luft' ? 'גלאי LUFT' : needs[needIdx] ?? needs[needs.length - 1]

  return (
    <>
      <section aria-labelledby="svc-title" className="page-head">
        <div className="container">
          <nav aria-label="מיקום בעמוד" className="crumbs">
            <a className="link" href={href('')} onClick={e => navigate(e, '')}>עמוד הבית</a>
            <span aria-hidden="true">/</span>
            <a className="link" href={sectionHref('services')}>שירותים</a>
            {path && <><span aria-hidden="true">/</span><span>{path.who}</span></>}
          </nav>
          <h1 id="svc-title" tabIndex={-1} style={{ outline: 'none', maxWidth: '18ch' }}>{s.name}</h1>
          <p className="lead">{s.intro}</p>
          <div className="hero__actions" style={{ marginTop: 'var(--space-lg)' }}>
            {orderable
              ? <a className="btn btn--primary" href={orderHref} onClick={e => navigate(e, `order?test=${slug}`)}>להזמנה אונליין</a>
              : <a className="btn btn--primary" href="#contact" onClick={e => jumpTo(e, 'contact')}>להזמנת בדיקה</a>}
            <WhatsAppButton text={`שלום, אשמח לפרטים על ${s.name}`} label="שאלה בוואטסאפ" />
          </div>
        </div>
      </section>
      <section className="section" aria-labelledby="incl-title">
        <div className="container split">
          <div>
            <h2 id="incl-title" style={{ marginBottom: 'var(--space-lg)' }}>מה כולל השירות</h2>
            <ol className="stages">
              {s.points.map(p => <li key={p}><h3>{p}</h3></li>)}
            </ol>
            {/* PLACEHOLDER: add the full text from the old page, FAQs and photos here. */}
          </div>
          <aside aria-label="מחיר ושירותים קשורים" className="plate glass">
            {s.price
              ? <><p className="plate__label">מחיר</p><p className="plate__price">{s.price}</p></>
              : <p className="plate__price plate__price--s">{contact.promise}</p>}
            {orderable
              ? <a className="btn btn--primary" href={orderHref} onClick={e => navigate(e, `order?test=${slug}`)}>להזמנה אונליין</a>
              : <a className="btn btn--primary" href="#contact" onClick={e => jumpTo(e, 'contact')}>להזמנת בדיקה</a>}
            {related.length > 0 && <>
              <p className="plate__label" style={{ marginTop: 'var(--space-md)' }}>שירותים קשורים</p>
              <ul className="ticks">
                {related.map(r => <li key={r}><a className="link" href={href(r)} onClick={e => navigate(e, r)}>{services[r].short}</a></li>)}
              </ul>
            </>}
          </aside>
        </div>
      </section>
      <Contact defaultNeed={defaultNeed} />
    </>
  )
}
