// Business details used in every legal page. Items in [[double brackets]] are PLACEHOLDERS shown as dashed slots.
// DRAFT: all legal pages must be reviewed by an Israeli lawyer before the site goes live. Then set LEGAL_DRAFT to false.
import { contact } from '../data.js'

export const LEGAL_DRAFT = true

export const company = {
  name: 'ראד-לאבס המעבדות לכיול ובדיקת קרינה בע״מ',
  short: 'RAD-LABs',
  id: '[[מספר ח.פ.]]',
  address: `${contact.address}`,
  phone: contact.mobile,
  lab: contact.lab,
  email: contact.email,
  site: 'www.rad-labs.co.il',
  privacyContact: '[[שם האחראי/ת על פרטיות]]',
  a11yName: '[[שם רכז/ת הנגישות]]',
  a11yPhone: contact.lab,
  a11yEmail: contact.email,
}
