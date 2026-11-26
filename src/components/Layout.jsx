import { useEffect, useState } from 'react'
import { contact, waLink } from '../data.js'
import { href, jumpTo, navigate, sectionHref } from '../router.js'
import { company } from '../legal/company.js'
import { WaIcon } from './ui.jsx'

const nav = [
  ['services', 'שירותים'], ['process', 'איך זה עובד'], ['luft', 'גלאי LUFT'], ['about', 'אודות'], ['contact', 'צור קשר'],
]

export function Header() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const onKey = e => { if (e.key === 'Escape') { setOpen(false); document.getElementById('menu-btn')?.focus() } }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <div className="ambient" aria-hidden="true"><span /><span /><span /></div>
      <a href="#main" onClick={e => jumpTo(e, 'main')} className="skip">דלגו לתוכן</a>
      <a href="#contact" onClick={e => jumpTo(e, 'contact')} className="skip">דלגו להזמנת בדיקה</a>
      <header className="nav glass">
        <div className="container nav__bar">
          <a href={href('')} onClick={e => navigate(e, '')} className="wordmark ltr" aria-label="RAD-LABs, עמוד הבית">RAD-LABs</a>
          <nav aria-label="ניווט ראשי">
            <ul className="nav__links">
              {nav.map(([id, label]) => <li key={id}><a href={sectionHref(id)}>{label}</a></li>)}
            </ul>
          </nav>
          <div className="nav__end">
            <a href={`tel:+${contact.mobileIntl}`} className="nav__phone fig">{contact.mobile}</a>
            <a href={href('order')} onClick={e => navigate(e, 'order')} className="btn nav__cta">להזמנת בדיקה</a>
            <button id="menu-btn" type="button" className="nav__menu" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(o => !o)}>
              <span className="visually-hidden">{open ? 'סגירת תפריט' : 'פתיחת תפריט'}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={open ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'} /></svg>
            </button>
          </div>
        </div>
        <nav id="mobile-nav" aria-label="ניווט ראשי" hidden={!open} className="container nav__drawer">
          <ul>
            {nav.map(([id, label]) => <li key={id}><a href={sectionHref(id)} onClick={() => setOpen(false)}>{label}</a></li>)}
          </ul>
        </nav>
      </header>
    </>
  )
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="container">
        <p className="foot__line">מעבדה מורשית לבדיקות ראדון וקרינה.</p>
        <ul className="foot__links">
          <li><a className="link fig" href={`tel:+${contact.mobileIntl}`}>{contact.mobile}</a></li>
          <li><a className="link ltr" href={`mailto:${contact.email}`}>{contact.email}</a></li>
          <li><a className="link" href={waLink()} target="_blank" rel="noopener">וואטסאפ<span className="visually-hidden"> (נפתח בחלון חדש)</span></a></li>
          {[['accessibility', 'הצהרת נגישות'], ['privacy', 'מדיניות פרטיות'], ['terms', 'תנאי שימוש'], ['cancellation', 'מדיניות ביטול'], ['cookies', 'עוגיות']].map(([slug, label]) =>
            <li key={slug}><a className="link" href={href(slug)} onClick={e => navigate(e, slug)}>{label}</a></li>)}
          <li><button type="button" className="link linkbtn" onClick={() => dispatchEvent(new Event('rl-consent-open'))}>העדפות עוגיות</button></li>
        </ul>
        <p className="foot__legal">© {new Date().getFullYear()} {company.name}{company.id.startsWith('[[') ? '' : <>, ח.פ. <span className="fig">{company.id}</span></>}</p>
      </div>
    </footer>
  )
}

// Call / WhatsApp bar fixed to the bottom of the screen on phones.
export function StickyBar() {
  return (
    <div className="phonebar glass">
      <a className="btn btn--icon" href={`tel:+${contact.mobileIntl}`} aria-label={`התקשרו ${contact.mobile}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z" /></svg>
      </a>
      <a className="btn" href={waLink()} target="_blank" rel="noopener"><WaIcon /> וואטסאפ<span className="visually-hidden"> (נפתח בחלון חדש)</span></a>
      <a className="btn btn--primary" href={href('order')} onClick={e => navigate(e, 'order')}>הזמנה</a>
    </div>
  )
}
