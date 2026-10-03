import { site } from '../data/content'

interface LogoProps {
  className?: string
}

/**
 * The Buildcon House logo (see content.ts `site.logo`). Size it with a height
 * class — the width follows the image's own aspect ratio, and the width/height
 * attributes let the browser reserve that space before the file loads.
 */
export default function Logo({ className = '' }: LogoProps) {
  return (
    <img
      src={site.logo.src}
      alt={site.logo.alt}
      width={site.logo.width}
      height={site.logo.height}
      className={`w-auto object-contain ${className}`}
    />
  )
}
