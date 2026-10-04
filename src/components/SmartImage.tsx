import { useState } from 'react'

interface SmartImageProps {
  src: string
  alt: string
  className?: string
  objectPosition?: string
  eager?: boolean
  /** Set false for logos/UI marks that shouldn't get the photo treatment. */
  overlay?: boolean
}

/**
 * Renders a real photo when it exists, otherwise a dark textured
 * placeholder — lets us wire up final `/public/images/...` paths ahead of
 * time. Every real photo gets the same cool, slightly desaturated grade
 * plus a light blue-black overlay so warm showroom lighting sits inside the
 * Obsidian Steel palette instead of fighting it.
 *
 * The grade is deliberately light: the photo should read bright and clear (together the
 * layers leave roughly half of a plain photo's untreated luminance, about 3x what they used
 * to). Anything that has to be legible over a photo (hero copy, category captions) gets its
 * own *local* gradient behind the text, in the component that owns the text, instead of
 * darkening the whole image here.
 */
export default function SmartImage({
  src,
  alt,
  className = '',
  objectPosition = 'center',
  eager = false,
  overlay = true,
}: SmartImageProps) {
  const [errored, setErrored] = useState(false)

  // An empty src is a deliberate "no photo yet" slot — same dark placeholder
  // as a failed load, without ever requesting a bogus URL.
  if (!src || errored) {
    return (
      <div role="img" aria-label={alt} className={`relative overflow-hidden bg-surface ${className}`}>
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'repeating-linear-gradient(135deg, rgba(232,236,241,0.05) 0px, rgba(232,236,241,0.05) 1px, transparent 1px, transparent 10px)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#161b22] via-[#0c0f13] to-[#050607]" />
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setErrored(true)}
        className="h-full w-full object-cover [filter:saturate(0.62)_contrast(1.05)_brightness(1.1)]"
        style={{ objectPosition }}
      />
      {overlay && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050607]/8 via-[#050607]/12 to-[#050607]/28" />
          <div className="pointer-events-none absolute inset-0 bg-[#2b3f57]/25 mix-blend-multiply" />
        </>
      )}
    </div>
  )
}
