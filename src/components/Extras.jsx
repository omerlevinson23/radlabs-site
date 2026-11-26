import { useEffect, useState } from 'react'
import { config } from '../config.js'
import { getConsent, setConsent, track, trackingConfigured, loadTrackers } from '../lib/track.js'
import { href, navigate } from '../router.js'

// Opt-in cookie banner: nothing that tracks loads until "accept". Decline is just as easy, and the choice is kept.
// Shown only when a tracker is configured (GA or Pixel); otherwise the site sets no tracking cookies at all.
export function ConsentBanner() {
  const [open, setOpen] = useState(() => trackingConfigured() && !getConsent())
  useEffect(() => { loadTrackers() }, [])
  useEffect(() => {
    const reopen = () => setOpen(trackingConfigured())
    addEventListener('rl-consent-open', reopen)
    return () => removeEventListener('rl-consent-open', reopen)
  }, [])
  if (!open) return null
  const choose = v => { setConsent(v); setOpen(false) }
  return (
    <div className="consent glass" role="region" aria-label="הסכמה לעוגיות">
      <p>נשמח להשתמש בעוגיות של Google Analytics ו-Meta כדי להבין איך משתמשים באתר ולשפר את הפרסום. בלי הסכמה הן לא נטענות. <a href={href('cookies')}>פרטים</a></p>
      <div className="consent__actions">
        <button type="button" className="btn btn--primary" onClick={() => choose('all')}>מסכים/ה</button>
        <button type="button" className="btn" onClick={() => choose('none')}>לא, תודה</button>
      </div>
    </div>
  )
}

// Back from the payment page. This is NOT proof of payment: the order is marked paid only by the payment
// provider's server-side callback (see docs/INTEGRATIONS.md). Here we only thank the customer and count the visit.
export function ThanksPage() {
  const q = new URLSearchParams(location.search || location.hash.split('?')[1] || '')
  let id = q.get('order') || ''
  try { id = id || JSON.parse(sessionStorage.getItem('rl-last-order') || '{}').id || '' } catch { /* fine */ }
  useEffect(() => {
    document.title = 'תודה | RAD-LABs'
    try {
      if (id && sessionStorage.getItem('rl-counted') !== id) { track('purchase', { transaction_id: id }); sessionStorage.setItem('rl-counted', id) }
    } catch { /* fine */ }
  }, [id])
  return (
    <section className="page-head container" aria-labelledby="thanks-title">
      <h1 id="thanks-title">תודה, קיבלנו את ההזמנה</h1>
      {id && <p className="lead">מספר ההזמנה: <span className="fig">{id}</span></p>}
      <p className="lead">אישור התשלום יישלח אליכם מחברת הסליקה. ניצור קשר כדי לתאם את המועד. אם משהו לא עבר בתשלום, נחזור אליכם.</p>
      <p><a className="btn" href={href('')} onClick={e => navigate(e, '')}>חזרה לדף הבית</a></p>
    </section>
  )
}

// A short, stable link for review requests (e.g. rad-labs.co.il/review) that forwards to the Google review form.
// The automation sends it after the results; changing the Google link later needs no new messages.
export function ReviewPage() {
  useEffect(() => { document.title = 'ביקורת | RAD-LABs'; if (config.googleReviewUrl) location.replace(config.googleReviewUrl) }, [])
  return (
    <section className="page-head container" aria-labelledby="review-title">
      <h1 id="review-title">תודה שבחרתם ב-RAD-LABs</h1>
      <p className="lead">{config.googleReviewUrl
        ? <>מעבירים אתכם לדף הביקורות בגוגל. לא קרה כלום? <a href={config.googleReviewUrl}>לחצו כאן</a>.</>
        : 'דף הביקורות עוד לא מחובר. נשמח לשמוע מכם בוואטסאפ.'}</p>
    </section>
  )
}

// Counts phone and WhatsApp clicks anywhere on the site (only after consent; track() is a no-op before).
export function useContactClicks() {
  useEffect(() => {
    const on = e => {
      const a = e.target.closest?.('a[href]'); if (!a) return
      if (a.href.startsWith('tel:')) track('contact', { method: 'phone' })
      else if (a.href.includes('wa.me/')) track('contact', { method: 'whatsapp' })
    }
    document.addEventListener('click', on)
    return () => document.removeEventListener('click', on)
  }, [])
}
