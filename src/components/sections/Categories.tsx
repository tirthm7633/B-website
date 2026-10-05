import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../../data/content'
import { prefersReducedMotion } from '../../lib/usePrefersReducedMotion'
import { ArrowRightIcon } from '../ActionIcons'
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
        {/* Each card opens its category on the Catalog page. With a mouse, the description and
            arrow slide in on hover (or keyboard focus) while the photo darkens a little; touch
            screens show them all the time (.category-reveal in index.css). */}
        {categories.map((category, i) => (
          <Link
            key={category.slug}
            to={{ pathname: '/catalog', hash: `#catalog-${category.slug}` }}
            className="category-card group relative block aspect-[3/4] overflow-hidden bg-bg outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-bright"
          >
            <SmartImage
              src={category.image.src}
              alt={category.image.alt}
              objectPosition={category.image.objectPosition}
              className="h-full w-full scale-105 transition-transform duration-[1400ms] ease-out group-hover:scale-100"
            />
            {/* Light global tint (the photo itself reads bright), plus a local gradient behind each
                piece of text: top for the number, bottom for the name and description. */}
            <div className="pointer-events-none absolute inset-0 bg-[#050607]/6" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[26%] bg-gradient-to-b from-[#050607]/65 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050607]/80 via-[#050607]/30 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-[#050607]/0 transition-colors duration-300 ease-out group-hover:bg-[#050607]/30 group-focus-visible:bg-[#050607]/30" />

            <div className="absolute inset-0 flex flex-col justify-between p-6">
              <span className="numerals font-display text-3xl font-extralight text-text/90">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <div className="flex items-end justify-between gap-3">
                  <h3 className="font-display text-xl leading-tight font-light text-text md:text-2xl">{category.name}</h3>
                  <span className="category-arrow mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent-bright/60 text-accent-bright">
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="category-reveal">
                  <div>
                    <p className="category-reveal-text pt-2 text-xs leading-relaxed text-text/85">{category.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
