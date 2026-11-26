# RAD-LABs website

New site for rad-labs.co.il, replacing the Wix site. React + Tailwind CSS, designed with taste-skill and Impeccable, with Apple-style glass chrome. Hebrew, right-to-left. No animation libraries.

## Run it

```
npm install
npm run dev        # local preview at http://localhost:5173
npm run build      # production site in dist/
```

## Edit the content

All text, services, prices and contact details are in `src/data.js`. Search it for `PLACEHOLDER`: those items (prices, turnaround times, testimonials, LUFT photo, accessibility statement) must be replaced with real information before going live.

## Pages

- `/` homepage: hero, the service index (by audience, searchable), the radon statement, the home test opened step by step, about and the three labs, the LUFT monitor, the order form
- `/radon-home`, `/soil-tests`, `/green-building` and the other service pages listed in `src/data.js`
- `/accessibility`

The contact form checks name and phone, shows clear errors, a sending state, a success state and a failure state.
By default it needs no server: it turns the answers into a ready WhatsApp message to 050-6244840.
To also get requests by email, create a free form at Formspree and build with `VITE_FORM_ENDPOINT=https://formspree.io/f/xxxx`.

## Impeccable pass and glass look (latest)

The Impeccable design skill is installed in `.claude/skills/impeccable` (Claude Code picks it up in this project). Its detector: `.claude/skills/impeccable/scripts/impeccable detect http://localhost:5173/` with `npm run dev` running. Its automatic check-on-edit hook is not switched on; run `/impeccable hooks on` in Claude Code to add it.

What changed after its critique (27/40) and detector (0 problems):
- **Glass:** Apple-style translucent, blurred chrome: a floating nav bar, a floating phone bar (call, WhatsApp, quote), a sticky filter bar over the service list, and frosted panels. Where the browser can't blur, or the visitor asked for less transparency, the panels turn solid.
- **The form sends honestly:** without an email service the button says "שליחה בוואטסאפ" and opens WhatsApp with the message written. "Choose what you need" is now required, and it follows the audience picked in the service list, so contractor leads aren't filed as apartments. Phone numbers in +972 form are accepted.
- **No empty price boxes:** where there is no price yet, the page shows the response promise instead.
- **One promise everywhere:** `contact.promise` in `src/data.js` ("הצעת מחיר תוך יום עסקים").
- **Services grouped by audience** with a heading per group; search also finds "רדון" and "טופס 4".
- A second skip link goes straight to the order form.


## Design

- **Look (taste-skill deal for a service page):** palette "three stones": stone-grey ground #eeecea, warm charcoal ink #333231, a muted olive #5c6b54 used for the main action. Calm and trustworthy, close to a clinic or lab, with no warning-sign colours. Dark mode uses the same palette inverted.
- **Type:** the dealt pairing is Newsreader over Hanken Grotesk, which have no Hebrew. The Hebrew counterparts are Frank Ruhl Libre (a calm serif, weight 400) for headings and Heebo (a neo-grotesk) for text, buttons and figures.
- **Shape:** soft corners, pill buttons and filter chips, and hairline rules instead of heavy ink bars.
- **Glass:** the nav, phone bar, filter bar and panels are frosted glass, with a solid fallback.
- **Nothing invented:** customer quotes stay hidden until `testimonials` in `src/data.js` holds real ones. No made-up counters or readings; no prices until the real ones are in.
- **Accessibility:** two skip links, landmarks and heading order, visible focus, a keyboard menu (Esc closes it), labelled fields with linked errors, 44px tap targets, and WCAG AA contrast in light and dark mode (checked with axe-core).
- **Pages:** unknown addresses show a 404 page.

## Going live (not done yet)

1. Host on Netlify or Vercel (both free for a site this size). `public/_redirects` (Netlify) and `vercel.json` (Vercel) already send the old Wix addresses such as `/blank-4` to the new pages, so Google rankings carry over.
2. Point the rad-labs.co.il domain to the new host, then cancel the Wix plan.
3. Connect Google Analytics and Search Console.

## Taste-skill pass

taste-skill (github.com/Leonxlnx/taste-skill) is installed at `.claude/skills/design-taste-frontend`. Its gate is armed in `.taste-skill/` and runs against the dev server: `node .claude/skills/design-taste-frontend/scripts/gate.mjs http://localhost:5173/`.

What changed:
- The hero now has the first screen to itself: the h1, the two actions and the 50+ panel. The service index has its own section after it.
- Every section is at least one screen tall.
- One "moment": the radon statement turns from grey to ink word by word as you scroll. It stays still under reduced motion.
- The ground is flat.
- One button pair: the olive primary and one outline secondary.
- The search field has a visible label.
- The hero has an entrance animation, rows lift on hover, and link underlines draw in.
- The labs table moved into "About".
- Share tags, theme colour and an icon were added.
- Contact links have 44px tap targets on phones.

What was not followed, and why:
- Photos: taste-skill wants photographs on every service section, and none fit a radon lab. Real lab and LUFT photos are needed from RAD-LABs.
- "No real phone numbers": that rule is for made-up sites. These are the lab's real numbers.
- Its left-edge and stagger checks read Hebrew (right to left) as misaligned.
- The glass bars stay see-through, as requested.
- The last gate run ended OPEN. What remains is the photo-dependent findings and those RTL readings.

## Scroll-craft pass

scroll-craft (github.com/nateherkai/scroll-craft) is installed at `.claude/skills/scroll-craft`. Its engine is copied unmodified into `src/vendor/scrollcraft/` and is mounted per page in `src/App.jsx`. Its CSS sits in the base layer, so the site's own styles win.

The brief was written by me, under Omer's delegation ("use this").

The scroll path:
1. **Hero.** The "50" counts up once when the page loads. The glass panel drifts slightly slower than the headline as you scroll, which gives the hero depth. (Devices: count and parallax.)
2. **Services.** The index stays still, because it is a tool.
3. **The radon statement.** This is the peak and the signature move. It pins for about 2.4 screens. The words turn to ink as you read them, and the background slowly dims like a closed room filling up. It clears when "to measure" (למדוד) lands. (Device: pin.)
4. **The home test.** The promise panel wipes up into place beside the four steps. (Device: reveal.)
5. **The order form.** The submit button leans slightly toward a mouse pointer. This is off on touch screens and with reduced motion. (Device: pointer magnet.)

With reduced motion, the statement is not pinned and shows in full ink, the count shows 50 straight away, and nothing moves.

Not used, and why:
- **No scroll videos, generated scenes or scrub.** These need images generated through kie.ai (no key, and the service can't be reached from here) or real footage. They would also mean showing a made-up lab.
- **No pointer spotlight on the LUFT band.** Impeccable flags that glow as a design cliché.
- **No fade-ins on rows or cards.** taste-skill bans them.
- **No horizontal scroll.** Its direction is not built for right-to-left pages.

## Radon map and result gauge (2026-11-26)
`RadonMap.jsx` (section `#map`, after the statement): a d3 globe with real national averages (WHO Handbook on Indoor Radon 2009, Table 4; Israel 64 Bq/m³ from the Ministry of Environmental Protection). Drag to spin; click Israel to fly in to its districts. **District values are placeholders**, labelled on the page; replace `radon.districts` in `src/data.js` with RAD-LABs' own averages. Borders: world-atlas (Natural Earth) and amCharts geodata, which is linkware: keep the "amCharts" credit visible.
`RadonGauge.jsx` (section `#result`, before the order form): 0–400 Bq/m³, red from the 200 Bq/m³ action level. 72 is an example value.
Later the same day Omer asked for the radon sentence to take less room: the pinned statement section was removed, and the same word-by-word reveal (`Statement.jsx`, no pin) now opens the `#map` section.
