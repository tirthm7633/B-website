import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useEffect, type RefObject } from 'react'
import { prefersReducedMotion } from './usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger, SplitText)

/**
 * Scroll storytelling for a page, driven by markers in its markup (all optional):
 *
 * - `data-rise`     heading: its words rise into place, one after another, the first time it
 *                   scrolls into view (each line masks its words).
 * - `data-unfold`   photo frame: opens from a thin horizontal line at its middle while the
 *                   picture inside settles from a slight zoom. `data-unfold="stagger"` on a
 *                   container unfolds its direct children one after another instead.
 * - `.story-line`   section with a top hairline (index.css): the line draws across from the
 *                   left when the section arrives.
 * - `data-draw-y`   vertical line: grows downwards in step with the scroll (the Our Journey
 *                   timeline), and its row's `[data-draw-dot]` lights up once reached.
 *
 * Everything plays once (except the scrubbed lines) and nothing is hidden before this runs:
 * the hidden starting states only apply under `html.story-ready`, which is set here, so with
 * reduced motion or a script failure the page simply shows complete.
 */
export function useScrollStory(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    document.documentElement.classList.add('story-ready')

    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>('[data-rise]').forEach((el) => {
        const split = SplitText.create(el, { type: 'lines,words', mask: 'lines', linesClass: 'story-rise-line' })
        gsap.from(split.words, {
          yPercent: 115,
          duration: 1,
          stagger: 0.06,
          ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        })
      })

      const unfold = (el: HTMLElement, delay = 0) => {
        const img = el.querySelector('img')
        const tl = gsap.timeline({ delay, scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
        tl.fromTo(el, { clipPath: 'inset(50% 0% 50% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25, ease: 'power3.inOut', clearProps: 'clipPath' })
        if (img) tl.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.6, ease: 'power3.out', clearProps: 'scale' }, 0)
      }
      root.querySelectorAll<HTMLElement>('[data-unfold]').forEach((el) => {
        if (el.dataset.unfold === 'stagger') {
          Array.from(el.children).forEach((child, i) => unfold(child as HTMLElement, (i % 5) * 0.09))
        } else {
          unfold(el)
        }
      })

      root.querySelectorAll<HTMLElement>('.story-line').forEach((el) => {
        ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => el.classList.add('is-drawn') })
      })

      root.querySelectorAll<HTMLElement>('[data-draw-y]').forEach((line) => {
        const row = line.closest('li') ?? line.parentElement
        gsap.fromTo(
          line,
          { scaleY: 0 },
          { scaleY: 1, ease: 'none', scrollTrigger: { trigger: row, start: 'top 62%', end: 'bottom 62%', scrub: 0.6 } },
        )
        const dot = row?.querySelector('[data-draw-dot]')
        if (dot) {
          // Stays lit once reached; only scrolling back above the milestone switches it off.
          ScrollTrigger.create({
            trigger: row,
            start: 'top 62%',
            onEnter: () => dot.classList.add('is-lit'),
            onLeaveBack: () => dot.classList.remove('is-lit'),
          })
        }
      })
    }, root)

    // Images and fonts settling after mount shift positions; re-measure once they have.
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    const t = window.setTimeout(refresh, 1200)
    return () => {
      window.removeEventListener('load', refresh)
      window.clearTimeout(t)
      ctx.revert()
    }
  }, [rootRef])
}
