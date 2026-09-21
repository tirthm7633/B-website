import { useState } from 'react'
import type { Architect } from '../data/content'

interface ArchitectPhotoProps {
  architect: Architect
  boxClassName: string
  textClassName: string
  seed: number
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

/**
 * A round architect photo. Falls back to a graphite/steel-blue gradient
 * monogram (no broken image, no console error) if the file at `photo` is
 * missing or fails to load — every current entry in content.ts uses this
 * fallback until real photos are supplied. The gradient angle varies per
 * person (via `seed`) so a row of placeholders doesn't look repetitive.
 */
export default function ArchitectPhoto({ architect, boxClassName, textClassName, seed }: ArchitectPhotoProps) {
  const [failed, setFailed] = useState(false)
  const angle = (seed * 47) % 360

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full border-2 border-accent shadow-[0_6px_20px_rgba(0,0,0,0.35)] transition-colors duration-300 group-hover:border-accent-bright ${boxClassName}`}
    >
      {failed ? (
        <div
          className={`flex h-full w-full items-center justify-center font-display text-text ${textClassName}`}
          style={{ background: `linear-gradient(${angle}deg, #12161C, rgba(95,125,156,0.35))` }}
        >
          {initialsOf(architect.name)}
        </div>
      ) : (
        <img
          src={architect.photo}
          alt={`${architect.name}, ${architect.firm}`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  )
}
