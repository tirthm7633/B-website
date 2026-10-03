import { useEffect, useState, type ReactNode } from 'react'
import { Link, Route, Routes, useLocation, type Location } from 'react-router-dom'
import ContactDock from './components/ContactDock'
import Footer from './components/Footer'
import Nav from './components/Nav'
import Preloader from './components/Preloader'
import SEO from './components/SEO'
import About from './components/sections/About'
import Categories from './components/sections/Categories'
import Contact from './components/sections/Contact'
import Gallery from './components/sections/Gallery'
import Hero from './components/sections/Hero'
import OurStory from './components/sections/OurStory'
import Testimonials from './components/sections/Testimonials'
import TrustedByFinest from './components/sections/TrustedByFinest'
import WhyUs from './components/sections/WhyUs'
import { prefersReducedMotion } from './lib/usePrefersReducedMotion'
import { lenisRef, useSmoothScroll } from './lib/useSmoothScroll'
import CatalogBrandPage from './pages/CatalogBrandPage'
import CatalogPage from './pages/CatalogPage'
import GalleryPage from './pages/GalleryPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectsPage from './pages/ProjectsPage'

function HomePage() {
  return (
    <main>
      <Hero />
      <About />
      <OurStory />
      <Categories />
      <TrustedByFinest />
      <WhyUs />
      <Testimonials />
      <Gallery />
      <Contact />
    </main>
  )
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 pt-28 text-center">
      <span className="eyebrow">404</span>
      <h1 className="font-display text-3xl font-light text-text">This page doesn&rsquo;t exist yet.</h1>
      <Link
        to="/"
        className="mt-2 rounded-full border border-accent px-6 py-2.5 text-[0.7rem] tracking-[0.2em] text-text uppercase transition-colors duration-300 hover:border-accent-bright hover:text-accent-bright"
      >
        Back home
      </Link>
    </div>
  )
}

/** Route changes don't scroll like a traditional multi-page site by
 * default — without this, navigating from a scrolled-down page would
 * land you mid-way down the next one. A hash (e.g. "/#why-us", used by
 * the nav menu to reach a homepage section from any page) is handled by
 * scrolling to that element instead. Goes through Lenis when it's
 * running (it drives the real scroll position from its own state every
 * tick, so a plain scrollTo/scrollIntoView call gets silently overridden
 * a moment later) — the very first load's hash is instead handled inside
 * useSmoothScroll itself, since Lenis doesn't exist yet when this effect
 * fires for the first time. */
function ScrollToTop({ location }: { location: Location }) {
  // The location being shown (see PageTransition), not the one just navigated to — so
  // the scroll reset happens when the new page swaps in, not while the old one fades out.
  const { pathname, hash } = location
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        if (lenisRef.current) lenisRef.current.scrollTo(el as HTMLElement, { immediate: true })
        else el.scrollIntoView()
        return
      }
    }
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

const PAGE_FADE_OUT_MS = 200
const PAGE_FADE_IN_MS = 250

/**
 * Fades between pages: the current page fades out (200ms), the new one is swapped in at
 * the midpoint and fades in (250ms). Only a change of *page* fades — a hash or query
 * change on the same page (the nav's "/#why-us" links) updates immediately, and with
 * reduced motion every navigation is instant. `children` receives the location that is
 * currently on screen, which lags the real one by the fade-out.
 */
function PageTransition({ children }: { children: (location: Location) => ReactNode }) {
  const location = useLocation()
  // The page currently on screen. It only lags `location` while fading out to a different page.
  const [shown, setShown] = useState(location)
  const fadingOut = !prefersReducedMotion() && location.pathname !== shown.pathname

  // Same page (hash/query change) or reduced motion: follow the real location straight away.
  if (!fadingOut && shown !== location) setShown(location)

  useEffect(() => {
    if (!fadingOut) return
    const timer = window.setTimeout(() => setShown(location), PAGE_FADE_OUT_MS)
    return () => window.clearTimeout(timer)
  }, [fadingOut, location])

  return (
    <div
      style={{
        opacity: fadingOut ? 0 : 1,
        transition: `opacity ${fadingOut ? PAGE_FADE_OUT_MS : PAGE_FADE_IN_MS}ms ease-out`,
      }}
    >
      {children(fadingOut ? shown : location)}
    </div>
  )
}

function App() {
  const [loading, setLoading] = useState(true)
  useSmoothScroll()

  return (
    <>
      <SEO />
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <Nav />
      <div className="pb-24 md:pb-0">
        <PageTransition>
          {(location) => (
            <>
              <ScrollToTop location={location} />
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/catalog/:brandSlug" element={<CatalogBrandPage />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              <Footer />
            </>
          )}
        </PageTransition>
      </div>
      <ContactDock />
    </>
  )
}

export default App
