import { useState } from 'react'
import { site } from '../data/content'

interface LogoProps {
  className?: string
  showTagline?: boolean
  variant?: 'light' | 'dark'
}

/**
 * Tries the real logo file first (see content.ts `site.logo.src`). If it's
 * ever missing, falls back to a bold text wordmark that mirrors the brand
 * mark: "BUILDC" + a solid steel-blue ring standing in for the "O" + "N",
 * with "HOUSE" beneath in steel grey, and (optionally) the tagline in the
 * same script used in the real logo file.
 */
export default function Logo({ className = '', showTagline = false, variant = 'light' }: LogoProps) {
  const [errored, setErrored] = useState(false)
  const textColor = variant === 'light' ? 'text-text' : 'text-bg'

  if (!errored) {
    return (
      <img
        src={site.logo.src}
        alt={site.logo.alt}
        className={`w-auto object-contain ${className}`}
        onError={() => setErrored(true)}
      />
    )
  }

  return (
    <div
      className={`flex flex-col items-start justify-center ${className}`}
      style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
    >
      <div className={`flex items-center gap-[0.12em] font-wordmark font-bold uppercase ${textColor}`} style={{ letterSpacing: '0.12em' }}>
        <span>BUILDC</span>
        <span
          aria-hidden="true"
          className="relative inline-block rounded-full"
          style={{ height: '0.72em', width: '0.72em', background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-bright))' }}
        >
          <span
            className="absolute inset-[30%] rounded-full"
            style={{ backgroundColor: variant === 'light' ? 'var(--color-bg)' : 'var(--color-text)' }}
          />
        </span>
        <span>N</span>
      </div>
      <div
        className={`pl-[0.15em] font-wordmark font-semibold ${variant === 'light' ? 'text-muted' : 'text-bg/70'}`}
        style={{ fontSize: '0.4em', letterSpacing: '0.4em', marginTop: '0.15em' }}
      >
        HOUSE
      </div>
      {showTagline && (
        <div className="pl-[0.15em] font-tagline text-accent" style={{ fontSize: '1.3em', marginTop: '0.1em' }}>
          {site.tagline}
        </div>
      )}
    </div>
  )
}
