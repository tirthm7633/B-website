import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { useEffect, useRef } from 'react'
import { hero } from '../../data/content'
import { prefersReducedMotion } from '../../lib/usePrefersReducedMotion'
import SmartImage from '../SmartImage'

gsap.registerPlugin(SplitText)

const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"

export default function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const split = new SplitText(headlineRef.current, { type: 'lines', linesClass: 'split-line' })
      gsap.set(split.lines, { yPercent: 110 })
      gsap.to(split.lines, {
        yPercent: 0,
        duration: 1.3,
        stagger: 0.12,
        ease: 'power4.out',
        delay: 0.5,
      })

      gsap.fromTo(
        '.hero-fade',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 1.2, delay: 1.3, stagger: 0.12, ease: 'power2.out' },
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section id="top" className="relative flex min-h-svh flex-col justify-end overflow-hidden px-6 pb-20 md:px-12">
      <div className="absolute inset-0">
        <SmartImage
          src={hero.image.src}
          alt={hero.image.alt}
          objectPosition={hero.image.objectPosition}
          eager
          className="hero-kenburns h-full w-full"
        />
        <div className="pointer-events-none absolute inset-0 bg-[#050607]/62" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(5,6,7,0.72) 100%)' }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{ backgroundImage: `url("${GRAIN}")` }}
        />
      </div>

      <div className="hero-fade eyebrow absolute top-28 left-6 flex items-center gap-2 md:left-12">
        <span className="h-1 w-1 rounded-full bg-accent" />
        {hero.eyebrow}
      </div>

      <h1 ref={headlineRef} className="max-w-4xl font-tagline text-[17vw] leading-[1.05] text-text md:text-[8vw]">
        {hero.headline}
      </h1>

      <div className="hero-fade mt-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
        <p className="max-w-md text-base font-light text-muted">{hero.subtext}</p>
        <div className="flex flex-wrap items-center gap-8">
          <a
            href={hero.primaryCta.href}
            className="rounded-full border border-accent px-8 py-4 text-xs tracking-[0.2em] text-accent-bright uppercase transition-colors duration-500 hover:bg-accent hover:text-bg"
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

      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex">
        <span className="eyebrow text-[0.55rem]">Scroll</span>
        <div className="h-10 w-px overflow-hidden bg-line">
          <div className="scroll-hint-line h-full w-full bg-accent" />
        </div>
      </div>
    </section>
  )
}
