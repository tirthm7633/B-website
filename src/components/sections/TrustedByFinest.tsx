import { useEffect, useState } from 'react'
import { trustedByFinest } from '../../data/content'
import BrandPanel from '../BrandPanel'
import ScaledDesktopCanvas from '../ScaledDesktopCanvas'

// The fixed pixel width the brand panel is laid out at. Real viewports
// >=1280px render it directly, unscaled. Below that, ScaledDesktopCanvas
// renders the same panel at this same fixed width, then uniformly shrinks
// it via CSS transform to fit — same picture, smaller, never rearranged.
const CANVAS_WIDTH = 1280

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
  const isDesktop = useIsDesktopComposition()

  return (
    <section className="relative overflow-hidden border-t border-line bg-bg py-28 md:py-32" id="brands">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(95,125,156,0.10), transparent 60%)' }}
      />

      <div className="relative mb-10 flex flex-col items-center gap-4 px-6 text-center md:mb-14">
        <span className="eyebrow flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-accent" />
          {trustedByFinest.label}
        </span>
        <h2 className="max-w-2xl font-display text-3xl font-light text-text md:text-4xl lg:text-5xl">
          {trustedByFinest.headline}
        </h2>
      </div>

      {isDesktop ? (
        <BrandPanel />
      ) : (
        <ScaledDesktopCanvas width={CANVAS_WIDTH}>
          <BrandPanel />
        </ScaledDesktopCanvas>
      )}
    </section>
  )
}
