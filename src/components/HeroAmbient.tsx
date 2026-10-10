import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/usePrefersReducedMotion'

type Speck = { x: number; y: number; r: number; vx: number; vy: number; a: number; phase: number }

/**
 * A very quiet layer of movement over the hero photos: two soft steel-blue light beams that
 * sway slowly (CSS, .hero-ray in index.css) and a few dozen tiny specks of light drifting
 * upward like dust in a sunbeam (canvas). The canvas only animates while the hero is on screen
 * and the tab is visible, caps its pixel density, and is skipped entirely with reduced motion.
 */
export default function HeroAmbient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || prefersReducedMotion()) return

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    // One soft glow, drawn once and stamped for every speck (cheaper than a gradient per frame).
    const sprite = document.createElement('canvas')
    sprite.width = sprite.height = 32
    const sctx = sprite.getContext('2d')
    if (sctx) {
      const g = sctx.createRadialGradient(16, 16, 0, 16, 16, 16)
      g.addColorStop(0, 'rgba(226, 236, 246, 1)')
      g.addColorStop(0.35, 'rgba(160, 190, 220, 0.45)')
      g.addColorStop(1, 'rgba(127, 163, 199, 0)')
      sctx.fillStyle = g
      sctx.fillRect(0, 0, 32, 32)
    }
    let width = 0
    let height = 0
    let specks: Speck[] = []
    const spawn = (anywhere: boolean): Speck => ({
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : height + 10,
      r: 0.6 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -(0.08 + Math.random() * 0.22),
      a: 0.15 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
    })
    const resize = () => {
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(70, Math.max(24, (width * height) / 22000)))
      specks = Array.from({ length: count }, () => spawn(true))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let raf = 0
    let running = false
    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(now - last, 50) / 16.7
      last = now
      ctx.clearRect(0, 0, width, height)
      for (let i = 0; i < specks.length; i++) {
        const s = specks[i]
        s.x += s.vx * dt + Math.sin(now / 2400 + s.phase) * 0.08 * dt
        s.y += s.vy * dt
        if (s.y < -10 || s.x < -10 || s.x > width + 10) specks[i] = spawn(false)
        const twinkle = 0.65 + 0.35 * Math.sin(now / 900 + s.phase)
        const size = s.r * 8
        ctx.globalAlpha = s.a * twinkle
        ctx.drawImage(sprite, s.x - size / 2, s.y - size / 2, size, size)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    const setRunning = (on: boolean) => {
      if (on === running) return
      running = on
      if (on) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      } else {
        cancelAnimationFrame(raf)
      }
    }

    let inView = true
    const update = () => setRunning(inView && document.visibilityState === 'visible')
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      update()
    })
    io.observe(canvas)
    document.addEventListener('visibilitychange', update)
    update()

    return () => {
      setRunning(false)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  return (
    <div aria-hidden="true" className="hero-ambient pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-ray hero-ray-a" />
      <div className="hero-ray hero-ray-b" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  )
}
