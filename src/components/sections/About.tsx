import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { about } from '../../data/content'
import { prefersReducedMotion } from '../../lib/usePrefersReducedMotion'
import CountUp from '../CountUp'
import SmartImage from '../SmartImage'

gsap.registerPlugin(ScrollTrigger)

const headingWords = about.heading.split(' ')
const accentWords = about.headingAccent.split(' ')
// Where the accent phrase starts in the heading (-1 if the two ever stop matching).
const accentStart = headingWords.findIndex((_, i) =>
  accentWords.every((word, j) => headingWords[i + j] === word),
)
const isAccent = (i: number) => accentStart >= 0 && i >= accentStart && i < accentStart + accentWords.length

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const reduced = prefersReducedMotion()

    const ctx = gsap.context(() => {
      if (reduced) return

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
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="about" ref={sectionRef} className="story-line bg-surface px-6 py-32 md:px-12">
      <div className="grid grid-cols-1 gap-16 md:grid-cols-2 md:gap-24">
        {/* self-start: the offset frame hugs the photo instead of stretching down to the
            height of the (taller, on tablet) text column beside it. */}
        <div className="relative self-start">
          <div className="pointer-events-none absolute -top-4 -left-4 h-full w-full border border-accent/50 md:-top-6 md:-left-6" />
          <div data-unfold className="relative aspect-[3/4] overflow-hidden">
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
            {/* One phrase is set in the serif italic, in steel blue, for emphasis. */}
            {headingWords.map((word, i) => (
              <span key={i} className={`word mr-2 inline-block ${isAccent(i) ? 'text-accent-bright italic' : ''}`}>
                {word}
              </span>
            ))}
          </p>

          <p className="mt-8 max-w-lg text-base leading-relaxed font-light text-muted">{about.body}</p>

          <div className="mt-16 grid grid-cols-2 gap-8">
            {about.stats.map((stat) => (
              <div key={stat.label} className="border-l border-line pl-4">
                <div className="numerals font-display text-4xl font-light text-text md:text-5xl">
                  <CountUp value={stat.value} />
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
