import { Fragment, useEffect } from 'react'
import { LEGAL_DRAFT } from '../legal/company.js'
import privacy from '../legal/privacy.js'
import terms from '../legal/terms.js'
import cancellation from '../legal/cancellation.js'
import cookies from '../legal/cookies.js'
import accessibility from '../legal/accessibility.js'

// Legal pages: /privacy, /terms, /cancellation, /cookies, /accessibility. Texts live in src/legal/.
export const legalPages = { privacy, terms, cancellation, cookies, accessibility }

// "[[...]]" in a text is a PLACEHOLDER, shown as a dashed slot until filled.
function Text({ children }) {
  return children.split(/\[\[(.+?)\]\]/).map((part, i) => i % 2 ? <span key={i} className="fill">{part}</span> : <Fragment key={i}>{part}</Fragment>)
}

export default function LegalPage({ slug }) {
  const doc = legalPages[slug]
  useEffect(() => { document.title = `${doc.title} | RAD-LABs` }, [doc])
  return (
    <section className="page-head legal" aria-labelledby="legal-title">
      <div className="container" style={{ display: 'grid', gap: 'var(--space-md)', maxWidth: '46rem', paddingBottom: 'var(--section-gap-s)' }}>
        <h1 id="legal-title" style={{ fontSize: 'clamp(2.25rem, 4vw + 1rem, 3.5rem)' }}>{doc.title}</h1>
        <p className="note">עודכן לאחרונה: {doc.updated}</p>
        {LEGAL_DRAFT && <p role="note" className="alert"><b>טיוטה.</b> הנוסח ממתין לבדיקת עורך דין ואינו סופי.</p>}
        {doc.sections.map((s, i) => (
          <Fragment key={i}>
            {s.h && <h2 style={{ fontSize: '1.5rem', marginTop: 'var(--space-md)' }}>{s.h}</h2>}
            {s.p?.map((t, j) => <p key={j}><Text>{t}</Text></p>)}
            {s.list && <ul className="ticks">{s.list.map((t, j) => <li key={j}><Text>{t}</Text></li>)}</ul>}
            {s.after?.map((t, j) => <p key={j}><Text>{t}</Text></p>)}
          </Fragment>
        ))}
      </div>
    </section>
  )
}
