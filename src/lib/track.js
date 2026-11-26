import { config } from '../config.js'

// Analytics and ad pixels load only after the visitor agrees (cookie banner). Until then track() does nothing.
const KEY = 'rl-consent'
let loaded = false

export function getConsent() {
  try { return localStorage.getItem(KEY) } catch { return null }
}

export function setConsent(value) {
  try { localStorage.setItem(KEY, value) } catch { /* private mode: ask again next visit */ }
  if (value === 'all') loadTrackers()
}

export const trackingConfigured = () => !!(config.gaId || config.metaPixelId)

function script(src) {
  const s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s)
}

export function loadTrackers() {
  if (loaded || getConsent() !== 'all') return
  loaded = true
  if (config.gaId) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function () { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', config.gaId, { anonymize_ip: true })
    script(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.gaId)}`)
  }
  if (config.metaPixelId) {
    const f = window.fbq = function () { f.callMethod ? f.callMethod.apply(f, arguments) : f.queue.push(arguments) }
    if (!window._fbq) window._fbq = f
    f.push = f; f.loaded = true; f.version = '2.0'; f.queue = []
    script('https://connect.facebook.net/en_US/fbevents.js')
    f('init', config.metaPixelId); f('track', 'PageView')
  }
}

// One call for both tools. Names: 'lead' (quote form), 'order' (order sent), 'begin_checkout' (sent to payment),
// 'purchase' (back from payment), 'contact' (phone / WhatsApp click), 'page_view'.
const META = { lead: 'Lead', order: 'SubmitApplication', begin_checkout: 'InitiateCheckout', purchase: 'Purchase', contact: 'Contact' }
export function track(name, params = {}) {
  if (!loaded) return
  if (window.gtag) window.gtag('event', name === 'order' ? 'generate_lead' : name, params)
  if (window.fbq && META[name]) window.fbq('track', META[name], params)
  if (window.fbq && name === 'page_view') window.fbq('track', 'PageView')
}
