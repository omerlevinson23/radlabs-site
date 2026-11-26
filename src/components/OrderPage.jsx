import { useEffect, useState } from 'react'
import { contact, orderables, waLink } from '../data.js'
import { config } from '../config.js'
import { buildPayload, sendOrder, toE164 } from '../lib/order.js'
import { track } from '../lib/track.js'
import { href, navigate } from '../router.js'
import { Spinner, WaIcon } from './ui.jsx'

// Ordering is a quote request: pick a test, give details and a preferred date. RAD-LABs replies with a personal
// quote and a secure payment link (Omer does not publish prices). No price and no payment happen on this page.
// Without an order endpoint, the request goes out by WhatsApp.

const normalizePhone = p => p.replace(/[\s()-]/g, '').replace(/^\+?972/, '0')
const PHONE = /^0\d{8,9}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MARKETING_TEXT = 'אני מסכים/ה לקבל עדכונים ופרסומות מ-RAD-LABs בוואטסאפ, SMS ובמייל. אפשר להסיר בכל עת.'
const TERMS_TEXT = 'קראתי ואני מסכים/ה לתנאי השירות, למדיניות הביטול ולמדיניות הפרטיות.'
const WINDOWS = [['morning', 'בוקר'], ['noon', 'צהריים'], ['afternoon', 'אחר הצהריים']] // no hours until the lab confirms them

const isoDay = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
function minDate() { const d = new Date(); d.setDate(d.getDate() + 1); return isoDay(d) }

function validate(v, product) {
  const e = {}
  if (!v.slug) e.slug = 'נא לבחור בדיקה'
  if (!v.name.trim()) e.name = 'נא למלא שם'
  if (!v.phone.trim()) e.phone = 'נא למלא מספר טלפון'
  else if (!PHONE.test(normalizePhone(v.phone))) e.phone = 'מספר הטלפון לא תקין. לדוגמה: 050-1234567'
  if (v.email && !EMAIL.test(v.email.trim())) e.email = 'כתובת המייל לא תקינה'
  if (!v.city.trim()) e.city = 'נא למלא יישוב'
  if (product?.booking) {
    if (!v.address.trim()) e.address = 'נא למלא כתובת לביקור הטכנאי'
    if (v.date && v.date < minDate()) e.date = 'אפשר לבחור מחר והלאה'
  }
  if (!v.terms) e.terms = 'נא לאשר את התנאים כדי להמשיך'
  return e
}

export default function OrderPage() {
  const first = new URLSearchParams(location.search).get('test') || (location.hash.split('?')[1] ? new URLSearchParams(location.hash.split('?')[1]).get('test') : '')
  const [v, setV] = useState({ slug: orderables.some(o => o.slug === first) ? first : '', name: '', phone: '', email: '', city: '', address: '', date: '', window: 'morning', notes: '', terms: false, marketing: false })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [orderId, setOrderId] = useState('')
  const product = orderables.find(o => o.slug === v.slug)
  useEffect(() => { document.title = 'הזמנת בדיקה | RAD-LABs' }, [])

  const set = k => e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setV(x => ({ ...x, [k]: val })); if (errors[k]) setErrors(er => ({ ...er, [k]: undefined }))
  }
  const err = k => errors[k] && <p id={`oe-${k}`} className="err">{errors[k]}</p>
  const aria = k => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `oe-${k}` : undefined })

  const summary = id => [
    `שלום, אשמח להצעת מחיר ל: ${product?.name}.`, `מספר בקשה: ${id}.`, `שם: ${v.name}, טלפון: ${v.phone}${v.email ? `, מייל: ${v.email}` : ''}.`,
    `יישוב: ${v.city}${v.address ? `, ${v.address}` : ''}.`,
    product?.booking && v.date ? `מועד מועדף: ${v.date.split('-').reverse().join('.')}, ${WINDOWS.find(w => w[0] === v.window)[1]}.` : '',
    v.notes ? `הערות: ${v.notes}` : '',
  ].filter(Boolean).join('\n')

  async function submit(e) {
    e.preventDefault()
    const errs = validate(v, product)
    setErrors(errs)
    if (Object.keys(errs).length) { document.getElementById(`o-${Object.keys(errs)[0]}`)?.focus(); return }
    const payload = buildPayload('order', {
      customer: { name: v.name.trim(), phone: v.phone.trim(), phone_e164: toE164(v.phone), email: v.email.trim() || undefined, city: v.city.trim(), address: v.address.trim() || undefined },
      product: { slug: product.slug }, // the server fills in the name from src/catalog.js
      booking: product.booking && v.date ? { preferred_date: v.date, window: v.window } : undefined,
      notes: v.notes.trim() || undefined,
      consent: {
        terms: v.terms, terms_text: TERMS_TEXT,
        marketing: v.marketing, ...(v.marketing ? { marketing_text: MARKETING_TEXT } : {}),
        at: new Date().toISOString(),
      },
    })
    setOrderId(payload.id)
    if (!config.orderEndpoint) {
      track('order', { method: 'whatsapp', item: product.slug })
      window.open(waLink(summary(payload.id)), '_blank', 'noopener'); setStatus('ready'); return
    }
    setStatus('sending')
    try {
      await sendOrder({ ...payload, website: e.target.website?.value || '' })
      track('order', { method: 'form', item: product.slug })
      setStatus('sent')
    } catch {
      setStatus('failed')
    }
  }

  const done = status === 'sent' || status === 'ready'
  return (
    <>
      <section className="page-head container" aria-labelledby="order-title">
        <p className="crumbs"><a href={href('')} onClick={e => navigate(e, '')}>דף הבית</a></p>
        <h1 id="order-title">הזמנת בדיקה והצעת מחיר</h1>
        <p className="lead">בוחרים בדיקה וממלאים פרטים ומועד מועדף. נחזור אליכם עם הצעת מחיר ללא עלות ונאשר מועד. התעודה מוכנה תוך 4 ימים.</p>
      </section>
      <section className="section" aria-label="טופס הזמנה">
        <div className="container order">
          {done ? (
            <div role="status" className="done">
              <p>{status === 'sent' ? 'הבקשה התקבלה' : 'פתחנו לכם את וואטסאפ'}</p>
              <p>מספר הבקשה: <span className="fig">{orderId}</span>.</p>
              <p>{status === 'sent'
                ? `נחזור אליכם למספר ${v.phone} עם הצעת מחיר, מועד וקישור מאובטח לתשלום.`
                : 'פרטי ההזמנה כבר כתובים שם, נשאר רק ללחוץ שליחה. וואטסאפ לא נפתח? אפשר מכאן:'}</p>
              <a className="btn btn--primary" href={waLink(summary(orderId))} target="_blank" rel="noopener"><WaIcon /> וואטסאפ<span className="visually-hidden"> (נפתח בחלון חדש)</span></a>
            </div>
          ) : (
            <form noValidate onSubmit={submit} aria-busy={status === 'sending'} className="form order__form">
              <fieldset className="order__pick" aria-describedby={errors.slug ? 'oe-slug' : undefined}>
                <legend>איזו בדיקה?</legend>
                {orderables.map((o, i) => (
                  <label key={o.slug} className={`pick glass${v.slug === o.slug ? ' is-on' : ''}`}>
                    <input type="radio" name="slug" value={o.slug} id={i === 0 ? 'o-slug' : undefined} checked={v.slug === o.slug} onChange={set('slug')} />
                    <span className="pick__name">{o.name}</span>
                    <span className="pick__note">{o.note}</span>
                  </label>
                ))}
                {err('slug')}
              </fieldset>

              <div className="row2">
                <div className="form__f"><label htmlFor="o-name">שם <span className="req">(חובה)</span></label>
                  <input id="o-name" autoComplete="name" className="field" value={v.name} onChange={set('name')} aria-required="true" {...aria('name')} />{err('name')}</div>
                <div className="form__f"><label htmlFor="o-phone">טלפון <span className="req">(חובה)</span></label>
                  <input id="o-phone" type="tel" inputMode="tel" autoComplete="tel" className="field ltr" style={{ textAlign: 'right' }} value={v.phone} onChange={set('phone')} aria-required="true" {...aria('phone')} />{err('phone')}</div>
              </div>
              <div className="row2">
                <div className="form__f"><label htmlFor="o-email">מייל (לא חובה, לקבלת התעודה)</label>
                  <input id="o-email" type="email" autoComplete="email" className="field ltr" style={{ textAlign: 'right' }} value={v.email} onChange={set('email')} {...aria('email')} />{err('email')}</div>
                <div className="form__f"><label htmlFor="o-city">יישוב <span className="req">(חובה)</span></label>
                  <input id="o-city" autoComplete="address-level2" className="field" value={v.city} onChange={set('city')} aria-required="true" {...aria('city')} />{err('city')}</div>
              </div>
              {product?.booking && (<>
                <div className="form__f"><label htmlFor="o-address">כתובת לביקור הטכנאי <span className="req">(חובה)</span></label>
                  <input id="o-address" autoComplete="street-address" className="field" value={v.address} onChange={set('address')} aria-required="true" {...aria('address')} />{err('address')}</div>
                <div className="row2">
                  <div className="form__f"><label htmlFor="o-date">מועד מועדף (נאשר בטלפון)</label>
                    <input id="o-date" type="date" className="field" min={minDate()} value={v.date} onChange={set('date')} {...aria('date')} />{err('date')}</div>
                  <div className="form__f"><label htmlFor="o-window">שעות</label>
                    <select id="o-window" className="field" value={v.window} onChange={set('window')}>{WINDOWS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></div>
                </div>
              </>)}
              <div className="form__f"><label htmlFor="o-notes">הערות (לא חובה)</label>
                <textarea id="o-notes" className="field field--area" rows="3" maxLength={1000} value={v.notes} onChange={set('notes')} /></div>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" defaultValue="" />

              <div className="checks">
                <label className="check"><input id="o-terms" type="checkbox" checked={v.terms} onChange={set('terms')} {...aria('terms')} />
                  <span>קראתי ואני מסכים/ה ל<a href={config.termsUrl || href('terms')}>תנאי השירות</a>, ל<a href={href('cancellation')}>מדיניות הביטול</a> ול<a href={config.privacyUrl || href('privacy')}>מדיניות הפרטיות</a>. <span className="req">(חובה)</span></span></label>
                {err('terms')}
                <label className="check"><input type="checkbox" checked={v.marketing} onChange={set('marketing')} />
                  <span>{MARKETING_TEXT}</span></label>
              </div>

              {status === 'failed' && (
                <div role="alert" className="alert">
                  <p><b>השליחה לא הצליחה.</b> נסו שוב, או שלחו לנו את ההזמנה בוואטסאפ.</p>
                  <a className="link" href={waLink(summary(orderId))} target="_blank" rel="noopener">שליחה בוואטסאפ</a>
                </div>
              )}
              <div className="hero__actions" style={{ alignItems: 'center' }}>
                <button type="submit" className="btn btn--primary" disabled={status === 'sending'} aria-busy={status === 'sending'}>
                  {status === 'sending' ? <><Spinner /> שולחים</> : config.orderEndpoint ? 'בקשת הצעת מחיר' : <><WaIcon /> בקשת הצעת מחיר בוואטסאפ</>}
                </button>
                <p className="note">אין תשלום עכשיו. משלמים רק אחרי שמאשרים את ההצעה, בקישור מאובטח. <a href={href('cancellation')}>מדיניות ביטול</a></p>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
