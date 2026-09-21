import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { gallery } from '../../data/content'
import { prefersReducedMotion } from '../../lib/usePrefersReducedMotion'
import SmartImage from '../SmartImage'

gsap.registerPlugin(ScrollTrigger)

// Repeats every 4 images to keep the grid feeling hand-laid-out rather than
// a uniform tile wall, however many photos content.ts ends up listing.
const PATTERN = [
  { col: 'md:col-span-7', aspect: 'aspect-[4/5]' },
  { col: 'md:col-span-5', aspect: 'aspect-[4/5]' },
  { col: 'md:col-span-5', aspect: 'aspect-[3/4]' },
  { col: 'md:col-span-7', aspect: 'aspect-[16/10]' },
]

export default function Gallery() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.gallery-media').forEach((el) => {
        gsap.to(el, {
          yPercent: -9,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="gallery" ref={sectionRef} className="border-t border-line px-6 py-32 md:px-12">
      <div className="eyebrow mb-6 flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-accent" />
        {gallery.eyebrow}
      </div>
      <h2 className="max-w-2xl font-display text-3xl font-light md:text-5xl">{gallery.heading}</h2>
      <p className="mt-4 max-w-xl text-sm font-light text-muted">{gallery.body}</p>

      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-12">
        {gallery.images.map((img, i) => {
          const pattern = PATTERN[i % PATTERN.length]
          return (
            <div
              key={img.src}
              className={`relative overflow-hidden ${pattern.aspect} ${pattern.col}`}
            >
              <SmartImage
                src={img.src}
                alt={img.alt}
                objectPosition={img.objectPosition}
                className="gallery-media h-[120%] w-full"
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
