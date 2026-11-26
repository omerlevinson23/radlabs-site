import { useEffect } from 'react'
import { sections, services } from './data.js'
import { useRoute } from './router.js'
import { Header, Footer, StickyBar } from './components/Layout.jsx'
import Home from './components/Home.jsx'
import ServicePage from './components/ServicePage.jsx'
import LegalPage, { legalPages } from './components/LegalPage.jsx'
import NotFound from './components/NotFound.jsx'
import OrderPage from './components/OrderPage.jsx'
import { ConsentBanner, ThanksPage, ReviewPage, useContactClicks } from './components/Extras.jsx'
import { track } from './lib/track.js'

const HOME_TITLE = 'RAD-LABs | בדיקות ראדון וקרינה ממעבדה מוסמכת'

export default function App() {
  const route = useRoute()
  const isHome = route === '' || sections.includes(route)
  useEffect(() => { if (isHome) document.title = HOME_TITLE }, [isHome])
  useEffect(() => { track('page_view') }, [route])
  useContactClicks()
  // scroll-craft: mount the engine on each page, re-measure when the page changes height (the service filter), tear down on leave.
  useEffect(() => {
    const sc = window.ScrollCraft?.mount(document.getElementById('main'))
    if (!sc) return
    const ro = new ResizeObserver(() => sc.layout())
    ro.observe(document.getElementById('main'))
    return () => { ro.disconnect(); sc.destroy() }
  }, [route])

  let page
  if (route in services) page = <ServicePage key={route} slug={route} />
  else if (route in legalPages) page = <LegalPage key={route} slug={route} />
  else if (route === 'order' || route.startsWith('order?')) page = <OrderPage />
  else if (route === 'thanks' || route.startsWith('thanks?')) page = <ThanksPage />
  else if (route === 'review') page = <ReviewPage />
  else if (isHome) page = <Home section={route} />
  else page = <NotFound />

  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} style={{ outline: "none" }}>{page}</main>
      <Footer />
      <StickyBar />
      <ConsentBanner />
    </>
  )
}
