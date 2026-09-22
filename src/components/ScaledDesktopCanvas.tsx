import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

interface ScaledDesktopCanvasProps {
  /** Fixed pixel width the children are laid out at — their own responsive
   * classes resolve exactly as they would on a real viewport this wide. */
  width: number
  children: ReactNode | ((scale: number) => ReactNode)
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
 *
 * The wrapper's height is written directly to the DOM (not via React
 * state): the canvas's content (OrbitField) settles its own real height
 * one commit after its own first paint (it renders a shorter placeholder
 * until its geometry finishes computing), so a single read taken in this
 * component's own layout effect can land before that settle — observed
 * directly, that stale read then never got corrected by the resize
 * observer alone. A short poll after mount guarantees the final height is
 * picked up regardless of exactly when that settle happens.
 */
export default function ScaledDesktopCanvas({ width, children }: ScaledDesktopCanvasProps) {
  const outerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const outer = outerRef.current
    const canvas = canvasRef.current
    if (!outer || !canvas) return

    let currentScale = 1

    const applyHeight = () => {
      // offsetHeight reflects the canvas's own layout box, unaffected by
      // the transform:scale() applied to it — the true "natural" height.
      outer.style.height = `${canvas.offsetHeight * currentScale}px`
    }

    const recomputeScale = () => {
      const outerWidth = outer.getBoundingClientRect().width
      currentScale = Math.min(1, outerWidth / width)
      setScale(currentScale)
      applyHeight()
    }

    recomputeScale()

    const ro = new ResizeObserver(recomputeScale)
    ro.observe(outer)
    ro.observe(canvas)

    // Safety net for the initial settle race described above: a few
    // follow-up checks over the first second after mount, cheap and
    // idempotent (each just re-applies the current, by-then-correct,
    // height) so the wrapper never stays stuck at a pre-settle height.
    const timeouts = [50, 150, 300, 600, 1000].map((delay) => window.setTimeout(applyHeight, delay))

    return () => {
      ro.disconnect()
      timeouts.forEach((t) => window.clearTimeout(t))
    }
  }, [width])

  return (
    <div ref={outerRef} className="relative mx-4 w-auto">
      <div
        ref={canvasRef}
        style={{ width, position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {typeof children === 'function' ? children(scale) : children}
      </div>
    </div>
  )
}
