import { useEffect, useRef } from 'react'

// Overlays can stack (Brands panel -> brand detail -> photo viewer). A plain
// window keydown listener per overlay would make a single Escape press close
// all of them at once, so each overlay registers here and only the most
// recently opened one reacts.
const layers: symbol[] = []

export function useEscapeLayer(active: boolean, onEscape: () => void) {
  const latest = useRef(onEscape)
  useEffect(() => {
    latest.current = onEscape
  })

  useEffect(() => {
    if (!active) return
    const id = Symbol('escape-layer')
    layers.push(id)

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      if (layers[layers.length - 1] !== id) return
      e.preventDefault()
      latest.current()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      const index = layers.indexOf(id)
      if (index >= 0) layers.splice(index, 1)
    }
  }, [active])
}
