import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

interface ScaledDesktopCanvasProps {
  /** Fixed pixel width the children are laid out at — their own responsive
   * classes resolve exactly as they would on a real viewport this wide. */
  width: number
  children: ReactNode
}

/**
 * Renders `children` at a fixed desktop pixel width, then uniformly scales
 * the whole thing down via CSS transform to fit whatever width is actually
 * available — "shrinking a picture" rather than reflowing the content, so
 * the exact desktop composition (proportions, overlaps, everything) shows
 * at every size below 1280px. A ResizeObserver keeps the scale and height
 * in sync on resize/rotation. `transform` doesn't affect layout size, so
 * the outer wrapper's own height is set explicitly to the scaled height to
 * avoid leaving empty space (or overlap) in the page flow.
 */
export default function ScaledDesktopCanvas({ width, children }: ScaledDesktopCanvasProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const outer = outerRef.current
    const canvas = canvasRef.current
    if (!outer || !canvas) return

    const recompute = () => {
      const nextScale = Math.min(1, outer.getBoundingClientRect().width / width)
      setScale(nextScale)
      // offsetHeight reflects the canvas's own layout box, unaffected by
      // the transform:scale() applied to it — the true "natural" height.
      outer.style.height = `${canvas.offsetHeight * nextScale}px`
    }

    recompute()

    const ro = new ResizeObserver(recompute)
    ro.observe(outer)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [width])

  return (
    <div ref={outerRef} className="relative mx-4 w-auto">
      <div
        ref={canvasRef}
        style={{ width, position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {children}
      </div>
    </div>
  )
}
