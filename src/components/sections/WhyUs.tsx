import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { whyUs } from '../../data/content'
import { prefersReducedMotion } from '../../lib/usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger)

export default function WhyUs() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return

    const mm = gsap.matchMedia()

    mm.add('(min-width: 768px)', () => {
      const ctx = gsap.context(() => {
        const track = trackRef.current!
        const getDistance = () => track.scrollWidth - window.innerWidth

        gsap.to(track, {
          x: () => -getDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => `+=${getDistance()}`,
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
          },
        })
      }, sectionRef)

      return () => ctx.revert()
    })

    return () => mm.revert()
  }, [])

  return (
    <section id="why-us" ref={sectionRef} className="relative overflow-hidden border-t border-line py-32">
      <div className="eyebrow mb-16 flex items-center gap-2 px-6 md:px-12">
        <span className="h-1 w-1 rounded-full bg-accent" />
        {whyUs.eyebrow}
      </div>

      <div ref={trackRef} className="flex w-max gap-6 overflow-x-auto px-6 md:gap-10 md:overflow-visible md:px-12">
        {whyUs.steps.map((step) => (
          <div
            key={step.num}
            className="flex h-[50vh] w-[82vw] shrink-0 flex-col justify-between border border-line p-8 md:w-[32vw] md:p-10"
          >
            <span
              className="numerals font-display text-[7rem] leading-none font-light text-transparent md:text-[9rem]"
              style={{ WebkitTextStroke: '1.5px var(--color-accent)' }}
            >
              {step.num}
            </span>
            <div>
              <div className="mb-5 h-px w-12 bg-accent" />
              <h3 className="font-display text-3xl font-light text-text md:text-4xl">{step.title}</h3>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
