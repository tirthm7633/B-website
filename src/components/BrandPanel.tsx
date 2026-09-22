import { forwardRef, useEffect, useRef, useState } from 'react'
import { brands, type Brand } from '../data/content'
import { useDocumentVisible } from '../lib/useAnimationEnvironment'
import BrandLogo from './BrandLogo'
import Marquee from './Marquee'

// Unprefixed (no responsive breakpoints): BrandPanel always renders at its
// desktop size. At a real >=1280px viewport that's identical to before.
// Below 1280px the whole composition (panel + both orbits) renders at this
// same fixed size inside a canvas that gets uniformly scaled down instead
// (see ScaledDesktopCanvas in TrustedByFinest) — so this must stay
// constant, not shrink via its own breakpoint classes.
const PANEL_TILE = 'h-[118px] w-[250px]'
const CENTERED_CLASS = 'brand-tile-centered'
const JS_PAUSED_CLASS = 'marquee-js-paused'
// If a row's track hasn't visibly moved across a full interval while it's
// supposed to be playing (in view, tab active, not hovered), something
// paused it outside this component's control — restart it.
const WATCHDOG_INTERVAL_MS = 2000

const ROW_CONFIG: { direction: 'left' | 'right'; speed: number }[] = [
  { direction: 'left', speed: 42 },
  { direction: 'right', speed: 48 },
  { direction: 'left', speed: 38 },
]

/**
 * Highlights whichever tile currently sits nearest the row's horizontal
 * centre. Toggles a class directly on the DOM element (not React state)
 * because Marquee renders each tile twice for its seamless loop — both
 * copies share the same props/key, so only real element identity
 * (via IntersectionObserver's target) tells them apart correctly.
 */
function useCenterHighlight(rowRef: React.RefObject<HTMLDivElement | null>) {
  const currentRef = useRef<Element | null>(null)

  useEffect(() => {
    const row = rowRef.current
    if (!row) return

    const observer = new IntersectionObserver(
      (entries) => {
        const rowRect = row.getBoundingClientRect()
        const rowCenter = rowRect.left + rowRect.width / 2
        let bestEl: Element | null = null
        let bestDist = Infinity
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const elCenter = entry.boundingClientRect.left + entry.boundingClientRect.width / 2
          const dist = Math.abs(elCenter - rowCenter)
          if (dist < bestDist) {
            bestDist = dist
            bestEl = entry.target
          }
        })
        if (bestEl && bestEl !== currentRef.current) {
          currentRef.current?.classList.remove(CENTERED_CLASS)
          const next: Element = bestEl
          currentRef.current = next
          next.classList.add(CENTERED_CLASS)
        }
      },
      { root: row, threshold: 0.6, rootMargin: '0px -35% 0px -35%' },
    )

    const tiles = row.querySelectorAll('[data-brand-tile]')
    tiles.forEach((t) => observer.observe(t))
    return () => {
      observer.disconnect()
      currentRef.current?.classList.remove(CENTERED_CLASS)
    }
    // row/tiles are static for the lifetime of this row (brands data never
    // changes at runtime) — this only needs to run once, not on every
    // render (it was previously missing a dependency array entirely).
  }, [rowRef])
}

function readTranslateX(track: HTMLElement) {
  const transform = getComputedStyle(track).transform
  if (transform === 'none') return 0
  // matrix(a, b, c, d, tx, ty) — tx is the 5th value.
  const match = /matrix\(([^)]+)\)/.exec(transform)
  if (!match) return 0
  const parts = match[1].split(',').map((v) => parseFloat(v.trim()))
  return parts[4] ?? 0
}

/**
 * Keeps a row's CSS marquee animation running continuously: pauses it (via
 * a JS-toggled class, not by removing the animation) only while genuinely
 * off-screen or the tab is backgrounded, always resuming the moment either
 * condition clears — and a watchdog restarts the animation outright if its
 * position hasn't visibly changed while it should be playing (covers a
 * stuck animation from any cause, including a CSS :hover pause that never
 * cleared). Hover-to-pause itself stays pure CSS (see index.css), gated to
 * devices that can sustain a real :hover so a tap can never leave it
 * stuck; `matches(':hover')` here just lets the watchdog recognise that as
 * a legitimate pause instead of "stuck".
 */
function useMarqueeLifecycle(rowRef: React.RefObject<HTMLDivElement | null>) {
  const documentVisible = useDocumentVisible()
  const [offscreen, setOffscreen] = useState(false)

  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting), { threshold: 0 })
    observer.observe(row)
    return () => observer.disconnect()
  }, [rowRef])

  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    const tracks = row.querySelectorAll<HTMLElement>('.marquee-track')
    const paused = offscreen || !documentVisible
    tracks.forEach((t) => {
      t.classList.toggle(JS_PAUSED_CLASS, paused)
      t.style.willChange = paused ? 'auto' : 'transform'
    })
  }, [offscreen, documentVisible, rowRef])

  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    let lastX: number[] = []
    const id = window.setInterval(() => {
      const shouldPlay = !offscreen && documentVisible && !row.matches(':hover')
      if (!shouldPlay) {
        lastX = []
        return
      }
      const tracks = Array.from(row.querySelectorAll<HTMLElement>('.marquee-track'))
      const currentX = tracks.map(readTranslateX)
      const stuck =
        lastX.length === currentX.length && currentX.every((x, i) => Math.abs(x - lastX[i]) < 0.5)
      if (stuck && tracks.length > 0) {
        if (import.meta.env.DEV) {
          console.warn('[Marquee] watchdog: row appeared stuck while it should be playing — restarting it')
        }
        tracks.forEach((t) => {
          t.style.animation = 'none'
          void t.offsetHeight // force reflow so the removal actually takes effect before re-enabling
          t.style.animation = ''
        })
        lastX = []
        return
      }
      lastX = currentX
    }, WATCHDOG_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [offscreen, documentVisible, rowRef])
}

function BrandRow({ row, direction, speed }: { row: Brand[]; direction: 'left' | 'right'; speed: number }) {
  const rowRef = useRef<HTMLDivElement>(null)
  useCenterHighlight(rowRef)
  useMarqueeLifecycle(rowRef)

  return (
    <div ref={rowRef}>
      <Marquee
        speed={speed}
        reverse={direction === 'right'}
        gapClassName="gap-6"
        className="brand-panel-mask"
        items={row.map((brand, i) => (
          <BrandLogo
            key={`${brand.name}-${i}`}
            src={brand.logo}
            alt={`${brand.name} logo`}
            fallbackLabel={brand.name}
            plate={brand.plate}
            className={PANEL_TILE}
          />
        ))}
      />
    </div>
  )
}

const BrandPanel = forwardRef<HTMLDivElement>(function BrandPanel(_props, ref) {
  const rows = ROW_CONFIG.map((_, rowIndex) => brands.filter((_, i) => i % ROW_CONFIG.length === rowIndex))

  return (
    <div
      ref={ref}
      className="mx-auto flex w-full max-w-[1080px] min-h-[460px] flex-col justify-center gap-6 rounded-2xl border border-line p-10 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
      style={{ backgroundColor: 'rgba(12,15,19,0.72)' }}
    >
      {ROW_CONFIG.map((cfg, i) => (
        <BrandRow key={i} row={rows[i]} direction={cfg.direction} speed={cfg.speed} />
      ))}
    </div>
  )
})

export default BrandPanel
