import { prefersReducedMotion } from './usePrefersReducedMotion'

/**
 * The logo intro (components/Preloader.tsx) plays once per browser tab session. Anything that
 * should start as the page is revealed (the hero headline) waits for `onIntroDone` instead of
 * guessing the intro's length.
 */
const SEEN_KEY = 'bh-intro-seen'
let done = false
const listeners = new Set<() => void>()

export function shouldPlayIntro() {
  if (prefersReducedMotion()) return false
  try {
    return !sessionStorage.getItem(SEEN_KEY)
  } catch {
    return true
  }
}

export function markIntroDone() {
  if (done) return
  done = true
  try {
    sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    // Private mode etc.: the intro simply plays again next time.
  }
  listeners.forEach((listener) => listener())
  listeners.clear()
}

/** Runs `callback` once the intro has revealed the page (straight away if it already has). */
export function onIntroDone(callback: () => void) {
  if (done) {
    callback()
    return () => {}
  }
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}
