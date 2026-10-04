import { useEffect, useRef, useState } from 'react'

// Waits (ms) before each re-try of a logo that failed to load. After the last one the text
// fallback simply stays.
const RETRY_DELAYS_MS = [1500, 4000, 9000]

interface BrandLogoProps {
  src: string
  alt: string
  fallbackLabel: string
  plate?: 'light' | 'dark' | 'steel'
  className?: string
}

const PLATE_STYLES: Record<'light' | 'dark' | 'steel', { background: string; border: string }> = {
  light: { background: '#EDEFF2', border: 'rgba(255,255,255,0.08)' },
  dark: { background: '#0C0F13', border: 'var(--color-accent)' },
  steel: { background: '#1B222B', border: 'rgba(255,255,255,0.08)' },
}

/**
 * Renders a brand logo on a neutral "plate" so logos with white, dark or
 * transparent backgrounds all read consistently — no colour filtering, no
 * opacity below 1, no background removal: logos show in their real,
 * original colours at full opacity. The plate colour is set explicitly per
 * brand in content.ts, computed from each file's real average luminance
 * and WCAG contrast ratio — see scripts/audit-brand-logos.cjs and the
 * comment above the `brands` array.
 *
 * The image is sized to a fixed 88% width / 72% height of the tile (not
 * max-width/max-height) with object-fit: contain, so a small, gently
 * cropped source file is scaled UP by the browser to fill the tile — never
 * left tiny in a sea of plate background. No blur filter, no opacity below
 * 1: this is a plain CSS resize, so simple two-tone logos stay crisp.
 *
 * `data-brand-tile` is a hook for BrandPanel's center-highlight observer
 * (see components/BrandPanel.tsx) — it toggles a `.brand-tile-centered`
 * class directly on the DOM node rather than through a prop, since Marquee
 * renders every tile twice for its seamless loop.
 *
 * Falls back to a bold text plate (never a drawn logo) ONLY when the file
 * is missing or fails to load — never for size, blur, or contrast. A real
 * logo file always shows as an image.
 *
 * One failed request (a dropped connection, a blip while the site is deploying) must not
 * leave the text plate in place until the visitor reloads, so after a failure the logo is
 * re-requested a few times in the background (1.5s, 4s, 9s, plus straight away when the
 * browser comes back online) and swaps back in as soon as one succeeds. If the server says
 * the file isn't there (a 404/410, or HTML instead of an image — e.g. a brand with no logo
 * yet) the retries stop.
 */
export default function BrandLogo({ src, alt, fallbackLabel, plate = 'light', className = '' }: BrandLogoProps) {
  const [failed, setFailed] = useState(false)
  // The URL that finally worked (a cache-busted copy of `src`), tagged with the `src` it
  // belongs to so a changed `src` prop never shows a stale one.
  const [recovered, setRecovered] = useState<{ src: string; url: string } | null>(null)
  // A tall lockup (e.g. MCM Ittim's stacked "ittimi by MCM") would be left tiny in a wide tile
  // at the usual 72% height, so portrait logos get more of the tile's height.
  const [portrait, setPortrait] = useState(false)
  const tries = useRef(0)
  const missing = useRef(false)

  useEffect(() => {
    if (!failed) return
    let cancelled = false
    let timer: number | undefined

    function schedule() {
      if (cancelled || missing.current || tries.current >= RETRY_DELAYS_MS.length) return
      timer = window.setTimeout(retry, RETRY_DELAYS_MS[tries.current])
    }

    async function retry() {
      if (cancelled || missing.current) return
      tries.current += 1
      // A fresh URL, so the browser can't hand back a cached failure.
      const url = `${src}${src.includes('?') ? '&' : '?'}retry=${tries.current}`
      try {
        const res = await fetch(url, { method: 'HEAD', cache: 'no-store' })
        if (cancelled) return
        // A missing file can come back as a 404 or, behind the SPA's catch-all rewrite, as a
        // 200 that is really index.html — either way it isn't there, so stop trying.
        const isImage = (res.headers.get('content-type') ?? '').startsWith('image/')
        if (res.status === 404 || res.status === 410 || (res.ok && !isImage)) {
          missing.current = true
          return
        }
        if (res.ok) {
          setRecovered({ src, url })
          setFailed(false)
          return
        }
      } catch {
        // Offline or a network error: fall through and try again.
      }
      schedule()
    }

    // Back online: one more go straight away, even if the scheduled tries are used up.
    function onOnline() {
      window.clearTimeout(timer)
      tries.current = Math.min(tries.current, RETRY_DELAYS_MS.length - 1)
      void retry()
    }

    window.addEventListener('online', onOnline)
    schedule()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
      window.removeEventListener('online', onOnline)
    }
  }, [failed, src])

  const shownSrc = recovered?.src === src ? recovered.url : src
  const style = PLATE_STYLES[plate]
  const textColor = plate === 'light' ? '#0B0D10' : '#E8ECF1'

  return (
    <div
      data-brand-tile
      className={`flex items-center justify-center overflow-hidden rounded-[6px] border transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-bright ${className}`}
      style={{ backgroundColor: style.background, borderColor: style.border }}
    >
      {failed ? (
        // TODO: no logo file exists at `src` — drop a real asset (see
        // public/images/brands/README.md) to replace this text fallback.
        <span
          className="px-3 text-center leading-tight font-bold uppercase"
          style={{ color: textColor, letterSpacing: '0.16em', fontSize: 'clamp(20px, 2.2vw, 30px)' }}
        >
          {fallbackLabel}
        </span>
      ) : (
        <img
          src={shownSrc}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          onLoad={(e) => setPortrait(e.currentTarget.naturalHeight > e.currentTarget.naturalWidth * 1.15)}
          className="object-contain"
          style={{ width: '88%', height: portrait ? '88%' : '72%', imageRendering: 'auto' }}
        />
      )}
    </div>
  )
}
