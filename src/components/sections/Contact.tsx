import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useEffect, useRef } from 'react'
import { contact } from '../../data/content'
import { prefersReducedMotion } from '../../lib/usePrefersReducedMotion'
import { DirectionsIcon, PhoneIcon, WhatsAppIcon } from '../ActionIcons'
import SmartImage from '../SmartImage'

gsap.registerPlugin(ScrollTrigger, SplitText)

const buttonClass =
  'flex items-center justify-center gap-3 border border-line px-6 py-5 text-xs tracking-[0.2em] text-text uppercase transition-colors duration-500 hover:border-accent hover:text-accent-bright'

export default function Contact() {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      const split = new SplitText(headingRef.current, { type: 'lines', linesClass: 'split-line' })
      gsap.fromTo(
        split.lines,
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 1.1,
          stagger: 0.1,
          ease: 'power4.out',
          scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
        },
      )
    })
    return () => ctx.revert()
  }, [])

  return (
    <section id="contact" className="relative overflow-hidden border-t border-line px-6 py-32 md:px-12">
      <div className="eyebrow mb-10 flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-accent" />
        Visit Us
      </div>

      <div className="grid grid-cols-1 gap-16 md:grid-cols-[1.1fr_1fr] md:gap-24">
        <div>
          <h2 ref={headingRef} className="font-display text-[9vw] leading-[1.05] font-light md:text-[3.6vw]">
            Come see it in person.
          </h2>

          <p className="mt-6 max-w-md text-base font-light text-muted">
            {contact.address.line1}
            <br />
            {contact.address.line2}
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <a href={contact.phoneHref} className={buttonClass}>
              <PhoneIcon className="h-4 w-4" />
              Call Now
            </a>
            <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer" className={buttonClass}>
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
            <a href={contact.directionsHref} target="_blank" rel="noopener noreferrer" className={buttonClass}>
              <DirectionsIcon className="h-4 w-4" />
              Directions
            </a>
          </div>

          <div className="mt-16">
            <h3 className="eyebrow mb-4 text-[0.6rem]">Opening Hours</h3>
            <ul className="space-y-2">
              {contact.hours.map((h) => (
                <li key={h.days} className="flex justify-between gap-6 border-b border-line pb-2 text-sm">
                  <span className="text-text">{h.days}</span>
                  <span className="text-muted">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <h3 className="eyebrow mb-4 text-[0.6rem]">Connect</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={contact.phoneHref} className="text-text hover:text-accent">
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={contact.instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text hover:text-accent"
                >
                  {contact.instagramHandle} on Instagram
                </a>
              </li>
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className="text-text hover:text-accent">
                    {contact.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="relative aspect-[4/3]">
            <div className="pointer-events-none absolute -top-4 -right-4 h-full w-full border border-accent/50" />
            <SmartImage
              src={contact.exteriorImage.src}
              alt={contact.exteriorImage.alt}
              objectPosition={contact.exteriorImage.objectPosition}
              className="relative h-full w-full"
            />
          </div>

          <a
            href={contact.directionsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="overflow-hidden border border-line"
          >
            <iframe
              title="Buildcon House location map"
              src={contact.mapEmbedSrc}
              className="pointer-events-none h-[260px] w-full grayscale invert-[0.92] contrast-[1.1]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              tabIndex={-1}
            />
          </a>
        </div>
      </div>
    </section>
  )
}
