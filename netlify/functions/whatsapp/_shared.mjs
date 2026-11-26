// Helpers for /api/whatsapp. Goes in the site repo next to order.mjs.

export const normalizePhone = p => String(p || '').replace(/[^\d+]/g, '').replace(/^00972/, '0').replace(/^\+?972/, '0')
export const isIsraeliPhone = p => /^0(5\d|[2-4]|[8-9]|7\d)\d{7}$/.test(p)

// The CRM (Google Apps Script) is the same URL the order form forwards to: ORDER_WEBHOOK_URL = <exec URL>?key=<secret>.
export async function callCrm(payload) {
  const url = process.env.ORDER_WEBHOOK_URL
  if (!url) throw new Error('ORDER_WEBHOOK_URL missing')
  // Apps Script answers a POST with a 302 to the result; fetch follows it.
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, redirect: 'follow',
    body: JSON.stringify(payload), signal: AbortSignal.timeout(20000),
  })
  const text = await res.text()
  try { return JSON.parse(text) } catch { throw new Error('crm_bad_reply ' + res.status) }
}
