import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { brandSlug, catalogs } from '../../data/catalogs'
import { catalogTeaser } from '../../data/content'
import { prefersReducedMotion } from '../../lib/usePrefersReducedMotion'
import CountUp from '../CountUp'
import SmartImage from '../SmartImage'

gsap.registerPlugin(ScrollTrigger)

const brandCount = new Set(catalogs.map((c) => c.brand)).size
const featured = catalogTeaser.featured.flatMap((id) => catalogs.find((c) => c.id === id) ?? [])

/**
 * A small homepage band pointing to the catalogs: a short header (its counts count up), a row of
 * real catalog covers (each opens that brand's catalogs) and a link to the full Catalogs page.
 * Up to tablet width the covers are a swipeable row; from lg up all five sit in one line.
 *
 * Motion (none with reduced motion):
 * - Arrival, once: from lg up the covers start stacked like a closed deck at the middle of the
 *   row and deal out to their places; below lg they rise in one after another. Then a sheen of
 *   light runs across them, like light catching glossy print.
 * - Desktop hover: the cover tilts toward the pointer (the site's [data-tilt]) with a glare that
 *   follows it, lifts, and picks up a soft steel-blue glow.
 * - A faint steel-blue glow behind the row drifts as the section scrolls past.
 */
export default function CatalogTeaser() {
  const sectionRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const { eyebrow, heading, headingAccent, cta } = catalogTeaser
  const accentAt = heading.lastIndexOf(headingAccent)

  useEffect(() => {
    const section = sectionRef.current
    const list = listRef.current
    if (!section || !list || prefersReducedMotion()) return

    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.catalog-card', list)
      const sheens = gsap.utils.toArray<HTMLElement>('.catalog-sheen', list)
      const sweep = () =>
        gsap.fromTo(sheens, { xPercent: -120, opacity: 1 }, { xPercent: 320, duration: 1.1, ease: 'power2.inOut', stagger: 0.12, onComplete: () => gsap.set(sheens, { opacity: 0 }) })
      const trigger = { trigger: list, start: 'top 82%', once: true }

      // The deck: every card starts at the row's middle, fanned slightly, and deals out to its slot.
      mm.add('(min-width: 1024px)', () => {
        const row = list.getBoundingClientRect()
        const middle = row.left + row.width / 2
        gsap.from(cards, {
          x: (_, el: HTMLElement) => middle - (el.getBoundingClientRect().left + el.offsetWidth / 2),
          y: 36,
          rotation: (i) => (i - (cards.length - 1) / 2) * 5,
          scale: 0.84,
          opacity: 0,
          duration: 1.6,
          ease: 'power3.inOut',
          stagger: { each: 0.1, from: 'center' },
          clearProps: 'transform,opacity',
          scrollTrigger: trigger,
          onComplete: sweep,
        })
      })
      mm.add('(max-width: 1023.98px)', () => {
        gsap.from(cards, {
          y: 48,
          rotation: 2,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.09,
          clearProps: 'transform,opacity',
          scrollTrigger: trigger,
          onComplete: sweep,
        })
      })

      // The glow behind the row drifts across as the section passes.
      gsap.fromTo('.catalog-glow', { xPercent: -18 }, { xPercent: 18, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1 } })
    }, section)

    // Glare that follows the pointer on the hovered cover (mouse/trackpad only).
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element).closest<HTMLElement>('[data-tilt]')
      if (!card) return
      const r = card.getBoundingClientRect()
      card.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`)
      card.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`)
    }
    if (finePointer) list.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      mm.revert()
      ctx.revert()
      list.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <section ref={sectionRef} id="catalogs" className="story-line overflow-hidden bg-surface py-20 md:py-24">
      <div
        aria-hidden="true"
        className="catalog-glow pointer-events-none absolute inset-x-0 bottom-0 h-3/4"
        style={{ background: 'radial-gradient(ellipse 45% 55% at 50% 70%, rgba(95,125,156,0.16), transparent 70%)' }}
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 md:flex-row md:items-end md:justify-between md:px-12">
        <div className="flex flex-col gap-4">
          <div className="eyebrow flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-accent" />
            {eyebrow}
          </div>
          {/* role=heading rather than <h2>: index.css has an unlayered h1-h4 rule that would
              override these utilities. */}
          <div role="heading" aria-level={2} data-rise className="font-display text-3xl font-light text-text md:text-4xl lg:text-5xl">
            {accentAt >= 0 ? (
              <>
                {heading.slice(0, accentAt)}
                <span className="text-accent-bright italic">{headingAccent}</span>
                {heading.slice(accentAt + headingAccent.length)}
              </>
            ) : (
              heading
            )}
          </div>
          <p className="max-w-md text-sm leading-relaxed font-light text-muted md:text-base">
            <CountUp value={catalogs.length} className="text-text" /> product catalogs from{' '}
            <CountUp value={brandCount} className="text-text" /> brands — tiles, sanitaryware, wellness, kitchens and more.
          </p>
        </div>
        <Link
          to={cta.to}
          data-magnetic
          className="self-start whitespace-nowrap rounded-full border border-accent px-7 py-3.5 text-xs tracking-[0.2em] text-accent-bright uppercase transition-colors duration-500 hover:bg-accent hover:text-bg! md:self-auto"
        >
          {cta.label}
        </Link>
      </div>

      <ul
        ref={listRef}
        className="relative mx-auto mt-10 flex max-w-6xl snap-x snap-mandatory gap-4 overflow-x-auto px-6 pt-2 pb-4 md:mt-12 md:px-12 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0"
      >
        {featured.map((catalog) => (
          <li
            key={catalog.id}
            className="catalog-card w-[62vw] max-w-64 shrink-0 snap-start transition-[translate] duration-500 ease-out hover:-translate-y-2 lg:w-auto lg:max-w-none"
          >
            <Link
              to={`/catalog/${brandSlug(catalog.brand)}`}
              data-tilt
              className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-line bg-surface transition-[border-color,box-shadow] duration-500 hover:border-accent hover:shadow-[0_28px_60px_-24px_rgba(95,125,156,0.55)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <SmartImage
                  src={catalog.coverImage}
                  alt={catalog.title}
                  className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {/* The sheen that runs across once the covers have landed. */}
                <span
                  aria-hidden="true"
                  className="catalog-sheen pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-12 opacity-0 mix-blend-screen"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1) 35%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.1) 65%, transparent)' }}
                />
              </div>
              <div className="flex flex-col gap-1 p-4">
                <span className="text-[0.6rem] tracking-[0.18em] text-accent-bright uppercase">{catalog.brand}</span>
                <span className="font-display text-base leading-snug font-light text-text">{catalog.title}</span>
              </div>
              {/* Glare following the pointer (position set by the pointermove handler above). */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: 'radial-gradient(circle at var(--gx, 50%) var(--gy, 30%), rgba(255,255,255,0.16), transparent 45%)' }}
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
