import { useState } from 'react'
import { Link } from 'react-router-dom'
import { gallery } from '../../data/content'
import Lightbox from '../projects/Lightbox'
import SmartImage from '../SmartImage'

// Homepage teaser: only the photos flagged `featured` in content.ts (all the
// same orientation, so the row stays uniform). The full set lives on /gallery.
const featured = gallery.images.filter((photo) => photo.featured)

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <section id="gallery" className="story-line px-6 py-32 md:px-12">
      <div className="eyebrow mb-6 flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-accent" />
        {gallery.eyebrow}
      </div>
      <h2 data-rise className="max-w-2xl font-display text-3xl font-light md:text-5xl">{gallery.heading}</h2>
      <p className="mt-4 max-w-xl text-sm font-light text-muted">{gallery.body}</p>

      <div data-unfold="stagger" className="mt-16 grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
        {featured.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setLightboxIndex(i)}
            aria-label={`Enlarge photo: ${photo.alt}`}
            data-tilt
            className="group relative block aspect-[2/3] overflow-hidden"
          >
            <SmartImage
              src={photo.preview}
              alt={photo.alt}
              objectPosition={photo.objectPosition}
              className="h-full w-full transition-transform duration-700 group-hover:scale-[1.04]"
            />
          </button>
        ))}
      </div>

      <div className="mt-14 flex justify-center">
        <Link
          to={gallery.cta.to}
          data-magnetic
          className="rounded-full border border-accent px-8 py-4 text-xs tracking-[0.2em] text-accent-bright uppercase transition-colors duration-500 hover:bg-accent hover:text-bg!"
        >
          {gallery.cta.label}
        </Link>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={featured.map((photo) => photo.src)}
          index={lightboxIndex}
          alt="Buildcon House showroom"
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  )
}
