import { useRef } from 'react'
import { architects, trustedByFinest } from '../../data/content'
import BrandPanel from '../BrandPanel'
import OrbitField from '../OrbitField'

export default function TrustedByFinest() {
  const panelRef = useRef<HTMLDivElement>(null)

  return (
    <section id="brands" className="relative overflow-hidden border-t border-line bg-bg py-28 md:py-32">
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

      <div className="relative">
        {/* Rendered before OrbitField on purpose: React attaches refs and
            fires layout effects sibling-by-sibling in DOM order, so the
            panel's ref must commit before OrbitField's effect reads it. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="pointer-events-auto relative z-10 w-full">
            <BrandPanel ref={panelRef} />
          </div>
        </div>

        <OrbitField architects={architects} panelRef={panelRef} />
      </div>
    </section>
  )
}
