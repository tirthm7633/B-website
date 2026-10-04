import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { categories } from '../../data/content'
import { prefersReducedMotion } from '../../lib/usePrefersReducedMotion'
import SmartImage from '../SmartImage'

gsap.registerPlugin(ScrollTrigger)

export default function Categories() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.category-card').forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            delay: (i % 5) * 0.08,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%' },
          },
        )
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="categories" ref={sectionRef} className="border-t border-line px-6 py-32 md:px-12">
      <div className="mb-16 flex items-center justify-between">
        <div className="eyebrow flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-accent" />
          What We Offer
        </div>
        <h2 className="hidden font-display text-2xl font-light md:block">Categories</h2>
      </div>

      <div className="grid grid-cols-1 gap-px overflow-hidden bg-line sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((category, i) => (
          <div
            key={category.slug}
            className="category-card group relative aspect-[3/4] overflow-hidden bg-bg"
          >
            <SmartImage
              src={category.image.src}
              alt={category.image.alt}
              objectPosition={category.image.objectPosition}
              className="h-full w-full scale-105 transition-transform duration-[1400ms] ease-out group-hover:scale-100"
            />
            {/* Light global tint (the photo itself reads bright), plus a local gradient behind each
                piece of text: top for the number, bottom for the name and description. */}
            <div className="pointer-events-none absolute inset-0 bg-[#050607]/6 transition-opacity duration-[1200ms] ease-out group-hover:opacity-40" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[26%] bg-gradient-to-b from-[#050607]/65 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050607]/80 via-[#050607]/30 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <span className="numerals font-display text-3xl font-extralight text-text/90">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-display text-xl leading-tight font-light text-text md:text-2xl">{category.name}</h3>
                <p className="mt-2 text-xs leading-relaxed text-text/80">{category.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
