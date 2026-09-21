import { forwardRef, useEffect, useRef } from 'react'
import { brands, type Brand } from '../data/content'
import BrandLogo from './BrandLogo'
import Marquee from './Marquee'

// Desktop tile bumped ~15% (220x104 -> 250x118) for more presence; tablet
// and mobile sizes are unchanged.
const PANEL_TILE = 'h-[76px] w-[150px] md:h-[88px] md:w-[180px] lg:h-[118px] lg:w-[250px]'
const CENTERED_CLASS = 'brand-tile-centered'

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
  })
}

function BrandRow({ row, direction, speed }: { row: Brand[]; direction: 'left' | 'right'; speed: number }) {
  const rowRef = useRef<HTMLDivElement>(null)
  useCenterHighlight(rowRef)

  return (
    <div ref={rowRef}>
      <Marquee
        speed={speed}
        reverse={direction === 'right'}
        gapClassName="gap-5 md:gap-6 lg:gap-6"
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
      className="mx-auto flex w-full max-w-[calc(100%-32px)] flex-col justify-center gap-5 rounded-2xl border border-line p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl md:max-w-[720px] md:gap-6 md:p-8 lg:max-w-[min(90%,1080px)] lg:min-h-[460px] lg:p-10"
      style={{ backgroundColor: 'rgba(12,15,19,0.72)' }}
    >
      {ROW_CONFIG.map((cfg, i) => (
        <BrandRow key={i} row={rows[i]} direction={cfg.direction} speed={cfg.speed} />
      ))}
    </div>
  )
})

export default BrandPanel
