import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect } from 'react'
import { prefersReducedMotion } from './usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/** The live Lenis instance, if any (null before mount and whenever
 * reduced-motion is on). Lenis drives the *real* scroll position from its
 * own internal state on every tick, so anything that wants to move the
 * page — not just the wheel/touch input Lenis already owns — has to go
 * through lenis.scrollTo(); a plain window.scrollTo() gets silently
 * overridden the moment Lenis's next tick runs. Exported so route-change
 * scroll handling (see App.tsx's ScrollToTop) can use it instead of
 * fighting it. */
export const lenisRef: { current: Lenis | null } = { current: null }

export function useSmoothScroll() {
  useEffect(() => {
    // Respect reduced-motion: let the browser handle native scrolling
    // instead of Lenis's inertia-smoothed scroll.
    if (prefersReducedMotion()) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
    })
    lenisRef.current = lenis

    // A hash in the URL on first load (e.g. the nav menu's "/#why-us"
    // links, reached from another page) needs handling right here: Lenis
    // doesn't exist yet when this component mounts, so any earlier
    // attempt to scroll to that element (see App.tsx's ScrollToTop) is
    // exactly what Lenis's own first tick, a moment later, overwrites.
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash)
      if (el) lenis.scrollTo(el as HTMLElement, { immediate: true })
    }

    lenis.on('scroll', ScrollTrigger.update)

    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenisRef.current = null
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])
}
