import gsap from 'gsap'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Architect } from '../data/content'
import { useCanHover, useDocumentVisible } from '../lib/useAnimationEnvironment'
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion'
import ArchitectPhoto from './ArchitectPhoto'

interface OrbitFieldProps {
  architects: Architect[]
  panelRef: React.RefObject<HTMLDivElement | null>
  /** When true, always computes as the desktop (full closed-loop) layout,
   * ignoring the real viewport width — used when this component is rendered
   * inside a fixed-width canvas that gets uniformly scaled down for smaller
   * screens (see ScaledDesktopCanvas), so the same two full orbits show at
   * every size instead of falling back to the narrow-viewport partial arc. */
  forceDesktop?: boolean
  /** The uniform scale the enclosing canvas is being shown at (1 = real
   * desktop, no scaling). Used to counter-scale the name/firm labels back
   * up so they stay legible when the whole composition is shrunk. */
  canvasScale?: number
  /** How far the outer ellipse's clamp keeps it from the canvas edge, in
   * canvas-width pixels (not visual/scaled pixels). The default (6) is
   * fine on a real viewport, where the ellipse curve itself is the only
   * thing that needs to stay in bounds. Inside a fixed-width canvas that
   * gets scaled down, a circle's own radius extends past that curve, so a
   * caller shrinking the canvas passes a larger value (roughly the largest
   * circle's radius plus a small buffer) to keep circles from overflowing
   * the canvas bounds — pixel-identical desktop is unaffected since 6 is
   * still the default there. */
  edgeMargin?: number
}

interface Geometry {
  w: number
  h: number
  cx: number
  cy: number
  outerRx: number
  outerRy: number
  innerRx: number
  innerRy: number
  /** 1 = full closed loop (desktop/tablet). <1 = a partial arc (mobile), fading at its two ends. */
  arcFraction: number
}

// Unprefixed (no responsive breakpoints): this is always the desktop size.
// At a real >=1280px viewport that's identical to before (the old md:/lg:
// classes already resolved to these exact values there). Below 1280px the
// whole composition renders at this same fixed size inside a canvas that
// gets uniformly scaled down (see ScaledDesktopCanvas) — so these must stay
// constant regardless of the real viewport, not shrink via their own
// breakpoint classes (which are viewport-relative, not canvas-relative).
const SIZES = [
  { box: 'h-[72px] w-[72px]', text: 'text-[22px]' },
  { box: 'h-24 w-24', text: 'text-[28px]' },
  { box: 'h-[104px] w-[104px]', text: 'text-[32px]' },
]

// If the tween's own progress() hasn't changed across two checks this far
// apart while it's supposed to be playing, something went wrong (an
// unexpected pause, a GSAP/ticker hiccup) — the watchdog restarts it.
const WATCHDOG_INTERVAL_MS = 2000

function fracFor(progress: number, offset: number, reverse: boolean, phase = 0) {
  let f = (progress + offset + phase) % 1
  if (f < 0) f += 1
  return reverse ? 1 - f : f
}

function edgeOpacity(frac: number, arcFraction: number) {
  if (arcFraction >= 0.999) return 1
  const fade = 0.06
  if (frac < fade) return frac / fade
  if (frac > 1 - fade) return (1 - frac) / fade
  return 1
}

/** Position via `transform` (GPU-composited), never `left`/`top` (layout-
 * triggering) — the base "centre on the point" offset and the animated
 * position are combined into one transform so nothing here ever forces a
 * layout pass on the animated frames. */
function placeItem(el: HTMLDivElement, x: number, y: number, opacity: number, zIndex: string) {
  el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
  el.style.opacity = String(opacity)
  el.style.zIndex = zIndex
}

function OrbitLine({
  architects,
  itemRefs,
  labelRefs,
  reverse,
  labelCounterScale,
  animating,
}: {
  architects: Architect[]
  itemRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
  labelRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
  reverse: boolean
  labelCounterScale: number
  /** Whether this line is actively being driven by a tween right now —
   * gates `will-change: transform`, which should not be left on elements
   * indefinitely once they're static or reduced-motion. */
  animating: boolean
}) {
  return (
    <>
      {architects.map((architect, i) => {
        const id = `${reverse ? 'l2' : 'l1'}-${architect.name}-${i}`
        const size = SIZES[i % SIZES.length]
        return (
          <div
            key={id}
            ref={(el) => {
              itemRefs.current[id] = el
            }}
            className="group absolute z-20 flex flex-col items-center gap-2"
            style={{ transform: 'translate(-50%, -50%)', willChange: animating ? 'transform' : undefined }}
          >
            <div className="float-wrapper" style={{ willChange: animating ? 'transform' : undefined }}>
              <ArchitectPhoto architect={architect} boxClassName={size.box} textClassName={size.text} seed={i + (reverse ? 50 : 0)} />
            </div>
            <div
              ref={(el) => {
                labelRefs.current[id] = el
              }}
              className="orbit-label flex w-28 flex-col items-center transition-opacity duration-300 group-hover:opacity-100"
              style={
                labelCounterScale !== 1
                  ? { transform: `scale(${labelCounterScale})`, transformOrigin: 'top center' }
                  : undefined
              }
            >
              <span className="w-full truncate text-center text-[13px] font-medium text-text">{architect.name}</span>
              <span className="orbit-firm w-full truncate text-center text-[9px] tracking-[0.1em] text-muted uppercase">
                {architect.firm}
              </span>
            </div>
          </div>
        )
      })}
    </>
  )
}

/**
 * Two concentric, opposite-rotating elliptical orbits of architect photos
 * framing the (separately rendered) brand panel. Positions are computed via
 * SVG ellipse getPointAtLength — arc-length parametrisation, so circles
 * stay evenly spaced along the curve even though it's an ellipse, not a
 * circle. On narrow viewports the same maths drives a partial arc instead
 * of a closed loop (a full ellipse doesn't fit at 375px), fading circles in
 * and out at the arc's two ends instead of a visible jump.
 *
 * The two orbit tweens are created once (per geometry/architect-list
 * change) and live for as long as that geometry is valid — visibility,
 * hover and tab-focus only ever pause/resume them in place (see
 * `applyPlayState`), never kill and recreate them, so the rotation is
 * continuous and never jumps back to its start position. A watchdog
 * catches the case where a tween ends up stuck anyway (see
 * WATCHDOG_INTERVAL_MS) and restarts it.
 */
export default function OrbitField({
  architects,
  panelRef,
  forceDesktop = false,
  canvasScale = 1,
  edgeMargin = 6,
}: OrbitFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const outerEllipseRef = useRef<SVGEllipseElement>(null)
  const innerEllipseRef = useRef<SVGEllipseElement>(null)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const orbitTweensRef = useRef<{ outer: gsap.core.Tween; inner: gsap.core.Tween } | null>(null)
  const floatTweensRef = useRef<gsap.core.Tween[]>([])
  const isHoveringRef = useRef(false)
  const reducedMotion = usePrefersReducedMotion()
  const canHover = useCanHover()
  const documentVisible = useDocumentVisible()
  const [geometry, setGeometry] = useState<Geometry | null>(null)
  const [visible, setVisible] = useState(true)

  const line1 = useMemo(() => architects.filter((_, i) => i % 2 === 0), [architects])
  const line2 = useMemo(() => architects.filter((_, i) => i % 2 === 1), [architects])
  const MOBILE_CAP = 4
  const arcFraction = geometry?.arcFraction
  const line1Rendered = useMemo(
    () => (arcFraction !== undefined && arcFraction < 1 ? line1.slice(0, MOBILE_CAP) : line1),
    [arcFraction, line1],
  )
  const line2Rendered = useMemo(
    () => (arcFraction !== undefined && arcFraction < 1 ? line2.slice(0, MOBILE_CAP) : line2),
    [arcFraction, line2],
  )

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    let ro: ResizeObserver | undefined
    let raf: number | undefined

    const compute = (panel: HTMLDivElement) => {
      const isMobile = !forceDesktop && window.innerWidth < 768
      // offsetWidth (not getBoundingClientRect, which reflects the
      // post-transform visual size) so this stays correct when the whole
      // composition sits inside an ancestor transform:scale() — see
      // ScaledDesktopCanvas, used below 1280px.
      const w = container.offsetWidth
      const panelHalfW = panel.offsetWidth / 2
      const panelHalfH = panel.offsetHeight / 2

      const marginOuterX = isMobile ? 26 : 150
      const marginOuterY = isMobile ? 70 : 110
      const marginInnerX = isMobile ? 8 : 70
      const marginInnerY = isMobile ? 40 : 55

      let outerRx = panelHalfW + marginOuterX
      let outerRy = panelHalfH + marginOuterY
      let innerRx = panelHalfW + marginInnerX
      let innerRy = panelHalfH + marginInnerY

      const maxRx = w / 2 - edgeMargin
      if (outerRx > maxRx) {
        const scale = maxRx / outerRx
        outerRx *= scale
        innerRx *= scale
      }

      // Keep both ellipses meaningfully wider than tall. The panel itself
      // can be quite tall on mobile (three stacked logo rows), which would
      // otherwise push ry past rx and turn the "wide dome" arc into a
      // narrow vertical sweep — bunching circles (and their name labels)
      // too close together instead of spacing them out horizontally.
      const maxRyRatio = isMobile ? 0.62 : 0.55
      outerRy = Math.min(outerRy, outerRx * maxRyRatio)
      innerRy = Math.min(innerRy, innerRx * maxRyRatio)

      const nextArcFraction = isMobile ? 0.5 : 1
      const h = Math.max(outerRy * 2 + 160, panel.offsetHeight + 260)
      setGeometry({ w, h, cx: w / 2, cy: h / 2, outerRx, outerRy, innerRx, innerRy, arcFraction: nextArcFraction })
    }

    // The panel is a sibling element measured via a ref passed down from
    // the parent. React attaches refs and fires layout effects
    // sibling-by-sibling in DOM order, so if this component ever ends up
    // rendered before the panel in the tree, panelRef.current would still
    // be null on the first pass here — poll a couple of frames instead of
    // silently giving up forever.
    const start = () => {
      const panel = panelRef.current
      if (!panel) {
        raf = requestAnimationFrame(start)
        return
      }
      compute(panel)
      ro = new ResizeObserver(() => compute(panel))
      ro.observe(container)
      ro.observe(panel)
    }
    start()

    return () => {
      if (raf !== undefined) cancelAnimationFrame(raf)
      ro?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Independent small float per circle — separate transform property (y via
  // GSAP on an inner wrapper) from the outer translate positioning, so the
  // two animations never fight over the same CSS property. Created once
  // per geometry/line change and then only ever paused/resumed, same as
  // the orbit tweens below.
  useEffect(() => {
    if (reducedMotion || !geometry) {
      floatTweensRef.current = []
      return
    }
    const wrappers = containerRef.current?.querySelectorAll<HTMLElement>('.float-wrapper')
    if (!wrappers) return
    const tweens = Array.from(wrappers).map((el, i) =>
      gsap.to(el, {
        y: 6 + (i % 3) * 3,
        x: (i % 2 === 0 ? 1 : -1) * (3 + (i % 4)),
        duration: 6 + (i % 5),
        delay: (i % 7) * 0.3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      }),
    )
    floatTweensRef.current = tweens
    applyPlayState()
    return () => {
      tweens.forEach((t) => t.kill())
      floatTweensRef.current = floatTweensRef.current.filter((t) => !tweens.includes(t))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, geometry, line1Rendered.length, line2Rendered.length])

  // Reduced motion: static, evenly-spaced positions, no animation at all.
  useEffect(() => {
    if (!geometry || !reducedMotion) return
    const outerEl = outerEllipseRef.current
    const innerEl = innerEllipseRef.current
    const panel = panelRef.current
    if (!outerEl || !innerEl || !panel) return

    const box = {
      left: geometry.cx - panel.offsetWidth / 2 - 24,
      right: geometry.cx + panel.offsetWidth / 2 + 24,
      top: geometry.cy - panel.offsetHeight / 2 - 24,
      bottom: geometry.cy + panel.offsetHeight / 2 + 24,
    }
    const staticPhase = geometry.arcFraction < 1 ? 0.5 : 0
    const placeStatic = (list: Architect[], ellipseEl: SVGEllipseElement, prefix: string, phase: number) => {
      const totalLen = ellipseEl.getTotalLength()
      const n = list.length
      list.forEach((architect, i) => {
        const id = `${prefix}-${architect.name}-${i}`
        const frac = ((i / n + phase) % 1) * geometry.arcFraction
        const point = ellipseEl.getPointAtLength(frac * totalLen)
        const el = itemRefs.current[id]
        const label = labelRefs.current[id]
        if (el) {
          const behind = point.x > box.left && point.x < box.right && point.y > box.top && point.y < box.bottom
          placeItem(el, point.x, point.y, 1, behind ? '5' : '20')
          // Reduced-motion: never hide a label, even if its circle sits
          // behind the panel — there's no hover-to-reveal for a static
          // layout, so hiding would make that name permanently invisible.
          if (label) label.dataset.behind = 'false'
        }
      })
    }
    placeStatic(line1Rendered, outerEl, 'l1', 0)
    placeStatic(line2Rendered, innerEl, 'l2', staticPhase)
  }, [geometry, reducedMotion, line1Rendered, line2Rendered, panelRef])

  // Drive both orbits. Created once per [geometry, architect list] and then
  // left alone — visibility/hover/tab-focus only pause/resume it via
  // applyPlayState, never recreate it, so rotation position is preserved
  // continuously (no restart-from-zero jump) across any number of
  // scroll-away/scroll-back or tab-switch cycles.
  useEffect(() => {
    if (!geometry || reducedMotion) {
      orbitTweensRef.current = null
      return
    }
    const outerEl = outerEllipseRef.current
    const innerEl = innerEllipseRef.current
    const panel = panelRef.current
    if (!outerEl || !innerEl || !panel) return

    const outerLen = outerEl.getTotalLength()
    const innerLen = innerEl.getTotalLength()
    const panelBox = () => ({
      left: geometry.cx - panel.offsetWidth / 2 - 24,
      right: geometry.cx + panel.offsetWidth / 2 + 24,
      top: geometry.cy - panel.offsetHeight / 2 - 24,
      bottom: geometry.cy + panel.offsetHeight / 2 + 24,
    })

    const place = (
      list: Architect[],
      ellipseEl: SVGEllipseElement,
      totalLen: number,
      prefix: string,
      progress: number,
      reverse: boolean,
      phase: number,
    ) => {
      const n = list.length
      if (n === 0) return
      const box = panelBox()
      list.forEach((architect, i) => {
        const id = `${prefix}-${architect.name}-${i}`
        const frac = fracFor(progress, i / n, reverse, phase)
        const point = ellipseEl.getPointAtLength(frac * geometry.arcFraction * totalLen)
        const el = itemRefs.current[id]
        const label = labelRefs.current[id]
        if (!el) return
        const opacity = edgeOpacity(frac, geometry.arcFraction)
        const behind = point.x > box.left && point.x < box.right && point.y > box.top && point.y < box.bottom
        placeItem(el, point.x, point.y, opacity, behind ? '5' : '20')
        if (label) label.dataset.behind = behind ? 'true' : 'false'
      })
    }

    // On the mobile partial-arc, phase-shift line 2 by half the used arc so
    // its circles occupy a different angular region than line 1's instead
    // of tracking radially alongside them (which read as overlapping).
    const line2Phase = geometry.arcFraction < 1 ? 0.5 : 0

    // A bad frame (e.g. a transient null ref) must not take the whole
    // ticker down with it — GSAP doesn't guard onUpdate itself.
    const safeOnUpdate = (fn: () => void) => () => {
      try {
        fn()
      } catch (err) {
        if (import.meta.env.DEV) console.warn('[OrbitField] onUpdate threw, skipping this frame', err)
      }
    }

    const outerState = { p: 0 }
    const innerState = { p: 0 }
    const outerTween = gsap.to(outerState, {
      p: 1,
      duration: 82,
      repeat: -1,
      ease: 'none',
      onUpdate: safeOnUpdate(() => place(line1Rendered, outerEl, outerLen, 'l1', outerState.p, false, 0)),
    })
    const innerTween = gsap.to(innerState, {
      p: 1,
      duration: 70,
      repeat: -1,
      ease: 'none',
      onUpdate: safeOnUpdate(() => place(line2Rendered, innerEl, innerLen, 'l2', innerState.p, true, line2Phase)),
    })

    orbitTweensRef.current = { outer: outerTween, inner: innerTween }
    applyPlayState()

    return () => {
      outerTween.kill()
      innerTween.kill()
      orbitTweensRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry, reducedMotion, line1Rendered, line2Rendered])

  /** The single source of truth for "should this be moving right now" —
   * combines every pause reason (off-screen, tab hidden, hovering) into
   * one play()/pause() call per tween, instead of each reason fighting
   * over the tweens independently. */
  function applyPlayState() {
    const shouldPlay = visible && documentVisible && !isHoveringRef.current
    const tweens = orbitTweensRef.current
    if (tweens) {
      if (shouldPlay) {
        tweens.outer.play()
        tweens.inner.play()
      } else {
        tweens.outer.pause()
        tweens.inner.pause()
      }
    }
    floatTweensRef.current.forEach((t) => (shouldPlay ? t.play() : t.pause()))
  }

  useEffect(() => {
    applyPlayState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, documentVisible])

  // Watchdog: if a tween that should be playing hasn't visibly progressed
  // across a full interval, something paused it outside this component's
  // own control (or GSAP's ticker hiccuped) — nudge it back to life.
  useEffect(() => {
    if (!geometry || reducedMotion) return
    let lastProgress = -1
    const id = window.setInterval(() => {
      const shouldPlay = visible && documentVisible && !isHoveringRef.current
      if (!shouldPlay) {
        lastProgress = -1
        return
      }
      const tweens = orbitTweensRef.current
      if (!tweens) return
      const p = tweens.outer.progress()
      if (p === lastProgress) {
        if (import.meta.env.DEV) {
          console.warn('[OrbitField] watchdog: orbit appeared stuck while it should be playing — restarting it')
        }
        tweens.outer.play()
        tweens.inner.play()
        floatTweensRef.current.forEach((t) => t.play())
      }
      lastProgress = p
    }, WATCHDOG_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [geometry, reducedMotion, visible, documentVisible])

  const handleMouseEnter = () => {
    if (!canHover) return
    isHoveringRef.current = true
    applyPlayState()
  }
  const handleMouseLeave = () => {
    if (!canHover) return
    isHoveringRef.current = false
    applyPlayState()
  }
  // Defensive clear for the "stuck hover" class of bug this whole pause
  // path is meant to avoid: if a touch/pen pointer ever does leave a
  // hover-pause engaged (only possible if canHover briefly matched, e.g.
  // a hybrid device), releasing anywhere always clears it.
  const clearHoverPause = () => {
    if (!isHoveringRef.current) return
    isHoveringRef.current = false
    applyPlayState()
  }

  if (!geometry) {
    // Reserve space (measured on first paint) so layout doesn't jump.
    return <div ref={containerRef} className="relative h-[520px] w-full" />
  }

  // Counter-scale the labels back up so they stay legible when the whole
  // canvas is shrunk by an ancestor transform: font-size effectively
  // divided by the canvas scale, capped so text never looks oversized.
  const labelCounterScale = canvasScale >= 1 ? 1 : Math.min(1 / canvasScale, 1.6)
  const animating = !reducedMotion

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: geometry.h }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchEnd={clearHoverPause}
      onTouchCancel={clearHoverPause}
    >
      <svg
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
        viewBox={`0 0 ${geometry.w} ${geometry.h}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <ellipse
          ref={outerEllipseRef}
          cx={geometry.cx}
          cy={geometry.cy}
          rx={geometry.outerRx}
          ry={geometry.outerRy}
          fill="none"
          stroke="rgba(95,125,156,0.14)"
          strokeWidth={1}
        />
        <ellipse
          ref={innerEllipseRef}
          cx={geometry.cx}
          cy={geometry.cy}
          rx={geometry.innerRx}
          ry={geometry.innerRy}
          fill="none"
          stroke="rgba(95,125,156,0.14)"
          strokeWidth={1}
        />
      </svg>

      <OrbitLine
        architects={line1Rendered}
        itemRefs={itemRefs}
        labelRefs={labelRefs}
        reverse={false}
        labelCounterScale={labelCounterScale}
        animating={animating}
      />
      <OrbitLine
        architects={line2Rendered}
        itemRefs={itemRefs}
        labelRefs={labelRefs}
        reverse={true}
        labelCounterScale={labelCounterScale}
        animating={animating}
      />
    </div>
  )
}
