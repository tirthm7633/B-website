import gsap from 'gsap'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Architect } from '../data/content'
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion'
import ArchitectPhoto from './ArchitectPhoto'

interface OrbitFieldProps {
  architects: Architect[]
  panelRef: React.RefObject<HTMLDivElement | null>
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

const SIZES = [
  { box: 'h-14 w-14 md:h-16 md:w-16 lg:h-[72px] lg:w-[72px]', text: 'text-[18px] md:text-[20px] lg:text-[22px]' },
  { box: 'h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24', text: 'text-[20px] md:text-[24px] lg:text-[28px]' },
  { box: 'h-[72px] w-[72px] md:h-[88px] md:w-[88px] lg:h-[104px] lg:w-[104px]', text: 'text-[22px] md:text-[28px] lg:text-[32px]' },
]

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

function OrbitLine({
  architects,
  itemRefs,
  labelRefs,
  reverse,
}: {
  architects: Architect[]
  itemRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
  labelRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
  reverse: boolean
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
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <div className="float-wrapper">
              <ArchitectPhoto architect={architect} boxClassName={size.box} textClassName={size.text} seed={i + (reverse ? 50 : 0)} />
            </div>
            <div
              ref={(el) => {
                labelRefs.current[id] = el
              }}
              className="orbit-label flex w-[76px] flex-col items-center transition-opacity duration-300 group-hover:opacity-100 md:w-24 lg:w-28"
            >
              <span className="w-full truncate text-center text-[10px] font-medium text-text md:text-[12px] lg:text-[13px]">{architect.name}</span>
              <span className="w-full truncate text-center text-[8px] tracking-[0.08em] text-muted uppercase md:text-[9px] md:tracking-[0.1em]">{architect.firm}</span>
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
 */
export default function OrbitField({ architects, panelRef }: OrbitFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const outerEllipseRef = useRef<SVGEllipseElement>(null)
  const innerEllipseRef = useRef<SVGEllipseElement>(null)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const labelRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const activeTweens = useRef<gsap.core.Tween[]>([])
  const reducedMotion = usePrefersReducedMotion()
  const [geometry, setGeometry] = useState<Geometry | null>(null)
  const [visible, setVisible] = useState(true)

  const line1 = architects.filter((_, i) => i % 2 === 0)
  const line2 = architects.filter((_, i) => i % 2 === 1)
  const MOBILE_CAP = 4
  const line1Rendered = geometry && geometry.arcFraction < 1 ? line1.slice(0, MOBILE_CAP) : line1
  const line2Rendered = geometry && geometry.arcFraction < 1 ? line2.slice(0, MOBILE_CAP) : line2

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    let ro: ResizeObserver | undefined
    let raf: number | undefined

    const compute = (panel: HTMLDivElement) => {
      const isMobile = window.innerWidth < 768
      const w = container.getBoundingClientRect().width
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

      const maxRx = w / 2 - 6
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

      const arcFraction = isMobile ? 0.5 : 1
      const h = Math.max(outerRy * 2 + 160, panel.offsetHeight + 260)
      setGeometry({ w, h, cx: w / 2, cy: h / 2, outerRx, outerRy, innerRx, innerRy, arcFraction })
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
  // GSAP on an inner wrapper) from the outer left/top orbital positioning,
  // so the two animations never fight over the same CSS property.
  useEffect(() => {
    if (reducedMotion || !geometry) return
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
    activeTweens.current.push(...tweens)
    return () => {
      tweens.forEach((t) => t.kill())
      activeTweens.current = activeTweens.current.filter((t) => !tweens.includes(t))
    }
  }, [reducedMotion, geometry, line1Rendered.length, line2Rendered.length])

  // Drive both orbits.
  useEffect(() => {
    if (!geometry) return
    const outerEl = outerEllipseRef.current
    const innerEl = innerEllipseRef.current
    const panel = panelRef.current
    if (!outerEl || !innerEl || !panel) return

    if (reducedMotion) {
      // Static, evenly-spaced positions — no animation.
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
            el.style.left = `${point.x}px`
            el.style.top = `${point.y}px`
            el.style.opacity = '1'
            const behind = point.x > box.left && point.x < box.right && point.y > box.top && point.y < box.bottom
            el.style.zIndex = behind ? '5' : '20'
            // Reduced-motion: never hide a label, even if its circle sits
            // behind the panel — there's no hover-to-reveal for a static
            // layout, so hiding would make that name permanently invisible.
            if (label) label.dataset.behind = 'false'
          }
        })
      }
      placeStatic(line1Rendered, outerEl, 'l1', 0)
      placeStatic(line2Rendered, innerEl, 'l2', staticPhase)
      return
    }

    if (!visible) return

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
        el.style.left = `${point.x}px`
        el.style.top = `${point.y}px`
        const opacity = edgeOpacity(frac, geometry.arcFraction)
        el.style.opacity = String(opacity)
        const behind = point.x > box.left && point.x < box.right && point.y > box.top && point.y < box.bottom
        el.style.zIndex = behind ? '5' : '20'
        if (label) label.dataset.behind = behind ? 'true' : 'false'
      })
    }

    // On the mobile partial-arc, phase-shift line 2 by half the used arc so
    // its circles occupy a different angular region than line 1's instead
    // of tracking radially alongside them (which read as overlapping).
    const line2Phase = geometry.arcFraction < 1 ? 0.5 : 0

    const outerState = { p: 0 }
    const innerState = { p: 0 }
    const outerTween = gsap.to(outerState, {
      p: 1,
      duration: 82,
      repeat: -1,
      ease: 'none',
      onUpdate: () => place(line1Rendered, outerEl, outerLen, 'l1', outerState.p, false, 0),
    })
    const innerTween = gsap.to(innerState, {
      p: 1,
      duration: 70,
      repeat: -1,
      ease: 'none',
      onUpdate: () => place(line2Rendered, innerEl, innerLen, 'l2', innerState.p, true, line2Phase),
    })

    activeTweens.current.push(outerTween, innerTween)
    return () => {
      outerTween.kill()
      innerTween.kill()
      activeTweens.current = activeTweens.current.filter((t) => t !== outerTween && t !== innerTween)
    }
  }, [geometry, reducedMotion, visible, line1Rendered, line2Rendered, panelRef])

  const pauseAll = () => activeTweens.current.forEach((t) => t.pause())
  const resumeAll = () => {
    if (!visible) return
    activeTweens.current.forEach((t) => t.resume())
  }

  if (!geometry) {
    // Reserve space (measured on first paint) so layout doesn't jump.
    return <div ref={containerRef} className="relative h-[420px] w-full md:h-[520px]" />
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: geometry.h }}
      onMouseEnter={pauseAll}
      onMouseLeave={resumeAll}
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

      <OrbitLine architects={line1Rendered} itemRefs={itemRefs} labelRefs={labelRefs} reverse={false} />
      <OrbitLine architects={line2Rendered} itemRefs={itemRefs} labelRefs={labelRefs} reverse={true} />
    </div>
  )
}
