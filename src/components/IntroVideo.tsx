import { useEffect, useRef, useState } from 'react'
import { markIntroDone, markIntroPlayed, pickIntroVariant, type IntroCut } from '../lib/intro'

// Not playing by then (slow network, decode trouble) → straight to the site.
const START_TIMEOUT_MS = 1500
// Autoplay refused (e.g. iOS Low Power Mode) → the poster (the film's final frame) shows briefly.
const POSTER_HOLD_MS = 800
const FADE_MS = 600

/**
 * The intro film (made in /intro-video, files in /public/intro), laid over the page — which is
 * already rendered underneath, so it is there the moment the film fades. The shape (16:9, 4:3,
 * 3:4, 9:16 — each re-composed, not cropped) and HD/LITE size are picked once at start and never
 * swapped on rotate. WebM first, MP4 fallback. Skip and Esc work from the first frame. Every
 * frame's edges are exactly the page background, so `object-fit: contain` letterboxing is
 * invisible on any screen.
 */
export default function IntroVideo({ cut, onComplete }: { cut: IntroCut; onComplete: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const leaveRef = useRef<() => void>(() => {})
  const [{ aspect, tier }] = useState(() => pickIntroVariant())
  const [leaving, setLeaving] = useState(false)
  const file = `/intro/intro-${cut === 'short' ? 'short-' : ''}${aspect}-${tier}`

  useEffect(() => {
    const root = rootRef.current
    const video = videoRef.current
    if (!root || !video) return
    let active = true
    let gone = false
    let playing = false
    const timers: number[] = []
    // Page scroll is locked on <html>, not <body>: the site's panels reset body overflow as they
    // mount. Wheel/touch on the film are swallowed before Lenis (listening on window) sees them.
    const html = document.documentElement
    const previousOverflow = html.style.overflow
    html.style.overflow = 'hidden'
    const swallow = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
    }
    root.addEventListener('wheel', swallow, { passive: false })
    root.addEventListener('touchmove', swallow, { passive: false })
    markIntroPlayed()

    const leave = () => {
      if (!active || gone) return
      gone = true
      video.pause()
      markIntroDone() // the page's own entrance (the hero headline) starts as the film fades
      setLeaving(true)
      timers.push(
        window.setTimeout(() => {
          html.style.overflow = previousOverflow
          onComplete()
        }, FADE_MS),
      )
    }
    leaveRef.current = leave

    const onPlaying = () => {
      playing = true
    }
    // Both sources failed (the error comes from each <source>, which doesn't bubble — hence capture).
    const onError = () => {
      if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) leave()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') leave()
    }
    video.addEventListener('playing', onPlaying)
    video.addEventListener('ended', leave)
    video.addEventListener('error', onError, true)
    window.addEventListener('keydown', onKey)

    // `muted` must be set as a property too: autoplay policies check the property.
    video.muted = true
    video.play().catch(() => {
      if (active && !gone) timers.push(window.setTimeout(leave, POSTER_HOLD_MS))
    })
    timers.push(
      window.setTimeout(() => {
        if (!playing) leave()
      }, START_TIMEOUT_MS),
    )

    return () => {
      active = false
      timers.forEach((t) => window.clearTimeout(t))
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('ended', leave)
      video.removeEventListener('error', onError, true)
      window.removeEventListener('keydown', onKey)
      root.removeEventListener('wheel', swallow)
      root.removeEventListener('touchmove', swallow)
      html.style.overflow = previousOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={rootRef}
      className="fixed left-0 top-0 z-[1000] w-full bg-bg"
      style={{ height: '100dvh', opacity: leaving ? 0 : 1, transition: `opacity ${FADE_MS}ms ease-out`, pointerEvents: leaving ? 'none' : undefined }}
      data-intro={`${cut} ${aspect} ${tier}`}
    >
      <video
        ref={videoRef}
        className="h-full w-full bg-bg object-contain"
        poster={`/intro/poster-${aspect}.jpg`}
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
        {...{ 'webkit-playsinline': '' }}
      >
        <source src={`${file}.webm`} type='video/webm; codecs="vp9"' />
        <source src={`${file}.mp4`} type='video/mp4; codecs="avc1.640028"' />
      </video>
      <button
        type="button"
        onClick={() => leaveRef.current()}
        aria-label="Skip intro"
        className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] min-h-11 min-w-16 rounded-full border border-white/20 bg-bg/45 px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-text/85 backdrop-blur-md transition-colors hover:border-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Skip
      </button>
    </div>
  )
}
