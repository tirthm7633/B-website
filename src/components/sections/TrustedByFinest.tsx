import { useEffect, useRef, useState } from 'react'
import { architects, trustedByFinest } from '../../data/content'
import BrandPanel from '../BrandPanel'
import OrbitField from '../OrbitField'
import ScaledDesktopCanvas from '../ScaledDesktopCanvas'

// The fixed pixel width the panel+orbits composition is laid out at. Real
// viewports >=1280px render it directly, unscaled (pixel-identical to
// before). Below that, ScaledDesktopCanvas renders this exact same
// composition at this same fixed width, then uniformly shrinks it via CSS
// transform to fit — same picture, smaller, never rearranged.
const CANVAS_WIDTH = 1280

// Largest architect circle is 104px (see OrbitField's SIZES), so its
// radius is 52px; +8px buffer. Only used inside the scaled canvas — real
// desktop keeps OrbitField's own default (6px), unaffected.
const CIRCLE_EDGE_MARGIN = 60

function useIsDesktopComposition() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= CANVAS_WIDTH)
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= CANVAS_WIDTH)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return isDesktop
}

export default function TrustedByFinest() {
  const panelRef = useRef<HTMLDivElement>(null)
  const isDesktop = useIsDesktopComposition()

  // insideCanvas is a fixed choice per branch below (never changes for a
  // given mounted instance) — unlike `scale`, which starts at 1 and only
  // reaches its real value a moment after mount. edgeMargin feeds into
  // OrbitField's geometry effect, which only reads its props once on
  // mount, so it must not depend on something that starts wrong and
  // settles later.
  const composition = (scale: number, insideCanvas: boolean) => (
    <div className="relative">
      {/* Rendered before OrbitField on purpose: React attaches refs and
          fires layout effects sibling-by-sibling in DOM order, so the
          panel's ref must commit before OrbitField's effect reads it. */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="pointer-events-auto relative z-10 w-full">
          <BrandPanel ref={panelRef} />
        </div>
      </div>

      <OrbitField
        architects={architects}
        panelRef={panelRef}
        forceDesktop
        canvasScale={scale}
        edgeMargin={insideCanvas ? CIRCLE_EDGE_MARGIN : 6}
      />
    </div>
  )

  return (
    <section className="relative overflow-hidden border-t border-line bg-bg py-28 md:py-32" id="brands">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(95,125,156,0.10), transparent 60%)' }}
      />

      <div className="relative mb-4 flex flex-col items-center gap-4 px-6 text-center md:mb-6">
        <span className="eyebrow flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-accent" />
          {trustedByFinest.label}
        </span>
        <h2 className="max-w-2xl font-display text-3xl font-light text-text md:text-4xl lg:text-5xl">
          {trustedByFinest.headline}
        </h2>
      </div>

      {isDesktop ? (
        composition(1, false)
      ) : (
        <ScaledDesktopCanvas width={CANVAS_WIDTH}>{(scale) => composition(scale, true)}</ScaledDesktopCanvas>
      )}
    </section>
  )
}
