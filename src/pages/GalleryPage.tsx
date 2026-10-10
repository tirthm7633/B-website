import { useEffect, useMemo, useRef, useState } from 'react'
import SmartImage from '../components/SmartImage'
import Lightbox from '../components/projects/Lightbox'
import { gallery, type GalleryPhoto } from '../data/content'
import { useScrollStory } from '../lib/useScrollStory'

// 1 column on phones, 2 from tablet width, 3 from desktop — same breakpoints as
// the rest of the site (md = 768px, lg = 1024px).
function currentColumnCount() {
  if (window.matchMedia('(min-width: 1024px)').matches) return 3
  if (window.matchMedia('(min-width: 768px)').matches) return 2
  return 1
}

function useColumnCount() {
  const [count, setCount] = useState(currentColumnCount)
  useEffect(() => {
    const queries = [window.matchMedia('(min-width: 768px)'), window.matchMedia('(min-width: 1024px)')]
    const update = () => setCount(currentColumnCount())
    queries.forEach((q) => q.addEventListener('change', update))
    return () => queries.forEach((q) => q.removeEventListener('change', update))
  }, [])
  return count
}

// Roughly one gap's worth of height (in column-width units) added per photo, so
// the balance accounts for the space between tiles as well as the photos.
const GAP_IN_COLUMN_WIDTHS = 0.06

/**
 * Masonry: each photo goes into whichever column is currently shortest, using
 * its real aspect ratio, so column heights stay within about one photo of each
 * other (CSS `columns` can't balance a mix of tall and wide photos and leaves
 * a big hole under the last column). Reading order stays left-to-right, and
 * `index` keeps each photo's place in the viewer sequence.
 */
function balanceColumns(photos: GalleryPhoto[], columnCount: number) {
  const columns = Array.from({ length: columnCount }, () => ({
    height: 0,
    items: [] as { photo: GalleryPhoto; index: number }[],
  }))
  photos.forEach((photo, index) => {
    const shortest = columns.reduce((best, column) => (column.height < best.height ? column : best))
    shortest.items.push({ photo, index })
    shortest.height += photo.height / photo.width + GAP_IN_COLUMN_WIDTHS
  })
  return columns
}

// Every photo at its own aspect ratio. Each tile reserves its space from the
// photo's real width/height (aspect-ratio), so lazy-loaded images never shift
// the layout.
export default function GalleryPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const photos = gallery.images
  const columnCount = useColumnCount()
  const columns = useMemo(() => balanceColumns(photos, columnCount), [photos, columnCount])
  const pageRef = useRef<HTMLDivElement>(null)
  useScrollStory(pageRef)

  return (
    <div ref={pageRef} className="min-h-screen bg-bg">
      <div className="px-6 pt-32 pb-10 text-center md:px-12 md:pt-40 md:pb-14">
        <span className="eyebrow">{gallery.page.eyebrow}</span>
        <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-light text-text md:text-5xl lg:text-6xl">
          {gallery.page.heading}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted">{gallery.page.body}</p>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-24 md:px-12">
        <div className="flex items-start gap-4 md:gap-5">
          {columns.map((column, c) => (
            <div key={c} className="flex min-w-0 flex-1 flex-col gap-4 md:gap-5">
              {column.items.map(({ photo, index }) => (
                <button
                  key={photo.src}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`Enlarge photo ${index + 1} of ${photos.length}: ${photo.alt}`}
                  data-unfold
                  data-tilt
                  className="group relative block w-full overflow-hidden"
                  style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
                >
                  <SmartImage
                    src={photo.preview}
                    alt={photo.alt}
                    className="h-full w-full transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={photos.map((photo) => photo.src)}
          index={lightboxIndex}
          alt="Buildcon House showroom"
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  )
}
