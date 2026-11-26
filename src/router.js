import { useEffect, useState } from 'react'

// Real site: clean paths like /radon-home. Preview build: #radon-home (the preview host only allows plain hashes).
const HASH = import.meta.env.VITE_HASH_ROUTES === '1'

function current() {
  if (HASH) return location.hash.replace(/^#/, '') || ''
  return location.pathname.replace(/^\/|\/$/g, '')
}

export function href(slug) {
  return HASH ? `#${slug}` : `/${slug}`
}

export function navigate(e, slug) {
  if (HASH) return // the browser handles hash links itself
  e.preventDefault()
  history.pushState({}, '', `/${slug}`)
  dispatchEvent(new PopStateEvent('popstate'))
  scrollTo(0, 0)
}

export function useRoute() {
  const [route, setRoute] = useState(current())
  useEffect(() => {
    const on = () => { setRoute(current()); if (HASH) scrollTo(0, 0) }
    addEventListener(HASH ? 'hashchange' : 'popstate', on)
    return () => removeEventListener(HASH ? 'hashchange' : 'popstate', on)
  }, [])
  return route
}

// Link to a section of the homepage (contact, process, ...), from any page.
export function sectionHref(id) {
  return HASH ? `#${id}` : `/#${id}`
}

// In-page jump (skip link, "order" buttons) that doesn't change the route.
export function jumpTo(e, id) {
  e.preventDefault()
  const el = document.getElementById(id)
  if (!el) { location.href = sectionHref(id); return }
  el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  el.focus({ preventScroll: true })
}
