import { Link } from 'react-router-dom'
import { brandSlug, catalogs } from '../../data/catalogs'
import { catalogTeaser } from '../../data/content'
import SmartImage from '../SmartImage'

const brandCount = new Set(catalogs.map((c) => c.brand)).size
const featured = catalogTeaser.featured.flatMap((id) => catalogs.find((c) => c.id === id) ?? [])

/**
 * A small homepage band pointing to the catalogs: a short header, a row of real catalog covers
 * (each opens that brand's catalogs) and a link to the full Catalogs page. Up to tablet width the
 * covers are a swipeable row; from lg up all five sit in one line.
 */
export default function CatalogTeaser() {
  const { eyebrow, heading, headingAccent, cta } = catalogTeaser
  const accentAt = heading.lastIndexOf(headingAccent)

  return (
    <section id="catalogs" className="story-line bg-surface py-20 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 md:flex-row md:items-end md:justify-between md:px-12">
        <div className="flex flex-col gap-4">
          <div className="eyebrow flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-accent" />
            {eyebrow}
          </div>
          {/* role=heading rather than <h2>: index.css has an unlayered h1-h4 rule that would
              override these utilities. */}
          <div role="heading" aria-level={2} data-rise className="font-display text-3xl font-light text-text md:text-4xl lg:text-5xl">
            {accentAt >= 0 ? (
              <>
                {heading.slice(0, accentAt)}
                <span className="text-accent-bright italic">{headingAccent}</span>
                {heading.slice(accentAt + headingAccent.length)}
              </>
            ) : (
              heading
            )}
          </div>
          <p className="max-w-md text-sm leading-relaxed font-light text-muted md:text-base">
            {catalogs.length} product catalogs from {brandCount} brands — tiles, sanitaryware, wellness, kitchens and more.
          </p>
        </div>
        <Link
          to={cta.to}
          data-magnetic
          className="self-start whitespace-nowrap rounded-full border border-accent px-7 py-3.5 text-xs tracking-[0.2em] text-accent-bright uppercase transition-colors duration-500 hover:bg-accent hover:text-bg! md:self-auto"
        >
          {cta.label}
        </Link>
      </div>

      <ul className="mx-auto mt-10 flex max-w-6xl snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:mt-12 md:px-12 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
        {featured.map((catalog) => (
          <li key={catalog.id} className="w-[62vw] max-w-64 shrink-0 snap-start lg:w-auto lg:max-w-none">
            <Link
              to={`/catalog/${brandSlug(catalog.brand)}`}
              className="group flex h-full flex-col overflow-hidden rounded-sm border border-line transition-colors duration-300 hover:border-accent"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <SmartImage
                  src={catalog.coverImage}
                  alt={catalog.title}
                  className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-1 p-4">
                <span className="text-[0.6rem] tracking-[0.18em] text-accent-bright uppercase">{catalog.brand}</span>
                <span className="font-display text-base leading-snug font-light text-text">{catalog.title}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
