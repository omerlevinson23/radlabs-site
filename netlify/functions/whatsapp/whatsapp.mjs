// Folder function: whatsapp.mjs is the entry; faq.mjs and _shared.mjs are its helpers (copied from radlabs-automation).
// /api/whatsapp : webhook for the WhatsApp Cloud API.
//  GET  : Meta's one-time verification (hub.challenge).
//  POST : incoming messages. Checks Meta's signature, handles "הסר", answers common questions,
//         and files every new number as a lead in the Google Sheet.
import crypto from 'node:crypto'
import { callCrm, normalizePhone } from './_shared.mjs'
import { answerFor, isOptOut, OPT_OUT_REPLY } from './faq.mjs'

const API = 'https://graph.facebook.com/v21.0'

function validSignature(raw, header) {
  const secret = process.env.WA_APP_SECRET
  if (!secret || !header?.startsWith('sha256=')) return false
  const expected = Buffer.from('sha256=' + crypto.createHmac('sha256', secret).update(raw).digest('hex'))
  const got = Buffer.from(header)
  return got.length === expected.length && crypto.timingSafeEqual(got, expected)
}

async function reply(to, text) {
  // A free-text reply is allowed because the customer wrote to us in the last 24 hours.
  await fetch(`${API}/${process.env.WA_PHONE_ID}/messages`, {
    method: 'POST', signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${process.env.WA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text, preview_url: false } }),
  })
}

export default async req => {
  if (req.method === 'GET') {
    const u = new URL(req.url)
    const ok = u.searchParams.get('hub.mode') === 'subscribe' && process.env.WA_VERIFY_TOKEN &&
      u.searchParams.get('hub.verify_token') === process.env.WA_VERIFY_TOKEN
    return new Response(ok ? u.searchParams.get('hub.challenge') : 'forbidden', { status: ok ? 200 : 403 })
  }
  if (req.method !== 'POST') return new Response(null, { status: 405 })
  const raw = await req.text()
  if (!validSignature(raw, req.headers.get('x-hub-signature-256'))) return new Response('bad signature', { status: 401 })

  let body
  try { body = JSON.parse(raw) } catch { return new Response(null, { status: 400 }) }
  const value = body?.entry?.[0]?.changes?.[0]?.value
  const msg = value?.messages?.[0]
  if (!msg) return new Response('ok') // delivery receipts etc.
  const from = msg.from // international digits, e.g. 972501234567
  const name = value?.contacts?.[0]?.profile?.name || ''
  const text = msg.type === 'text' ? msg.text?.body || '' : msg.type === 'button' ? msg.button?.text || '' : ''

  try {
    if (isOptOut(text)) {
      await callCrm({ action: 'optout', phone: normalizePhone('+' + from), channel: 'וואטסאפ' })
      await reply(from, OPT_OUT_REPLY)
      return new Response('ok')
    }
    await callCrm({ action: 'whatsapp_inbound', phone: normalizePhone('+' + from), name, text })
    const answer = answerFor(text, new Date())
    if (answer) await reply(from, answer)
  } catch (err) {
    console.error('whatsapp failed', String(err))
  }
  // Always 200, or Meta keeps retrying the same message.
  return new Response('ok')
}

// Reached at /api/whatsapp through public/_redirects (same as /api/order).
