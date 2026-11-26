// No imports here: the server function (netlify/functions/order.mjs) reads this file too.
// What can be ordered online (the /order page). `price` and `payUrl` are PLACEHOLDERS until Omer supplies them.
// price: the final price INCLUDING VAT, as text, e.g. '₪590' (the page adds "כולל מע״מ").
// payUrl: the payment-page link from the payment provider (Grow / Meshulam, Cardcom, Tranzila...), one per product.
// With a payUrl the customer goes straight to payment after ordering; without one, the order arrives and
// RAD-LABs confirms the price and sends a payment link. `booking`: ask for a preferred date for the technician.
export const orderables = [
  { slug: 'radon-home', name: 'בדיקת ראדון לדירה או בית', note: 'טכנאי מציב גלאי, ניתוח במעבדה ותעודה רשמית', price: null, payUrl: null, booking: true },
  { slug: 'radon-self-test', name: 'ערכת בדיקת ראדון עצמית', note: 'ערכה נשלחת אליכם, מחזירים אותה למעבדה', price: null, payUrl: null, booking: false },
  { slug: 'radon-contractors', name: 'בדיקת ראדון לטופס 4', note: 'לקבלנים ויזמים, לפי הנחיות המשרד להגנת הסביבה', price: null, payUrl: null, booking: true },
  { slug: 'luft', name: 'גלאי איכות אוויר וראדון LUFT', note: 'ניטור רציף בבית או במשרד', price: null, payUrl: null, booking: false },
]
