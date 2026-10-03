import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/usePrefersReducedMotion'
import Logo from './Logo'

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

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
    tl.to({}, { duration: 0.5 })

    return () => {
      tl.kill()
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-5 bg-bg">
      {/* The logo carries its own "Let you live better" tagline, so there's no separate tagline line. */}
      <div ref={logoRef}>
        <Logo className="h-[72px] md:h-24" />
      </div>
      <div ref={lineRef} className="h-px w-16 origin-center bg-accent" />
    </div>
  )
}
