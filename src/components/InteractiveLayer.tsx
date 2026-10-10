import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/usePrefersReducedMotion'

const INTERACTIVE = 'a, button, select, label, summary, [role="button"], [data-cursor]'
const TEXT_ENTRY = 'input, textarea, iframe, [contenteditable="true"]'
const MAGNET_PULL = 0.3 // share of the distance from the element's centre it leans toward the cursor
const MAGNET_MAX = 10 // px
const TILT_MAX = 6 // degrees

/**
 * Desktop-only interactive touches (mouse or trackpad, and not with reduced motion):
 *
 * - A steel-blue ring that trails the pointer (the normal cursor stays), grows and fills
 *   faintly over anything clickable, and hides over text fields, the map and outside the window.
 * - `[data-magnetic]` buttons lean a few pixels toward the pointer and spring back.
 * - `[data-tilt]` photos tilt gently in 3D toward the pointer.
 *
 * All of it hangs off a few document-level listeners, so marking an element is enough.
 */
export default function InteractiveLayer() {
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const ring = ringRef.current
    if (!finePointer || prefersReducedMotion() || !ring) return

    gsap.set(ring, { xPercent: -50, yPercent: -50 })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' })

    let magnet: HTMLElement | null = null
    let tilt: HTMLElement | null = null
    const release = (el: HTMLElement | null, props: gsap.TweenVars) => {
      if (el) gsap.to(el, { ...props, duration: 0.6, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' })
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      ringX(e.clientX)
      ringY(e.clientY)
      const target = e.target instanceof Element ? e.target : null
      const overText = !!target?.closest(TEXT_ENTRY)
      ring.classList.toggle('is-hidden', overText)
      ring.classList.toggle('is-active', !overText && !!target?.closest(INTERACTIVE))

      const nextMagnet = (target?.closest('[data-magnetic]') as HTMLElement | null) ?? null
      if (nextMagnet !== magnet) {
        release(magnet, { x: 0, y: 0 })
        magnet = nextMagnet
      }
      if (magnet) {
        const r = magnet.getBoundingClientRect()
        const dx = gsap.utils.clamp(-MAGNET_MAX, MAGNET_MAX, (e.clientX - (r.left + r.width / 2)) * MAGNET_PULL)
        const dy = gsap.utils.clamp(-MAGNET_MAX, MAGNET_MAX, (e.clientY - (r.top + r.height / 2)) * MAGNET_PULL)
        gsap.to(magnet, { x: dx, y: dy, duration: 0.35, ease: 'power3.out', overwrite: 'auto' })
      }

      const nextTilt = (target?.closest('[data-tilt]') as HTMLElement | null) ?? null
      if (nextTilt !== tilt) {
        release(tilt, { rotateX: 0, rotateY: 0 })
        tilt = nextTilt
      }
      if (tilt) {
        const r = tilt.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        gsap.to(tilt, { rotateY: px * TILT_MAX * 2, rotateX: -py * TILT_MAX * 2, transformPerspective: 900, duration: 0.5, ease: 'power3.out', overwrite: 'auto' })
      }
    }
    const onLeaveWindow = () => {
      ring.classList.add('is-hidden')
      release(magnet, { x: 0, y: 0 })
      release(tilt, { rotateX: 0, rotateY: 0 })
      magnet = tilt = null
    }
    const onDown = () => ring.classList.add('is-pressed')
    const onUp = () => ring.classList.remove('is-pressed')

    document.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeaveWindow)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('pointerup', onUp)
    return () => {
      document.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeaveWindow)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerup', onUp)
    }
  }, [])

  return <div ref={ringRef} aria-hidden="true" className="trail-cursor-ring is-hidden" />
}
