# Integrations: what is built, what plugs in where, and what is still needed

Everything here is optional. With nothing set, the site still works: orders and quote requests open WhatsApp
with the details already written, there is no tracking and no cookie banner, and there is no payment step.

## 1. Order hook (for the automation work)

The browser POSTs JSON to `/api/order`, our Netlify function (`netlify/functions/order.mjs`). The function:
- accepts only known fields, checks each one (type, length, phone format), and refuses anything else (422);
- drops bots that fill the hidden `website` field;
- limits each IP to 8 requests per 10 minutes (best effort);
- adds `received_at` and forwards the JSON to `ORDER_WEBHOOK_URL` (Make, Zapier, n8n or a CRM);
- if `ORDER_WEBHOOK_SECRET` is set, signs the body: header `X-Radlabs-Signature: sha256=<hex HMAC-SHA256 of the raw body>`.

The webhook URL never reaches the browser. The CRM is a Google Apps Script web app (radlabs-automation): it
authenticates by `?key=<secret>` in `ORDER_WEBHOOK_URL`, answers with a 302 that the function follows, and reports
errors as HTTP 200 with `{"ok":false}`, which the function treats as a failure (the customer then sees the WhatsApp fallback).
The forward times out after 20 seconds.

### Payload, schema `radlabs.order.v1`

```json
{
  "schema": "radlabs.order.v1",
  "id": "RL-20261126-4F7Q",
  "type": "order",
  "created_at": "2026-11-26T10:12:00.000Z",
  "received_at": "2026-11-26T10:12:01.000Z",
  "customer": { "name": "ישראל ישראלי", "phone": "050-1234567", "phone_e164": "+972501234567",
                "email": "a@b.co", "city": "קדימה", "address": "הרצל 1" },
  "product": { "slug": "radon-home", "name": "בדיקת ראדון לדירה או בית", "price": "₪590", "pay_url": "https://..." },
  "booking": { "preferred_date": "2026-12-01", "window": "morning" },
  "notes": "קומת קרקע",
  "consent": { "terms": true, "terms_text": "…", "marketing": true, "marketing_text": "…", "at": "2026-11-26T10:12:00.000Z" },
  "source": { "page": "/order", "referrer": "", "utm_source": "google", "gclid": "…" }
}
```

- `product.name`, `price` and `pay_url` are filled in by the server from `src/catalog.js`; the browser sends only the slug.
- `type`: `order` (the /order page) or `quote` (the short form on the homepage and service pages; it has `need` instead of `product`, and no `booking`).
- Optional fields are left out when empty. `window` is `morning` (8–12), `noon` (12–15) or `afternoon` (15–18).
- `id` is shown to the customer and passed to the payment page as `?order=`. Use it to match payments to orders.
- New fields may be added later; existing names will not change.

## 2. Online payment

Each product in `src/data.js → orderables` has `price` (text, including VAT) and `payUrl` (a payment-page link
from the provider: Grow/Meshulam, Cardcom or Tranzila). With a `payUrl`, the customer is sent there after the order
is accepted, with `?order=<id>` added. Set the provider's "success" return address to `https://<domain>/thanks`.

**The return to /thanks is not proof of payment.** Mark an order paid only from the provider's server-to-server
callback (IPN/webhook), checked with the provider's signature or an API lookup. That callback is the next function
to build once the provider is chosen (it needs the provider's API docs and keys). After verifying the provider's
signature it POSTs `{"action":"payment","id":"RL-…","amount":450}` to `ORDER_WEBHOOK_URL`, and the CRM marks the order paid.

## 3. Booking

The order form asks for a preferred date (from tomorrow, not Saturday) and a time window, for tests that need a
technician visit (`booking: true`). RAD-LABs confirms by phone or WhatsApp. A live calendar (e.g. Calendly or
Google Calendar slots) can replace this later.

## 4. Analytics and Meta Pixel

Set `VITE_GA_ID` (GA4, `G-…`) and/or `VITE_META_PIXEL_ID`. The cookie banner then appears; the scripts load only
after "מסכים/ה" and never before. Events sent: `page_view`, `lead` (quote form), `generate_lead`/`SubmitApplication`
(order sent), `begin_checkout`/`InitiateCheckout` (sent to payment), `purchase`/`Purchase` (return to /thanks, analytics only),
`contact` (phone or WhatsApp click). No inline scripts, so the CSP needs no 'unsafe-inline'.

## 5. Google reviews

`/review` forwards to `VITE_GOOGLE_REVIEW_URL` (the "ask for reviews" link from Google Business Profile). The
automation sends `https://<domain>/review` after the results are delivered.

## 6. WhatsApp webhook

`/api/whatsapp` (`netlify/functions/whatsapp/`, from the automation thread): Meta's WhatsApp Cloud API webhook.
It checks Meta's signature, handles "הסר" opt-outs, answers common questions, and files new numbers as leads in the CRM.
Needs `WA_TOKEN`, `WA_PHONE_ID`, `WA_APP_SECRET`, `WA_VERIFY_TOKEN`. Its texts live in `faq.mjs`.

## Environment variables (Netlify → Site settings → Environment variables)

| Name | Side | What |
|---|---|---|
| `VITE_ORDER_ENDPOINT` | browser | `/api/order` to turn the hook on |
| `VITE_GA_ID` | browser | GA4 measurement ID |
| `VITE_META_PIXEL_ID` | browser | Meta Pixel ID |
| `VITE_GOOGLE_REVIEW_URL` | browser | Google review link |
| `ORDER_WEBHOOK_URL` | server, secret | automation webhook |
| `ORDER_WEBHOOK_SECRET` | server, secret | signing key shared with the automation |
| `ALLOWED_ORIGIN` | server | e.g. `https://www.rad-labs.co.il` |
| `WA_TOKEN`, `WA_PHONE_ID`, `WA_APP_SECRET`, `WA_VERIFY_TOKEN` | server, secret | WhatsApp Cloud API |

`VITE_*` values are built into the site, so redeploy after changing them.

## When an order is refused (HTTP 502 "upstream")
The CRM (Google Apps Script) said no. Netlify → Logs → Functions → order shows "order: CRM refused <id> <status> <reply>".
`forbidden` means the ?key= in ORDER_WEBHOOK_URL does not match SHARED_SECRET in the script's properties.
After changing any environment variable in Netlify, redeploy (Deploys → Trigger deploy) so the function uses it.
