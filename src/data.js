// All site text and contact details live here, so updating the site means editing this one file.
// Anything marked PLACEHOLDER must be replaced with real information before going live.

export const contact = {
  mobile: '050-6244840',
  mobileIntl: '972506244840',
  lab: '09-7938339',
  email: 'info@rad-labs.co.il',
  address: 'רוטשילד 54ב׳, קדימה',
  whatsappText: 'שלום, אשמח לקבל הצעת מחיר לבדיקה',
  // One response promise, used everywhere on the site. Change it here only.
  promise: 'הצעת מחיר ללא עלות', // Omer gives prices only in a personal quote, never on the site
  permit: '1281', // Ministry of Environmental Protection permit number (Omer, 2026-11-26)
  turnaround: 'תעודה תוך 4 ימים', // Omer, 2026-11-26
  payment: 'תשלום רק אחרי הבדיקה', // no upfront payment: customers fear scams (Omer, 2026-11-26)
}

export const waLink = (text = contact.whatsappText) =>
  `https://wa.me/${contact.mobileIntl}?text=${encodeURIComponent(text)}`

// The three labs, from the current site.
export const labs = [
  { city: 'קדימה', what: 'משרד ראשי ומעבדה לקרינה סביבתית', address: 'רוטשילד 54ב׳', phone: '09-7938339' },
  { city: 'באר שבע', what: 'המעבדה למדידות קרינה סביבתית', address: 'בקמפוס אוניברסיטת בן-גוריון בנגב', phone: null },
  { city: 'פתח תקווה', what: 'מעבדה בניהול נתן לביא', address: 'העצמאות 10', phone: null },
]

// The four audience paths on the homepage. Each links to service pages below.
export const paths = [
  {
    id: 'home',
    who: 'לבעלי דירות ובתים',
    title: 'בדיקת ראדון לבית',
    items: ['radon-home', 'radon-self-test', 'radon-reduction'],
    price: null, // PLACEHOLDER: e.g. 'החל מ-450 ₪'
    cta: 'להזמנת בדיקה',
  },
  {
    id: 'build',
    who: 'לקבלנים ויזמים',
    title: 'היתרי בנייה ואכלוס',
    items: ['soil-tests', 'radon-contractors', 'green-building'],
    price: null,
    cta: 'לקבלת הצעה',
  },
  {
    id: 'materials',
    who: 'ליצרנים ויבואנים',
    title: 'בדיקת חומרי בניין',
    items: ['green-building', 'sealing-tests'],
    price: null,
    cta: 'לקבלת הצעה',
  },
  {
    id: 'industry',
    who: 'לתעשייה ומוסדות',
    title: 'מעבדה וייעוץ',
    items: ['gamma-spectrometry', 'contamination', 'radon-institutions', 'consulting'],
    price: 'בהתאמה אישית',
    cta: 'לדבר עם מומחה',
  },
]

// Service pages. `slug` becomes the page address, e.g. rad-labs.co.il/radon-home
// `oldUrl` is the matching page on the current Wix site, for 301 redirects.
export const services = {
  'radon-home': {
    oldUrl: '/blank-4',
    name: 'בדיקת ראדון לדירה ולבית',
    short: 'בדיקה בדירה או בבית פרטי',
    intro: 'ראדון הוא גז רדיואקטיבי טבעי, חסר ריח וצבע, שעולה מהקרקע ומצטבר בחללים סגורים. הדרך היחידה לדעת מה הריכוז בבית שלכם היא למדוד.',
    points: ['טכנאי מגיע ומציב גלאי מכויל', 'ניתוח במעבדה שלנו', 'תעודה רשמית והסבר ברור של התוצאה', 'המלצות להפחתה במקרה הצורך'],
    price: null, // PLACEHOLDER: e.g. 'החל מ-450 ₪'
  },
  'radon-self-test': {
    oldUrl: '/copy-of',
    name: 'ערכת בדיקת ראדון עצמית',
    short: 'ערכת בדיקה עצמית',
    intro: 'מעדיפים לבדוק בעצמכם? אנחנו שולחים ערכה עם הוראות פשוטות, אתם מציבים את הגלאי ומחזירים אותו למעבדה לניתוח.',
    points: ['ערכה עם הוראות', 'ניתוח במעבדה שלנו', 'תוצאה ותעודה רשמית'],
    price: null, // PLACEHOLDER: e.g. 'החל מ-450 ₪'
  },
  'radon-reduction': {
    oldUrl: '/blank-5',
    name: 'פתרונות להפחתת ראדון',
    short: 'פתרונות להפחתת ראדון',
    intro: 'נמצא ריכוז ראדון גבוה? נלווה אתכם בבחירת פתרון ההפחתה המתאים ונבצע מדידה חוזרת כדי לוודא שהוא עובד.',
    points: ['אבחון מקור הבעיה', 'המלצה על פתרון מתאים', 'מדידת אימות לאחר הטיפול'],
  },
  'radon-contractors': {
    oldUrl: '/blank-2',
    name: 'בדיקות ראדון לקבלנים',
    short: 'בדיקות ראדון לטופס 4',
    intro: 'בדיקות ראדון למבנים חדשים לצורך קבלת אישורים, בתיאום מלא עם לוחות הזמנים של הפרויקט.',
    points: ['דוחות רשמיים לרשויות', 'תיאום מול לוח הזמנים של הפרויקט'],
  },
  'soil-tests': {
    oldUrl: '/blank-8',
    name: 'בדיקות קרקע לפוטנציאל ראדון',
    short: 'בדיקות קרקע להיתרי בנייה',
    intro: 'בדיקות קרקע לפוטנציאל ראדון לפני הבנייה או במהלכה, כחלק מתהליך קבלת היתר הבנייה.',
    points: ['מדידה בשטח לפי הנהלים', 'דוח לצורך היתר הבנייה', 'ייעוץ לגבי מיגון נדרש'],
  },
  'green-building': {
    oldUrl: '/blank-6',
    name: 'בדיקות קרינה לבנייה ירוקה',
    short: 'בנייה ירוקה, ת״י 5098',
    intro: 'בדיקות קרינה בחומרי בניין ועמידה בדרישות תקן 5098 ובנייה ירוקה.',
    points: ['בדיקות לפי ת״י 5098', 'דוח מפורט ותעודה למוצר'],
  },
  'sealing-tests': {
    oldUrl: '/blank-7',
    name: 'בדיקות איטום חומרי בניין לגז ראדון',
    short: 'בדיקות איטום לגז ראדון',
    intro: 'בדיקות איטום של חומרי בניין לגז ראדון ליצרנים וליבואנים.',
    points: ['בדיקה במעבדה', 'דוח מפורט למוצר', 'תעודה ליצרן או ליבואן'],
  },
  'gamma-spectrometry': {
    oldUrl: '/blank-18',
    name: 'מעבדת ספקטרומטריית גאמא',
    short: 'ספקטרומטריית גאמא',
    intro: 'ניתוח ספקטרומטריית גאמא למקורות רדיואקטיביים, מזון, דשנים וחומרי גלם לתעשייה.',
    points: ['מזון וחומרי גלם', 'דשנים ואוריאה', 'מקורות רפואיים ותעשייתיים'],
  },
  contamination: {
    oldUrl: '/copy-of-1',
    name: 'בדיקות זיהום רדיואקטיבי',
    short: 'בדיקות זיהום רדיואקטיבי',
    intro: 'איתור ומדידה של זיהום רדיואקטיבי במתקנים, בציוד ובשטח.',
    points: ['מדידות בשטח', 'ניתוח מעבדה', 'דוח והמלצות'],
  },
  'radon-institutions': {
    oldUrl: '/blank-3',
    name: 'בדיקות ראדון למוסדות ולמקומות עבודה',
    short: 'בדיקות ראדון למוסדות',
    intro: 'בדיקות ראדון לבתי ספר, גני ילדים, רשויות ומקומות עבודה.',
    points: ['תכנון מדידה לכל המבנה', 'עבודה מול רשויות', 'דוחות רשמיים'],
  },
  consulting: {
    oldUrl: '/blank-10',
    name: 'ייעוץ, הרצאות ושירותי מעבדה',
    short: 'ייעוץ, הרצאות ושירותי מעבדה',
    intro: 'ייעוץ בתחום הקרינה, הרצאות מקצועיות ושירותי מעבדה לבודקי ראדון וקרינה.',
    points: ['ייעוץ לחברות ומוסדות', 'הרצאות והדרכות', 'שירותי כיול ומעבדה לבודקים'],
  },
  luft: {
    oldUrl: '/copy-of-בדיקות-ראדון-כדאי-שתדע',
    name: 'גלאי איכות אוויר וראדון LUFT',
    short: 'גלאי LUFT',
    intro: 'ניטור רציף של ראדון ואיכות אוויר בבית, במשרד או במוסד, מבית sunRADON.',
    points: ['מדידה רציפה', 'מתאים לבית, משרד ומוסדות'],
    price: null, // PLACEHOLDER: e.g. '2,490 ₪'
  },
}

export const steps = [
  { title: 'פונים אלינו', text: 'וואטסאפ, טלפון או טופס קצר.', time: null },
  { title: 'מציבים גלאי', text: 'טכנאי מגיע ומציב גלאי מכויל.', time: null }, // PLACEHOLDER timing, e.g. 'תוך 3 ימים'
  { title: 'ניתוח במעבדה', text: 'הגלאי נבדק במעבדה שלנו.', time: null }, // PLACEHOLDER timing
  { title: 'תעודה תוך 4 ימים', text: 'תעודה רשמית עם התוצאה, הסבר והמלצות לפי הצורך.', time: null },
]

export const proof = [
  { title: 'היתר מס׳ 1281', text: 'היתר מעבדה והיתר ראדון מהמשרד להגנת הסביבה' },
  { title: 'לא רק ראדון', text: 'עשרות שנות ניסיון במדידת חומרים רדיואקטיביים: חומרי בניין, קרקע, מזון וחומרי גלם ותעשייה' },
  { title: 'מייסדים מהתחום', text: 'שמואל לוינסון ונתן לביא, עשרות שנות ניסיון בקמ״ג וברדיוכימיה' },
]

// PLACEHOLDER: replace with real customer quotes (with their permission).
// The page shows this section only once there are real quotes in the list. Example:
// { quote: 'הבדיקה לטופס 4 הגיעה בזמן והכול היה ברור.', who: 'שם הלקוח, חברה, עיר' },
export const testimonials = []

// The first entries match the four `paths` above, in the same order.
export const needs = ['בדיקת ראדון לדירה או בית', 'קבלן / היתר בנייה / טופס 4', 'בדיקת חומרי בניין', 'תעשייה / מעבדה', 'גלאי LUFT', 'אחר']

// Homepage sections that can be linked to directly, e.g. /#contact
export const sections = ['services', 'map', 'process', 'about', 'luft', 'labs', 'result', 'contact']

// Optional: a form service URL (e.g. Formspree) that receives contact requests by email.
// Leave empty and the form hands the request to WhatsApp instead.
// Kept for older imports; the setting now lives in src/config.js (orderEndpoint).
export { config as integrations } from './config.js'

// Radon figures for the map and the gauge.
// countries: REAL national averages in homes (arithmetic mean, Bq/m³), WHO Handbook on Indoor Radon (2009), Table 4.
//   Israel: 64 Bq/m³ in a ground-floor room, 2006 survey (Ministry of Environmental Protection guideline 2).
// districts: PLACEHOLDER examples, shown as such on the page. Replace with RAD-LABs' own averages per district.
export const radon = {
  actionLevel: 200,
  countries: {
    '036': ['אוסטרליה', 11], '040': ['אוסטריה', 99], '056': ['בלגיה', 48], '124': ['קנדה', 28], '203': ['צ׳כיה', 140],
    '208': ['דנמרק', 59], '246': ['פינלנד', 120], '250': ['צרפת', 89], '276': ['גרמניה', 49], '300': ['יוון', 55],
    '348': ['הונגריה', 82], '352': ['איסלנד', 10], '372': ['אירלנד', 89], '380': ['איטליה', 70], '392': ['יפן', 16],
    '442': ['לוקסמבורג', 110], '484': ['מקסיקו', 140], '528': ['הולנד', 23], '554': ['ניו זילנד', 22], '578': ['נורווגיה', 89],
    '616': ['פולין', 49], '620': ['פורטוגל', 62], '410': ['דרום קוריאה', 53], '703': ['סלובקיה', 87], '724': ['ספרד', 90],
    '752': ['שוודיה', 108], '756': ['שווייץ', 78], '826': ['בריטניה', 20], '840': ['ארצות הברית', 46], '376': ['ישראל', 64],
  },
  // false: district values are examples. The live build (npm run build) then shows the districts without values;
  // previews still show the examples. Set true once real averages are in.
  districtsReady: false,
  districts: {
    'IL-Z': ['מחוז הצפון', 62], 'IL-HA': ['מחוז חיפה', 48], 'IL-M': ['מחוז המרכז', 44],
    'IL-TA': ['מחוז תל אביב', 38], 'IL-JM': ['מחוז ירושלים', 57], 'IL-D': ['מחוז הדרום', 81],
  },
}

// What can be ordered online lives in src/catalog.js (shared with the order function on the server).
export { orderables } from './catalog.js'
