import { useState } from 'react'

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
 */
export default function BrandLogo({ src, alt, fallbackLabel, plate = 'light', className = '' }: BrandLogoProps) {
  const [failed, setFailed] = useState(false)
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
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="object-contain"
          style={{ width: '88%', height: '72%', imageRendering: 'auto' }}
        />
      )}
    </div>
  )
}
