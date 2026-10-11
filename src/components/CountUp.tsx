import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/usePrefersReducedMotion'

const DURATION_S = 1.8

const canAnimate = () => !prefersReducedMotion() && typeof IntersectionObserver !== 'undefined'

/**
 * A stat number (with its prefix/suffix, e.g. "10+") that counts up from 0 every time it scrolls
 * into view (1.8s, ease-out): going down, once its top passes ~85% of the viewport; coming back
 * up, as soon as it shows. Used by the About, Why Us and Brand Catalogs numbers; `count={false}`
 * shows it static (e.g. a year).
 *
 * It only resets once it is fully off screen, and only drops to 0 while still out of sight (in
 * the 30% band just beyond either edge), so the reset is never seen. Further away it shows the
 * real number — which is also what's on the page by default, so a slow script, a missed observer
 * or reduced motion can never leave a stat reading "0".
 *
 * Each number is in the page once: the animated digits are aria-hidden and the whole value is the
 * counter's accessible name, so screen readers hear "10+" once and never the in-between values.
 * (role="img" because aria-label on a plain span is ignored by most screen readers.)
 *
 * Every instance owns its own observers and tween, and the number it shows is React state, so it
 * can't drift out of sync with the DOM (an earlier section-level version that wrote textContent
 * left a re-mounted Why Us "18+" stuck at "0+").
 */
export default function CountUp({
  value,
  prefix = '',
  suffix = '',
  count = true,
  className,
}: {
  value: number
  prefix?: string
  suffix?: string
  count?: boolean
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  // How far along the count is, 0 to 1 (already eased). 1 = the final number.
  const [progress, setProgress] = useState(1)

  useEffect(() => {
    const el = ref.current
    if (!el || !count || !canAnimate()) return

    let tween: gsap.core.Tween | undefined
    let ready = true // will count the next time it comes into view
    let near = false // within 30% of the viewport, i.e. about to be seen

    const run = () => {
      ready = false
      tween?.kill()
      const counter = { p: 0 }
      setProgress(0)
      tween = gsap.to(counter, {
        p: 1,
        duration: DURATION_S,
        ease: 'power2.out',
        onUpdate: () => setProgress(counter.p),
        onComplete: () => setProgress(1),
      })
    }

    const start = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && ready) run()
      },
      { rootMargin: '0px 0px -15% 0px' },
    )
    // Fully off screen after a count: ready to count again next time.
    const visible = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting || ready) return
      tween?.kill()
      tween = undefined
      ready = true
      setProgress(near ? 0 : 1)
    })
    // While waiting: 0 when about to come into view (so the reset is never seen), final otherwise.
    const nearby = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting
        if (ready) setProgress(near ? 0 : 1)
      },
      { rootMargin: '30% 0px 30% 0px' },
    )
    nearby.observe(el)
    start.observe(el)
    visible.observe(el)
    return () => {
      start.disconnect()
      visible.disconnect()
      nearby.disconnect()
      tween?.kill()
    }
  }, [count])

  // Counted figures get thousands separators (15,000); static ones, like a year, print as written.
  const format = (n: number) => (count ? n.toLocaleString('en-IN') : String(n))
  const label = `${prefix}${format(value)}${suffix}`
  return (
    <span ref={ref} className={className} role="img" aria-label={label} data-value={value}>
      <span aria-hidden="true">
        {prefix}
        {format(Math.floor(value * progress))}
        {suffix}
      </span>
    </span>
  )
}
