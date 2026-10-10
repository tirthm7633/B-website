import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { hero, heroSlides } from '../../data/content'
import { onIntroDone } from '../../lib/intro'
import { useDocumentVisible } from '../../lib/useAnimationEnvironment'
import { prefersReducedMotion } from '../../lib/usePrefersReducedMotion'
import { ChevronIcon } from '../ActionIcons'
import HeroAmbient from '../HeroAmbient'
import SmartImage from '../SmartImage'

gsap.registerPlugin(SplitText)

const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

// How long each photo stays before the next crossfades in. The progress line under the active
// indicator runs for the same time (see .hero-progress in index.css).
const AUTO_ADVANCE_MS = 6000
// The first two photos load with the page; the rest once it has settled.
const PRELOAD_REST_AFTER_MS = 3000
const SLIDE_COUNT = heroSlides.length
// Mouse parallax on desktop: how far (px) the photo layer drifts against the pointer.
const PARALLAX_PX = 14
const pad = (n: number) => String(n).padStart(2, '0')

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const parallaxRef = useRef<HTMLDivElement>(null)
  const [reducedMotion] = useState(prefersReducedMotion)

  const [index, setIndex] = useState(0)
  const [controlsActive, setControlsActive] = useState(false)
  const [inView, setInView] = useState(true)
  const documentVisible = useDocumentVisible()
  // Starts the slow zoom only after the first paint, so the opening photo zooms too.
  const [zoomReady, setZoomReady] = useState(false)
  const [preloadAll, setPreloadAll] = useState(false)

  const autoplay = !reducedMotion && inView && documentVisible && !controlsActive

  useEffect(() => {
    if (!autoplay) return
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % SLIDE_COUNT), AUTO_ADVANCE_MS)
    return () => window.clearTimeout(t)
  }, [autoplay, index])

  useEffect(() => {
    const id = requestAnimationFrame(() => setZoomReady(true))
    const t = window.setTimeout(() => setPreloadAll(true), PRELOAD_REST_AFTER_MS)
    return () => {
      cancelAnimationFrame(id)
      window.clearTimeout(t)
    }
  }, [])

  // Only cycle while the hero is on screen.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const goTo = useCallback((i: number) => {
    setPreloadAll(true)
    setIndex(((i % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT)
  }, [])

  const onControlsKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goTo(index - 1)
    else if (e.key === 'ArrowRight') goTo(index + 1)
  }

  // Entrance: held until the logo intro parts to reveal the page (or straight away when the
  // intro doesn't play), so the headline rises while it's actually visible.
  useEffect(() => {
    if (reducedMotion) return
    let unsubscribe = () => {}
    const ctx = gsap.context(() => {
      const split = new SplitText(headlineRef.current, { type: 'lines', linesClass: 'split-line' })
      const tl = gsap.timeline({ paused: true })
      tl.fromTo(split.lines, { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: 0.12, ease: 'power4.out' }, 0.15)
      tl.fromTo('.hero-fade', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.12, ease: 'power2.out' }, 0.7)
      unsubscribe = onIntroDone(() => tl.play())
    }, sectionRef)
    return () => {
      unsubscribe()
      ctx.revert()
    }
  }, [reducedMotion])

  // The photo layer drifts gently against the mouse (desktop pointers only).
  useEffect(() => {
    const layer = parallaxRef.current
    const section = sectionRef.current
    if (reducedMotion || !layer || !section || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const toX = gsap.quickTo(layer, 'x', { duration: 1.2, ease: 'power3.out' })
    const toY = gsap.quickTo(layer, 'y', { duration: 1.2, ease: 'power3.out' })
    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect()
      toX(-((e.clientX - r.left) / r.width - 0.5) * 2 * PARALLAX_PX)
      toY(-((e.clientY - r.top) / r.height - 0.5) * 2 * PARALLAX_PX)
    }
    const onLeave = () => {
      toX(0)
      toY(0)
    }
    section.addEventListener('pointermove', onMove)
    section.addEventListener('pointerleave', onLeave)
    return () => {
      section.removeEventListener('pointermove', onMove)
      section.removeEventListener('pointerleave', onLeave)
    }
  }, [reducedMotion])

  const current = heroSlides[index].category
  const nextIndex = (index + 1) % SLIDE_COUNT

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-svh flex-col overflow-hidden px-6 pt-28 pb-20 md:px-12"
    >
      <div className="absolute inset-0">
        {/* Slightly oversized so the mouse parallax never shows an edge. */}
        <div ref={parallaxRef} className="absolute -inset-5">
          {heroSlides.map((slide, i) =>
            preloadAll || i === index || i === nextIndex ? (
              <div
                key={slide.category.slug}
                aria-hidden={i !== index}
                className={`hero-slide absolute inset-0 ${i === index ? 'is-active' : ''} ${
                  i === index && zoomReady ? 'is-zooming' : ''
                }`}
              >
                <div className="hero-slide-zoom h-full w-full">
                  <SmartImage
                    src={slide.image.src}
                    alt={slide.image.alt}
                    objectPosition={slide.image.objectPosition}
                    eager
                    className="h-full w-full"
                  />
                </div>
              </div>
            ) : null,
          )}
        </div>
        {/* Light global treatment so the photo reads bright; legibility comes from the local
            gradients below (top: nav + eyebrow + phone caption, right: desktop caption,
            bottom: headline, subtext and buttons). */}
        <div className="pointer-events-none absolute inset-0 bg-[#050607]/6" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(5,6,7,0.25) 100%)' }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[34%] bg-gradient-to-b from-[#050607]/80 via-[#050607]/72 via-50% to-transparent lg:h-[42%] xl:h-[30%]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] bg-gradient-to-l from-[#050607]/60 via-[#050607]/25 to-transparent xl:block" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050607]/85 via-[#050607]/35 via-45% to-transparent" />
        <HeroAmbient />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{ backgroundImage: `url("${GRAIN}")` }}
        />
      </div>

      <div className="hero-fade eyebrow relative flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-accent" />
        {hero.eyebrow}
      </div>

      {/* The current collection, with 01/05, progress lines and arrows. Under the eyebrow up to
          1279px; on the right edge, vertically centred, from 1280px (narrower than that, the
          headline can reach across to it). The centring lives on this wrapper because GSAP takes
          over the inner .hero-fade's transform. Hovering or focusing the controls pauses the cycle. */}
      <div className="relative mt-6 w-full max-w-sm short-phone:mt-4 sm:mt-7 xl:absolute xl:top-[46%] xl:right-12 xl:mt-0 xl:w-80 xl:-translate-y-1/2">
        <div
          className="hero-fade"
          role="group"
          aria-roledescription="carousel"
          aria-label="Our collections"
          onPointerEnter={() => setControlsActive(true)}
          onPointerLeave={() => setControlsActive(false)}
          onFocus={() => setControlsActive(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setControlsActive(false)
          }}
          onKeyDown={onControlsKeyDown}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <p className="numerals shrink-0 font-display text-lg leading-none text-text" aria-hidden="true">
              {pad(index + 1)}
              <span className="text-muted"> / {pad(SLIDE_COUNT)}</span>
            </p>
            <div className="flex items-center gap-1.5">
              {heroSlides.map((slide, i) => (
                <button
                  key={slide.category.slug}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show ${slide.category.name}`}
                  aria-current={i === index}
                  className="group py-3"
                >
                  <span
                    className={`relative block h-[2px] overflow-hidden rounded-full transition-[width,background-color] duration-500 ${
                      i === index ? 'w-8 bg-text/25 sm:w-10' : 'w-3 bg-text/30 group-hover:bg-text/60 sm:w-5'
                    }`}
                  >
                    {i === index && (
                      <span
                        key={`${index}-${autoplay}`}
                        className={`absolute inset-0 origin-left bg-accent-bright ${autoplay ? 'hero-progress' : ''}`}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label="Previous collection"
                data-magnetic
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line sm:h-9 sm:w-9 text-text backdrop-blur-sm transition-colors duration-300 hover:border-accent-bright hover:text-accent-bright"
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label="Next collection"
                data-magnetic
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line sm:h-9 sm:w-9 text-text backdrop-blur-sm transition-colors duration-300 hover:border-accent-bright hover:text-accent-bright"
              >
                <ChevronIcon direction="right" />
              </button>
            </div>
          </div>

          <div key={index} className="hero-caption mt-3 tiny-phone:hidden sm:mt-4" aria-live={autoplay ? 'off' : 'polite'}>
            <p className="font-display text-xl leading-tight font-light text-text sm:text-2xl md:text-3xl">{current.name}</p>
            <p className="mt-1 text-[0.8rem] leading-snug text-text/75 short-phone:hidden sm:mt-1.5 sm:text-sm sm:leading-relaxed">
              {current.description}
            </p>
          </div>
        </div>
      </div>

      <div className="relative mt-auto pt-8 short-phone:pt-4">
        <h1 ref={headlineRef} className="max-w-4xl font-tagline text-[17vw] leading-[1.05] text-text md:text-[8vw]">
          {hero.headline}
        </h1>

        <div className="hero-fade mt-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <p className="max-w-md text-base font-light text-text/85">{hero.subtext}</p>
          <div className="flex flex-wrap items-center gap-8 short-phone:gap-y-5">
            <a
              href={hero.primaryCta.href}
              data-magnetic
              className="rounded-full border border-accent px-8 py-4 text-xs tracking-[0.2em] text-accent-bright uppercase transition-colors duration-500 hover:bg-accent hover:text-bg!"
            >
              {hero.primaryCta.label}
            </a>
            <a
              href={hero.secondaryCta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-xs tracking-[0.2em] text-text uppercase transition-colors duration-500 hover:text-accent-bright"
            >
              {hero.secondaryCta.label}
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex">
        <span className="eyebrow text-[0.55rem]">Scroll</span>
        <div className="h-10 w-px overflow-hidden bg-line">
          <div className="scroll-hint-line h-full w-full bg-accent" />
        </div>
      </div>
    </section>
  )
}
