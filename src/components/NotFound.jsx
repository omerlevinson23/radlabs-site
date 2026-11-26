import { useEffect } from 'react'
import { href, navigate, sectionHref } from '../router.js'

export default function NotFound() {
  useEffect(() => { document.title = 'העמוד לא נמצא | RAD-LABs' }, [])
  return (
    <section className="page-head" aria-labelledby="nf-title">
      <div className="container" style={{ display: 'grid', gap: 'var(--space-lg)', justifyItems: 'start' }}>
        <h1 id="nf-title">העמוד הזה לא נמצא</h1>
        <p className="lead">ייתכן שהקישור ישן. כל השירותים שלנו מופיעים בעמוד הבית.</p>
        <div className="hero__actions">
          <a className="btn btn--primary" href={href('')} onClick={e => navigate(e, '')}>לעמוד הבית</a>
          <a className="btn" href={sectionHref('services')}>לרשימת השירותים</a>
        </div>
      </div>
    </section>
  )
}
