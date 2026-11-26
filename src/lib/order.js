import { config } from '../config.js'

// The one hook the back office (CRM, WhatsApp/email confirmations, reminders) listens to.
// Every quote request and every order is POSTed to config.orderEndpoint (then forwarded server-side) as JSON in this shape (schema v1):
// {
//   schema: 'radlabs.order.v1', id: 'RL-20261126-4F7Q', type: 'quote' | 'order', created_at: ISO time,
//   customer: { name, phone, phone_e164, email?, city?, address? },
//   product?: { slug } from the browser; the server adds { name, price?, pay_url? } from src/catalog.js,  need?: string (quote form),
//   booking?: { preferred_date: 'YYYY-MM-DD', window: 'morning' | 'noon' | 'afternoon' },
//   notes?, consent: { terms: bool, marketing: bool }, source: { page, referrer, utm_* }
// }
// Field names are stable; add new fields rather than renaming. See docs/INTEGRATIONS.md.

const ALPHA = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
export function newOrderId(d = new Date()) {
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, '')
  let r = ''
  const bytes = crypto.getRandomValues(new Uint8Array(4))
  for (const b of bytes) r += ALPHA[b % ALPHA.length]
  return `RL-${ymd}-${r}`
}

export const toE164 = p => '+972' + p.replace(/[\s()-]/g, '').replace(/^\+?972/, '0').replace(/^0/, '')

function source() {
  const q = new URLSearchParams(location.search), s = { page: location.pathname + location.hash, referrer: document.referrer || '' }
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid']) if (q.get(k)) s[k] = q.get(k)
  try { // keep the first-touch campaign for the visit
    const first = JSON.parse(sessionStorage.getItem('rl-src') || 'null')
    if (first) return { ...first, page: s.page }
    sessionStorage.setItem('rl-src', JSON.stringify(s))
  } catch { /* storage blocked */ }
  return s
}

export function buildPayload(type, fields) {
  return { schema: 'radlabs.order.v1', id: newOrderId(), type, created_at: new Date().toISOString(), ...fields, source: source() }
}

// Resolves true when the webhook accepted it, false when there is no webhook (caller falls back to WhatsApp).
// Throws on a network or server error.
export async function sendOrder(payload) {
  if (!config.orderEndpoint) return false
  const res = await fetch(config.orderEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`webhook ${res.status}`)
  return true
}
