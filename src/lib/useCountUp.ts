import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, type RefObject } from 'react'
import { prefersReducedMotion } from './usePrefersReducedMotion'

gsap.registerPlugin(ScrollTrigger)

/**
 * Counts every `.stat-value` inside `scopeRef` up from 0 to its `data-value`
 * when it scrolls into view (1.8s, ease-out, fires at 85% of the viewport).
 * With reduced motion it just shows the final numbers. Shared by the About
 * stats and the Why Us stats so the two behave identically.
 */
export function useCountUp(scopeRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const scope = scopeRef.current
    if (!scope) return

    if (prefersReducedMotion()) {
      scope.querySelectorAll<HTMLElement>('.stat-value').forEach((el) => {
        el.textContent = el.dataset.value ?? '0'
      })
      return
    }

    const ctx = gsap.context(() => {
      scope.querySelectorAll<HTMLElement>('.stat-value').forEach((el) => {
        const target = Number(el.dataset.value)
        const counter = { val: 0 }
        gsap.to(counter, {
          val: target,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
          onUpdate: () => {
            el.textContent = Math.floor(counter.val).toString()
          },
        })
      })
    }, scope)
    return () => ctx.revert()
  }, [scopeRef])
}
