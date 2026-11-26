// Automatic WhatsApp answers. Keyword based on purpose: it only says things that are true and approved.
// Edit the texts here. Anything it doesn't recognise gets the "a person will answer" reply.

const HOURS = 'א׳–ה׳ 08:00–17:00'
const PHONE = '050-6244840'

export const OPT_OUT_REPLY = 'הוסרתם מרשימת הדיוור של RAD-LABs. נמשיך לעדכן רק על בדיקה שהזמנתם. טעות? כתבו "הצטרפות".'

export function isOptOut(text) {
  const t = String(text || '').trim().toLowerCase().replace(/["'.!״׳]/g, '')
  return ['הסר', 'הסרה', 'הסירו', 'הסירו אותי', 'stop', 'unsubscribe', 'הפסק'].includes(t)
}

const FAQ = [
  { keys: ['מחיר', 'עולה', 'עלות', 'כמה זה', 'הצעת מחיר', 'תמחור'],
    text: 'המחיר תלוי בסוג הבדיקה ובגודל הנכס. כתבו לנו בהודעה אחת: עיר, סוג הנכס (דירה, בית, מבנה ציבור, מגרש לבנייה) ומה צריך, ונשלח הצעת מחיר תוך יום עסקים.' },
  { keys: ['טופס 4', 'טופס4', 'היתר', 'קבלן', 'קרקע', 'מגרש'],
    text: 'אנחנו מבצעים בדיקות ראדון לקרקע ולמבנים לצורך היתר בנייה וטופס 4. שלחו כתובת הפרויקט ושלב הבנייה, ונחזור עם הצעה ולוח זמנים.' },
  { keys: ['כמה זמן', 'מתי תוצאות', 'תוצאה', 'תוצאות', 'תעודה', 'דוח'],
    text: 'אחרי שהגלאי חוזר למעבדה, התעודה נשלחת אליכם ב-PDF במייל. שאלה על בדיקה קיימת? כתבו את השם שעליו הוזמנה הבדיקה ונבדוק.' },
  { keys: ['luft', 'לופט', 'אוורור', 'להוריד', 'מערכת', 'פתרון', 'גבוה'],
    text: 'כשהתוצאה גבוהה, אפשר להוריד את ריכוז הראדון. נשמח להסביר על הדרכים, כולל מערכת LUFT. השאירו שם ועיר ונחזור אליכם.' },
  { keys: ['ראדון', 'radon', 'מה זה'],
    text: 'ראדון הוא גז רדיואקטיבי טבעי שעולה מהקרקע ואין לו ריח או צבע. הדרך היחידה לדעת את הריכוז בבית היא למדוד. רוצים לתאם בדיקה? כתבו עיר וסוג נכס.' },
  { keys: ['שעות', 'פתוחים', 'מתי אתם', 'כתובת', 'איפה'],
    text: `שעות הפעילות: ${HOURS}. המשרד בקדימה. טלפון: ${PHONE}.` },
  { greeting: true, keys: ['שלום', 'היי', 'הי', 'בוקר טוב', 'ערב טוב', 'אהלן', 'hi', 'hello'],
    text: 'שלום, הגעתם ל-RAD-LABs, מעבדה מורשית לבדיקות ראדון וקרינה (היתר 1281 מהמשרד להגנת הסביבה). איך נוכל לעזור? אפשר לכתוב: מחיר, טופס 4, תוצאות, או LUFT.' },
]

export function answerFor(text, now = new Date()) {
  const t = String(text || '').toLowerCase()
  if (!t.trim()) return null
  // Greetings only count when the whole message is a short hello, so "הי" inside "היתר" doesn't trigger it.
  const hit = FAQ.find(f => f.greeting ? t.trim().length <= 15 && f.keys.some(k => t.includes(k)) : f.keys.some(k => t.includes(k)))
  if (hit) return hit.text
  return afterHours(now)
    ? `תודה, קיבלנו. אנחנו זמינים ${HOURS} ונחזור אליכם בהקדם. דחוף? ${PHONE}.`
    : 'תודה, קיבלנו. נציג יחזור אליכם בהקדם.'
}

export function afterHours(now) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: 'numeric', hour12: false })
    .formatToParts(now).map(p => [p.type, p.value]))
  const h = Number(parts.hour) % 24
  return ['Fri', 'Sat'].includes(parts.weekday) || h < 8 || h >= 17
}
