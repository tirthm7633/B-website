import { useEffect, useState } from 'react'

/**
 * True only for devices that can genuinely sustain a CSS/JS :hover state
 * (a mouse or trackpad). On a touchscreen, tapping an element can leave it
 * stuck in a synthetic "hover" state indefinitely (there's no real pointer
 * to leave with) — components gate their pause-on-hover behaviour behind
 * this so that never happens.
 */
export function useCanHover() {
  const [canHover, setCanHover] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  useEffect(() => {
    const mql = window.matchMedia('(hover: hover) and (pointer: fine)')
    const onChange = () => setCanHover(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])
  return canHover
}

/** Tracks document.visibilityState — false while the tab is backgrounded. */
export function useDocumentVisible() {
  const [visible, setVisible] = useState(() => document.visibilityState === 'visible')
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])
  return visible
}
