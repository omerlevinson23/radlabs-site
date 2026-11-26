// POST /api/order: receives an order or quote request from the site, checks it, and forwards it to the automation
// webhook (Make / Zapier / n8n / CRM). The webhook URL never reaches the browser.
// Environment (Netlify → Site settings → Environment variables):
//   ORDER_WEBHOOK_URL     required. Where to forward the JSON.
//   ORDER_WEBHOOK_SECRET  optional. If set, each forward carries X-Radlabs-Signature: sha256=<HMAC of the body>.
//   ALLOWED_ORIGIN        optional. e.g. https://www.rad-labs.co.il ; requests from other origins are refused.
import { createHash, createHmac } from 'node:crypto'
import { orderables } from '../../src/catalog.js'

const MAX_BYTES = 8 * 1024
const PHONE = /^\+9725\d{8}$|^\+972[2-9]\d{7}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const s = n => v => typeof v === 'string' && v.length <= n
const req = n => v => typeof v === 'string' && v.trim().length > 0 && v.length <= n
const bool = v => typeof v === 'boolean'
const iso = v => typeof v === 'string' && v.length <= 40 && !Number.isNaN(Date.parse(v))

// Every allowed field and its rule. Anything not listed here is refused.
const SHAPE = {
  schema: v => v === 'radlabs.order.v1',
  id: v => typeof v === 'string' && /^RL-\d{8}-[A-Z0-9]{4}$/.test(v),
  type: v => v === 'quote' || v === 'order',
  created_at: iso,
  website: s(200), // honeypot
  need: s(80),
  notes: s(1000),
  customer: { name: req(120), phone: req(30), phone_e164: v => typeof v === 'string' && PHONE.test(v), email: v => s(200)(v) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), city: s(80), address: s(200) },
  // Only the slug is taken from the browser. Name, price and payment link are looked up here (src/catalog.js),
  // so nobody can make the automation send a link of their choosing to someone's phone.
  product: { slug: v => typeof v === 'string' && orderables.some(o => o.slug === v) },
  booking: { preferred_date: v => typeof v === 'string' && DATE.test(v), window: v => ['morning', 'noon', 'afternoon'].includes(v) },
  consent: { terms: bool, terms_text: s(300), marketing: bool, marketing_text: s(300), at: iso },
  source: { page: s(300), referrer: s(500), utm_source: s(100), utm_medium: s(100), utm_campaign: s(150), utm_term: s(150), utm_content: s(150), gclid: s(200), fbclid: s(300) },
}

function walk(obj, shape, path) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return path || 'body'
  for (const [k, v] of Object.entries(obj)) {
    const rule = shape[k]
    if (!rule) return `${path}${k}:unknown`
    if (typeof rule === 'function') { if (!rule(v)) return `${path}${k}` }
    else { const bad = walk(v, rule, `${path}${k}.`); if (bad) return bad }
  }
  return ''
}

function check(o) {
  const bad = walk(o, SHAPE, '')
  if (bad) return bad
  for (const k of ['schema', 'id', 'type', 'customer']) if (!(k in o)) return k
  if (!o.customer.name || !o.customer.phone_e164) return 'customer'
  if (o.type === 'order' && !(o.product && o.product.slug && o.consent && o.consent.terms === true)) return 'order'
  return ''
}

// Rate limits, kept in Netlify Blobs so they hold across function instances (an in-memory count resets on every
// cold start). Keys are hashed, so the store never holds a raw IP or phone number.
//   per IP:    8 per 10 minutes, 30 per day
//   per phone: 3 per day, so nobody can flood a stranger's WhatsApp with order confirmations
// If Blobs is unavailable (local dev), falls back to an in-memory count.
const LIMITS = { ip: [[10 * 60e3, 8], [24 * 3600e3, 30]], phone: [[24 * 3600e3, 3]] }
const mem = new Map()
let blobStore
async function store() {
  if (globalThis.__rlStore) return globalThis.__rlStore // tests
  if (blobStore === undefined) {
    try { const { getStore } = await import('@netlify/blobs'); blobStore = getStore('rate-limits') } catch { blobStore = null }
  }
  return blobStore
}
const hashKey = (kind, v) => kind + ':' + createHash('sha256').update((process.env.RATE_SALT || 'radlabs') + v).digest('hex').slice(0, 32)

async function over(kind, value) {
  const key = hashKey(kind, value), now = Date.now(), keep = Math.max(...LIMITS[kind].map(l => l[0]))
  const st = await store()
  let list
  try { list = st ? (await st.get(key, { type: 'json' })) || [] : mem.get(key) || [] } catch { list = mem.get(key) || [] }
  list = list.filter(t => now - t < keep)
  const hit = LIMITS[kind].some(([win, max]) => list.filter(t => now - t < win).length >= max)
  if (!hit) {
    list.push(now)
    try { if (st) await st.setJSON(key, list); else mem.set(key, list) } catch { mem.set(key, list) }
    if (mem.size > 5000) mem.clear()
  }
  return hit
}

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

export default async (req) => {
  if (req.method !== 'POST') return json(405, { ok: false })
  const allowed = process.env.ALLOWED_ORIGIN
  if (allowed && req.headers.get('origin') && req.headers.get('origin') !== allowed) return json(403, { ok: false })
  // Netlify sets x-nf-client-connection-ip itself; x-forwarded-for can be forged by the caller, so it is not used.
  const ip = req.headers.get('x-nf-client-connection-ip') || 'unknown'
  if (await over('ip', ip)) return json(429, { ok: false, error: 'rate' })
  const raw = await req.text()
  if (raw.length > MAX_BYTES) return json(413, { ok: false })
  let o
  try { o = JSON.parse(raw) } catch { return json(400, { ok: false, error: 'json' }) }
  if (o.website) return json(200, { ok: true }) // honeypot filled: a bot. Pretend success, forward nothing.
  const bad = check(o)
  if (bad) return json(422, { ok: false, error: bad })
  if (await over('phone', o.customer.phone_e164)) return json(429, { ok: false, error: 'rate' })
  const url = process.env.ORDER_WEBHOOK_URL
  if (!url) return json(503, { ok: false, error: 'not_configured' })
  delete o.website
  if (o.product) {
    const p = orderables.find(x => x.slug === o.product.slug)
    o.product = { slug: p.slug, name: p.name, ...(p.price ? { price: p.price } : {}), ...(p.payUrl ? { pay_url: p.payUrl } : {}) }
  }
  const body = JSON.stringify({ ...o, received_at: new Date().toISOString() })
  const headers = { 'Content-Type': 'application/json' }
  if (process.env.ORDER_WEBHOOK_SECRET) headers['X-Radlabs-Signature'] = 'sha256=' + createHmac('sha256', process.env.ORDER_WEBHOOK_SECRET).update(body).digest('hex')
  // The CRM is a Google Apps Script web app: it authenticates by ?key= in ORDER_WEBHOOK_URL (the signature header is
  // extra), answers POST with a 302 that fetch follows, and always returns HTTP 200 with {ok:false} on errors.
  let res, reply
  try {
    res = await fetch(url, { method: 'POST', headers, body, redirect: 'follow', signal: AbortSignal.timeout(20000) })
    reply = await res.text()
  } catch { return json(504, { ok: false, error: 'upstream_timeout' }) }
  if (!res.ok) return json(502, { ok: false, error: 'upstream' })
  try { if (JSON.parse(reply).ok === false) return json(502, { ok: false, error: 'upstream' }) } catch { /* non-JSON 200 counts as accepted */ }
  return json(200, { ok: true, id: o.id })
}

// Reached at /api/order through public/_redirects.
