import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/usePrefersReducedMotion'
import Logo from './Logo'

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) {
      onComplete()
      return
    }

    document.body.style.overflow = 'hidden'

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(overlayRef.current, {
          yPercent: -100,
          duration: 0.9,
          ease: 'power4.inOut',
          delay: 0.2,
          onComplete: () => {
            document.body.style.overflow = ''
            onComplete()
          },
        })
      },
    })

    tl.fromTo(logoRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' })
    tl.fromTo(lineRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, '-=0.35')
    tl.fromTo(taglineRef.current, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2')
    tl.to({}, { duration: 0.3 })

    return () => {
      tl.kill()
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-5 bg-bg">
      <div ref={logoRef}>
        <Logo className="h-12" />
      </div>
      <div ref={lineRef} className="h-px w-16 origin-center bg-accent" />
      <p ref={taglineRef} className="font-tagline text-4xl text-accent">
        Let you live better
      </p>
    </div>
  )
}
