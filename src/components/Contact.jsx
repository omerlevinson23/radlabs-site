import { useEffect, useState } from 'react'
import { contact, needs, waLink } from '../data.js'
import { config } from '../config.js'
import { buildPayload, sendOrder, toE164 } from '../lib/order.js'
import { track } from '../lib/track.js'

const VIA_WHATSAPP = !config.orderEndpoint
import { Head, Spinner, WaIcon } from './ui.jsx'

// Israeli numbers: 050-1234567, 0501234567, 09-7938339, +972-50-1234567, 972501234567
const normalizePhone = p => p.replace(/[\s()-]/g, '').replace(/^\+?972/, '0')
const PHONE = /^0\d{8,9}$/

function validate(v) {
  const errors = {}
  if (!v.name.trim()) errors.name = 'נא למלא שם'
  if (!v.phone.trim()) errors.phone = 'נא למלא מספר טלפון'
  else if (!PHONE.test(normalizePhone(v.phone))) errors.phone = 'מספר הטלפון לא תקין. לדוגמה: 050-1234567'
  if (!v.need) errors.need = 'נא לבחור במה נוכל לעזור'
  return errors
}

// States: idle → (errors) → sending → sent | failed.
// With an order endpoint set, the request goes to the order hook (src/lib/order.js) as type 'quote'. Without it, the form prepares a WhatsApp message.
export default function Contact({ defaultNeed }) {
  const [values, setValues] = useState({ name: '', phone: '', need: defaultNeed || '' })
  // Follow the audience the visitor picked in the service index, until they choose here themselves.
  const [touchedNeed, setTouchedNeed] = useState(false)
  useEffect(() => { if (!touchedNeed && defaultNeed) setValues(v => ({ ...v, need: defaultNeed })) }, [defaultNeed, touchedNeed])
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const message = `שלום, שמי ${values.name}. אשמח להצעת מחיר עבור: ${values.need}. טלפון לחזרה: ${values.phone}`

  const set = k => e => { setValues(v => ({ ...v, [k]: e.target.value })); if (errors[k]) setErrors(er => ({ ...er, [k]: undefined })) }

  async function submit(e) {
    e.preventDefault()
    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length) { document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus(); return }
    // No email service yet: the button says "send on WhatsApp" and opens it with the message written.
    if (VIA_WHATSAPP) { track('lead', { method: 'whatsapp', need: values.need }); window.open(waLink(message), '_blank', 'noopener'); setStatus('ready'); return }
    setStatus('sending')
    try {
      await sendOrder({ ...buildPayload('quote', {
        customer: { name: values.name.trim(), phone: values.phone.trim(), phone_e164: toE164(values.phone) },
        need: values.need, consent: { terms: false, marketing: false },
      }), website: e.target.website?.value || '' })
      track('lead', { method: 'form', need: values.need })
      setStatus('sent')
    } catch {
      setStatus('failed')
    }
  }

  const done = status === 'sent' || status === 'ready'

  return (
    <section id="contact" tabIndex={-1} aria-labelledby="contact-title" className="section" style={{ outline: 'none' }}>
      <div className="container contact">
        <div>
          <Head id="contact-title" title="להזמנת בדיקה" lead={`${contact.promise}. השאירו פרטים, או דברו איתנו ישירות.`} />
          <dl className="facts">
            <dt>נייד</dt><dd><a className="fig" href={`tel:+${contact.mobileIntl}`}>{contact.mobile}</a></dd>
            <dt>מעבדה</dt><dd><span className="fig">{contact.lab}</span></dd>
            <dt>מייל</dt><dd><a className="ltr" href={`mailto:${contact.email}`}>{contact.email}</a></dd>
            <dt>כתובת</dt><dd>{contact.address}, קדימה</dd>
          </dl>
        </div>

        {done ? (
          <div role="status" className="done">
            <p>{status === 'sent' ? 'קיבלנו, תודה' : 'פתחנו לכם את וואטסאפ'}</p>
            <p>{status === 'sent'
              ? `נחזור אליכם למספר ${values.phone} עם הצעת מחיר ללא עלות. רוצים תשובה מהירה יותר? כתבו לנו בוואטסאפ.`
              : `ההודעה כבר כתובה שם, נשאר רק ללחוץ שליחה. וואטסאפ לא נפתח? אפשר מכאן:`}</p>
            <a className="btn btn--primary" href={waLink(message)} target="_blank" rel="noopener"><WaIcon /> שליחה בוואטסאפ<span className="visually-hidden"> (נפתח בחלון חדש)</span></a>
            <button type="button" className="link" style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', color: 'inherit', font: 'inherit' }} onClick={() => setStatus('idle')}>חזרה לטופס</button>
          </div>
        ) : (
          <form noValidate onSubmit={submit} aria-busy={status === 'sending'} className="form">
            <div className="row2">
              <div className="form__f">
                <label htmlFor="f-name">שם <span className="req">(חובה)</span></label>
                <input id="f-name" name="name" autoComplete="name" aria-required="true" value={values.name} onChange={set('name')} className="field"
                  aria-invalid={!!errors.name} aria-describedby={errors.name ? 'e-name' : undefined} />
                {errors.name && <p id="e-name" className="err">{errors.name}</p>}
              </div>
              <div className="form__f">
                <label htmlFor="f-phone">טלפון <span className="req">(חובה)</span></label>
                <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" aria-required="true" value={values.phone} onChange={set('phone')} className="field ltr" style={{ textAlign: 'right' }}
                  aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'e-phone' : undefined} />
                {errors.phone && <p id="e-phone" className="err">{errors.phone}</p>}
              </div>
            </div>
            {/* honeypot: hidden from people, bots fill it, the server drops those */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" defaultValue="" />
            <div className="form__f">
              <label htmlFor="f-need">במה נוכל לעזור?</label>
              <select id="f-need" name="need" value={values.need} onChange={e => { setTouchedNeed(true); set('need')(e) }} className="field"
                aria-invalid={!!errors.need} aria-describedby={errors.need ? 'e-need' : undefined}>
                <option value="" disabled>בחרו…</option>
                {needs.map(n => <option key={n}>{n}</option>)}
              </select>
              {errors.need && <p id="e-need" className="err">{errors.need}</p>}
            </div>
            {status === 'failed' && (
              <div role="alert" className="alert">
                <p><b>השליחה לא הצליחה.</b> כנראה בעיית חיבור. נסו שוב, או שלחו לנו את הפרטים בוואטסאפ.</p>
                <a className="link" href={waLink(message)} target="_blank" rel="noopener">שליחה בוואטסאפ</a>
              </div>
            )}
            <div className="hero__actions" style={{ alignItems: 'center' }}>
              <button type="submit" className="btn btn--primary" data-sc-magnet="0.2" disabled={status === 'sending'} aria-busy={status === 'sending'}>
                {status === 'sending' ? <><Spinner /> שולחים</> : status === 'failed' ? 'ניסיון נוסף' : VIA_WHATSAPP ? <><WaIcon /> שליחה בוואטסאפ</> : 'שליחת הפרטים'}
              </button>
              <p className="note">{VIA_WHATSAPP ? 'נפתח וואטסאפ עם ההודעה מוכנה.' : 'הפרטים משמשים רק כדי לחזור אליכם.'}</p>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
