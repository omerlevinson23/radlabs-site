// Integration settings. Each one is optional: when it is empty, the site falls back to what works without it
// (WhatsApp for orders, no tracking, no payment step). Set them in Netlify: Site settings → Environment variables,
// then redeploy. See docs/INTEGRATIONS.md for what each one is and who supplies it.
const env = import.meta.env

export const config = {
  // Where the browser POSTs every order and quote request as JSON. On Netlify set it to /api/order: that is our own
  // function (netlify/functions/order.mjs), which checks the request and forwards it, signed, to the automation
  // webhook kept server-side in ORDER_WEBHOOK_URL. Empty: orders go out by WhatsApp instead.
  orderEndpoint: env.VITE_ORDER_ENDPOINT || env.VITE_FORM_ENDPOINT || '',
  // Google Analytics 4 measurement ID, e.g. G-XXXXXXXXXX
  gaId: env.VITE_GA_ID || '',
  // Meta (Facebook/Instagram) Pixel ID, digits only
  metaPixelId: env.VITE_META_PIXEL_ID || '',
  // Google Business "ask for reviews" link, e.g. https://g.page/r/XXXX/review
  googleReviewUrl: env.VITE_GOOGLE_REVIEW_URL || '',
  // Privacy policy and terms pages. Empty: the site's own /privacy and /terms pages.
  privacyUrl: env.VITE_PRIVACY_URL || '',
  termsUrl: env.VITE_TERMS_URL || '',
}
