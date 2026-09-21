import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { about } from '../../data/content'
import { prefersReducedMotion } from '../../lib/usePrefersReducedMotion'
import SmartImage from '../SmartImage'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = prefersReducedMotion()

    const ctx = gsap.context(() => {
      if (reduced) {
        document.querySelectorAll<HTMLElement>('.stat-value').forEach((el) => {
          el.textContent = el.dataset.value ?? '0'
        })
        return
      }

      const words = textRef.current?.querySelectorAll('.word')
      gsap.fromTo(
        words ?? [],
        { opacity: 0.18 },
        {
          opacity: 1,
          stagger: 0.02,
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top 75%',
            end: 'bottom 55%',
            scrub: 0.6,
          },
        },
      )

      gsap.to(imageRef.current, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
      })

      gsap.utils.toArray<HTMLElement>('.stat-value').forEach((el) => {
        const target = Number(el.dataset.value)
        const counter = { val: 0 }
        gsap.to(counter, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
          onUpdate: () => {
            el.textContent = Math.floor(counter.val).toString()
          },
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={sectionRef} className="border-t border-line bg-surface px-6 py-32 md:px-12">
      <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-24">
        <div className="relative">
          <div className="pointer-events-none absolute -top-4 -left-4 h-full w-full border border-accent/50 md:-top-6 md:-left-6" />
          <div className="relative aspect-[3/4] overflow-hidden">
            <div ref={imageRef} className="absolute inset-x-0 -top-[9%] h-[118%]">
              <SmartImage
                src={about.image.src}
                alt={about.image.alt}
                objectPosition={about.image.objectPosition}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="eyebrow mb-8 flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-accent" />
            {about.eyebrow}
          </div>

          <p ref={textRef} className="font-display text-3xl leading-[1.2] font-light md:text-5xl">
            {about.heading.split(' ').map((word, i) => (
              <span key={i} className="word mr-2 inline-block">
                {word}
              </span>
            ))}
          </p>

          <p className="mt-8 max-w-lg text-base leading-relaxed font-light text-muted">{about.body}</p>

          <div className="mt-16 grid grid-cols-2 gap-8">
            {about.stats.map((stat) => (
              <div key={stat.label} className="border-l border-line pl-4">
                <div className="numerals font-display text-4xl font-light text-text md:text-5xl">
                  <span className="stat-value" data-value={stat.value}>
                    0
                  </span>
                  {stat.suffix}
                </div>
                <p className="eyebrow mt-2 text-[0.6rem]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
