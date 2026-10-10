import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { site } from '../data/content'
import { markIntroDone } from '../lib/intro'

// Where things sit inside the 828x200 logo image (measured from public/images/logo.png), as
// percentages so they scale with the logo: the blue "O" and the three rows of the artwork.
const O_CENTER_X = 78.83
const O_CENTER_Y = 27.2
// The ring's viewBox is 100 wide and its outer edge is ~97 of that; the O is ~96px of the
// 200px-tall artwork, so the SVG is ~49.5% of the logo's height.
const O_DIAMETER_OF_HEIGHT = 49.5
const ROW1_BOTTOM = 48 // BUILDCON wordmark: rows 6–102 of 200
const ROW2_TOP = 51.5 // HOUSE: rows 104–130
const ROW2_BOTTOM = 66
const ROW3_TOP = 70 // "Let you live better": rows 143–192

/**
 * The opening logo animation (~3.3s), shown once per visit (see lib/intro.ts):
 * the blue "O" sweeps round as a ring, the BUILDCON wordmark wipes in from the left, HOUSE opens
 * from its centre, the tagline writes itself in, a hairline draws underneath, then the screen
 * parts like a curtain (top half up, bottom half down) to reveal the page. The logo is the real
 * image throughout; each row is that same image clipped to its band.
 */
export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    document.body.style.overflow = 'hidden'
    const q = gsap.utils.selector(root)

    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } })
    tl.set(q('.intro-logo'), { opacity: 1 })
      .fromTo(q('.intro-ring'), { strokeDashoffset: 192 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' })
      .fromTo(q('.intro-row1'), { clipPath: `inset(0% 100% ${100 - ROW1_BOTTOM}% 0%)` }, { clipPath: `inset(0% 0% ${100 - ROW1_BOTTOM}% 0%)`, duration: 1 }, 0.35)
      .to(q('.intro-ring-svg'), { opacity: 0, duration: 0.35, ease: 'power1.out' }, 1.05)
      .fromTo(
        q('.intro-row2'),
        { clipPath: `inset(${ROW2_TOP}% 50% ${100 - ROW2_BOTTOM}% 50%)` },
        { clipPath: `inset(${ROW2_TOP}% 0% ${100 - ROW2_BOTTOM}% 0%)`, duration: 0.7 },
        0.85,
      )
      .fromTo(q('.intro-row3'), { clipPath: `inset(${ROW3_TOP}% 100% 0% 0%)` }, { clipPath: `inset(${ROW3_TOP}% 0% 0% 0%)`, duration: 0.9, ease: 'power1.inOut' }, 1.15)
      .fromTo(q('.intro-line'), { scaleX: 0 }, { scaleX: 1, duration: 0.6 }, 1.55)
      .addLabel('open', '+=0.1')
      .add(() => markIntroDone(), 'open')
      .to(q('.intro-logo, .intro-line'), { opacity: 0, y: -10, duration: 0.45, ease: 'power2.in' }, 'open')
      .to(q('.intro-top'), { yPercent: -100, duration: 1, ease: 'power4.inOut' }, 'open+=0.1')
      .to(q('.intro-bottom'), { yPercent: 100, duration: 1, ease: 'power4.inOut' }, 'open+=0.1')
      .add(() => {
        document.body.style.overflow = ''
        onComplete()
      })

    return () => {
      tl.kill()
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const layer = 'absolute inset-0 h-full w-full select-none'
  return (
    <div ref={rootRef} className="fixed inset-0 z-[1000]" aria-hidden="true">
      <div className="intro-top absolute inset-x-0 top-0 h-1/2 bg-bg" />
      <div className="intro-bottom absolute inset-x-0 bottom-0 h-1/2 bg-bg" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
        {/* The logo's own aspect ratio, so the percentages above line up with the artwork. */}
        <div className="intro-logo relative h-[72px] opacity-0 md:h-24" style={{ aspectRatio: `${site.logo.width} / ${site.logo.height}` }}>
          <img src={site.logo.src} alt="" className={`intro-row1 ${layer}`} style={{ clipPath: 'inset(0 100% 100% 0)' }} />
          <img src={site.logo.src} alt="" className={`intro-row2 ${layer}`} style={{ clipPath: 'inset(0 50% 100% 50%)' }} />
          <img src={site.logo.src} alt="" className={`intro-row3 ${layer}`} style={{ clipPath: 'inset(0 100% 100% 0)' }} />
          {/* The "O" drawn as a thick ring stroke sweeping from the top, in the logo's blue; it
              fades out once the wordmark wipe has uncovered the real (textured) O beneath. */}
          <svg
            className="intro-ring-svg pointer-events-none absolute"
            viewBox="0 0 100 100"
            style={{ left: `${O_CENTER_X}%`, top: `${O_CENTER_Y}%`, height: `${O_DIAMETER_OF_HEIGHT}%`, aspectRatio: '1 / 1', transform: 'translate(-50%, -50%)' }}
          >
            <circle
              className="intro-ring"
              cx="50"
              cy="50"
              r="30.5"
              fill="none"
              stroke="#5d9bcd"
              strokeWidth="36"
              strokeDasharray="192"
              strokeDashoffset="192"
              transform="rotate(-90 50 50)"
            />
          </svg>
        </div>
        <div className="intro-line h-px w-16 origin-center bg-accent" style={{ transform: 'scaleX(0)' }} />
      </div>
    </div>
  )
}
